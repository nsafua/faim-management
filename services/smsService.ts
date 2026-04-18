
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';
import { SMSConfig, SMSLog, SMSProvider } from '../types/system';

const CONFIG_DOC = 'settings/sms_gateway';
const LOGS_COL = 'sms_logs';

/**
 * Normalizes phone numbers to standard 10-digit format or international
 */
export const normalizePhone = (phone: string): string => {
    let p = phone.replace(/\D/g, '');
    if (p.length === 9) p = '0' + p;
    return p;
};

/**
 * Fetches the current SMS gateway configuration (CEO-only access enforced by Firestore rules)
 */
export const getSMSConfig = async (): Promise<SMSConfig | null> => {
    const snap = await getDoc(doc(db, CONFIG_DOC));
    return snap.exists() ? snap.data() as SMSConfig : null;
};

/**
 * Persists SMS gateway configuration
 */
export const saveSMSConfig = async (config: SMSConfig) => {
    await setDoc(doc(db, CONFIG_DOC), { 
        ...config, 
        updatedAt: new Date().toISOString() 
    });
};

/**
 * Dispatches an SMS via the configured provider conduit.
 * Enforces idempotency via correlationId.
 */
export const sendSMS = async (params: {
    toPhone: string;
    message: string;
    clientId?: number;
    correlationId: string;
}): Promise<{ success: boolean; status: SMSLog['status']; error?: string }> => {
    const { toPhone, message, clientId, correlationId } = params;
    const normalizedTo = normalizePhone(toPhone);

    if (!normalizedTo) {
        return { success: false, status: 'failed', error: 'Invalid or missing phone number' };
    }

    if (!message || message.trim().length === 0) {
        return { success: false, status: 'failed', error: 'Empty message body' };
    }

    // 1. Idempotency Check: Prevent duplicate dispatch for same correlationId
    const existingLogQuery = query(collection(db, LOGS_COL), where('correlationId', '==', correlationId), limit(1));
    const existingLogs = await getDocs(existingLogQuery);
    if (!existingLogs.empty) {
        const data = existingLogs.docs[0].data() as SMSLog;
        return { success: data.status === 'sent', status: 'duplicate', error: 'Request with this correlationId already processed' };
    }

    // 2. Fetch Conduit Configuration
    const config = await getSMSConfig();
    if (!config || config.provider === 'Disabled' || !config.isConnected) {
        await logSMS({ ...params, toPhone: normalizedTo, status: 'disabled', provider: 'Disabled' });
        return { success: false, status: 'disabled', error: 'SMS Gateway is currently disabled' };
    }

    try {
        let success = false;
        let errorReason = '';

        // 3. Route to Provider
        if (config.provider === 'mNotify') {
            const res = await dispatchMNotify(config, normalizedTo, message);
            success = res.success;
            errorReason = res.error || '';
        } else if (config.provider === 'Hubtel') {
            // Placeholder for Hubtel/Legacy integration
            errorReason = 'Hubtel strategy not yet implemented in conduit';
        } else {
            errorReason = 'Unknown provider strategy';
        }

        // 4. Audit Log
        await logSMS({
            ...params,
            toPhone: normalizedTo,
            status: success ? 'sent' : 'failed',
            provider: config.provider,
            errorReason
        });

        return { success, status: success ? 'sent' : 'failed', error: errorReason };

    } catch (e: any) {
        console.error("SMS Conduit Critical Error:", e);
        await logSMS({ ...params, toPhone: normalizedTo, status: 'failed', provider: config.provider, errorReason: e.message });
        return { success: false, status: 'failed', error: e.message };
    }
};

/**
 * mNotify specific dispatch logic
 */
async function dispatchMNotify(config: SMSConfig, to: string, msg: string) {
    try {
        const url = `${config.baseUrl || 'https://api.mnotify.com/api/sms/send'}?key=${config.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: [to],
                sender: config.senderId,
                message: msg,
                is_schedule: false
            })
        });

        const result = await response.json();
        // mNotify usually returns status: 'success' in body
        if (result.status === 'success' || result.code === '1000') {
            return { success: true };
        }
        return { success: false, error: result.message || 'mNotify API Error' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Internal logging for SMS audit trail
 */
async function logSMS(params: any) {
    const log: Omit<SMSLog, 'id'> = {
        clientId: params.clientId || null,
        toPhone: params.toPhone,
        correlationId: params.correlationId,
        status: params.status,
        provider: params.provider,
        messageHash: btoa(params.message).substring(0, 16), // Lightweight hash for auditing
        timestamp: new Date().toISOString(),
        errorReason: params.errorReason || null
    };
    await addDoc(collection(db, LOGS_COL), log);
}
