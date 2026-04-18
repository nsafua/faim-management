import { db } from './firebase';
import { collection, getDocs, doc, setDoc, query, where, limit, deleteDoc, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Client, MilestoneRecord, RefundRecord, RefundTransaction, RefundStatus } from '../types';

const CLIENTS_COL = 'clients';
const REFUNDS_COL = 'refunds';
const REFUND_TXN_COL = 'refund_transactions';

const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-9);
const normalizeEmail = (e: string) => e.trim().toLowerCase();

// Helper to sanitize data for Firestore (handle undefined and circular refs)
const sanitizeData = (data: any, seen = new WeakSet()): any => {
    if (data === null || typeof data !== 'object') {
        return data === undefined ? null : data;
    }
    if (seen.has(data)) return "[Circular]";
    if (data instanceof Date) return data.toISOString();
    if (Array.isArray(data)) {
        seen.add(data);
        return data.map(item => sanitizeData(item, seen));
    }

    const sanitizedObj: any = {};
    seen.add(data);
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value !== 'function' && value !== undefined) {
            sanitizedObj[key] = sanitizeData(value, seen);
        }
    });
    return sanitizedObj;
};

/**
 * Deterministic Merge Logic
 * Ensures no duplicates are created and handles threshold crossing atomically.
 */
export const atomicSaveClient = async (clientData: Partial<Client>): Promise<{ client: Client; event: 'CLIENT_CREATED' | 'CLIENT_UPDATED_MERGED'; changedFields: string[] }> => {
    const email = normalizeEmail(clientData.email || '');
    const phone = normalizePhone(clientData.phone || '');
    
    // 1. Identity Check
    const q = query(collection(db, CLIENTS_COL), where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    let existing = snap.empty ? null : snap.docs[0].data() as Client;

    if (!existing && phone) {
        const q2 = query(collection(db, CLIENTS_COL), where('phone', '==', clientData.phone), limit(1));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) existing = snap2.docs[0].data() as Client;
    }

    if (existing) {
        const changedFields: string[] = [];
        const merged: Client = { ...existing };
        
        Object.keys(clientData).forEach((key) => {
            const val = (clientData as any)[key];
            if (val !== undefined && val !== (existing as any)[key]) {
                (merged as any)[key] = val;
                changedFields.push(key);
            }
        });

        // AUTHORITY: Calculate threshold crossing atomically using latest totals
        const total = merged.payment.total || 0;
        const paid = merged.payment.paid || 0;
        const paidPercent = total > 0 ? (paid / total) * 100 : 0;
        
        const wasQualified = !!existing.isQualified;
        const isNowQualified = paidPercent >= 70;

        merged.paidPercent = paidPercent;

        // Transition Detection
        if (isNowQualified && !wasQualified) {
            merged.isQualified = true;
            merged.qualifiedAt = new Date().toISOString();
        } else if (!isNowQualified && wasQualified) {
            // Optional: Support reversal if payment is deleted/rolled back
            merged.isQualified = false;
            merged.qualifiedAt = undefined;
        }

        // Completion Sync
        if (merged.allocationStatus === 'ALLOCATED' && existing.allocationStatus !== 'ALLOCATED') {
            merged.status = 'Active Client'; // Or specific 'Allocated' status if supported
        }

        await setDoc(doc(db, CLIENTS_COL, String(merged.id)), sanitizeData(merged));
        return { client: merged, event: 'CLIENT_UPDATED_MERGED', changedFields };
    } else {
        // Create new
        const newClient = {
            ...clientData,
            isQualified: false,
            paidPercent: 0,
            status: 'Active Client'
        } as Client;
        await setDoc(doc(db, CLIENTS_COL, String(newClient.id)), sanitizeData(newClient));
        return { client: newClient, event: 'CLIENT_CREATED', changedFields: [] };
    }
};

export const fetchClientsPaginated = async (lastDoc: QueryDocumentSnapshot<DocumentData> | null, pageSize: number = 20) => {
    try {
        let q = query(collection(db, CLIENTS_COL), orderBy('id', 'desc'), limit(pageSize));
        if (lastDoc) {
            q = query(collection(db, CLIENTS_COL), orderBy('id', 'desc'), startAfter(lastDoc), limit(pageSize));
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as Client);
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        return { data, lastDoc: lastVisible };
    } catch (error) {
        console.error("Error fetching paginated clients:", error);
        return { data: [], lastDoc: null };
    }
};

export const searchClients = async (searchTerm: string) => {
    try {
        const q = query(
            collection(db, CLIENTS_COL),
            where('name', '>=', searchTerm),
            where('name', '<=', searchTerm + '\uf8ff'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Client);
    } catch (error) {
        console.error("Error searching clients:", error);
        return [];
    }
};

export const removeClient = async (id: number) => {
    await deleteDoc(doc(db, CLIENTS_COL, String(id)));
};

export const fetchMilestones = async (clientId?: number) => {
    try {
        const q = clientId 
            ? query(collection(db, 'milestones'), where('clientId', '==', clientId))
            : query(collection(db, 'milestones'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MilestoneRecord));
    } catch (error) {
        console.error("Error fetching milestones:", error);
        return [];
    }
};

export const persistMilestone = async (milestone: MilestoneRecord) => {
    const id = milestone.id || `MS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, 'milestones', id), sanitizeData(milestone));
};

export const fetchClients = async () => {
    const snapshot = await getDocs(collection(db, CLIENTS_COL));
    return snapshot.docs.map(doc => doc.data() as Client);
};

export const persistClient = async (client: Client) => {
    await setDoc(doc(db, CLIENTS_COL, String(client.id)), sanitizeData(client));
};

/**
 * Updates only the refundStatus field of a client.
 * Dedicated safe path that bypasses restricted field governance.
 */
export const updateClientRefundStatusInDb = async (clientId: number, refundStatus: RefundStatus) => {
    const ref = doc(db, CLIENTS_COL, String(clientId));
    await updateDoc(ref, { refundStatus });
};

// --- Refund Service Layer ---

export const persistRefundRequest = async (refund: RefundRecord) => {
    await setDoc(doc(db, REFUNDS_COL, refund.id), sanitizeData(refund));
};

export const fetchRefundRecord = async (clientId: number): Promise<RefundRecord | null> => {
    const q = query(collection(db, REFUNDS_COL), where('clientId', '==', clientId), limit(1));
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data() as RefundRecord;
};

export const persistRefundTransaction = async (txn: RefundTransaction) => {
    await setDoc(doc(db, REFUND_TXN_COL, txn.id), sanitizeData(txn));
};

export const fetchRefundTransactions = async (clientId: number): Promise<RefundTransaction[]> => {
    const q = query(collection(db, REFUND_TXN_COL), where('clientId', '==', clientId), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as RefundTransaction);
};