import { db } from './firebase';
import { 
    collection, getDocs, doc, setDoc, addDoc, 
    query, where, orderBy, onSnapshot, updateDoc, 
    serverTimestamp, deleteDoc 
} from 'firebase/firestore';
import { 
    MessageTemplate, 
    MessageOutbox, 
    MessageHistory, 
    ClientMessagingPreference 
} from '../types/messaging';

const TEMPLATES_COL = 'messaging_templates';
const OUTBOX_COL = 'messaging_outbox';
const HISTORY_COL = 'messaging_history';
const PREFS_COL = 'messaging_client_preferences';

// --- Templates ---
export const listenToTemplates = (callback: (templates: MessageTemplate[]) => void) => {
    return onSnapshot(collection(db, TEMPLATES_COL), (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MessageTemplate)));
    }, (error) => {
        console.warn("Messaging template listener blocked or failed:", error.message);
        callback([]);
    });
};

export const saveTemplate = async (template: MessageTemplate) => {
    await setDoc(doc(db, TEMPLATES_COL, template.id), {
        ...template,
        updatedAt: new Date().toISOString()
    });
};

// --- Manual Send / Outbox ---
export const queueMessage = async (message: Omit<MessageOutbox, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, OUTBOX_COL), {
        ...message,
        createdAt: now,
        updatedAt: now
    });

    // Immutable History Log (Simulation of dispatch)
    if (message.status === 'SENT') {
        await addDoc(collection(db, HISTORY_COL), {
            messageId: docRef.id,
            clientId: message.clientId,
            channel: message.channel,
            category: message.category,
            recipient: message.toPhone || message.toEmail || 'Unknown',
            messagePreview: message.messageBodyFinal.substring(0, 100),
            status: 'SENT',
            timestamp: now,
            senderName: message.createdBy
        });
    }
};

// --- History ---
export const listenToMessageHistory = (callback: (history: MessageHistory[]) => void) => {
    const q = query(collection(db, HISTORY_COL), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MessageHistory)));
    }, (error) => {
        console.warn("Messaging history listener blocked or failed:", error.message);
        callback([]);
    });
};

// --- Preferences ---
export const getClientPreferences = async (clientId: number): Promise<ClientMessagingPreference | null> => {
    const q = query(collection(db, PREFS_COL), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as ClientMessagingPreference;
};

export const updateClientPreferences = async (prefs: ClientMessagingPreference) => {
    const docId = `PREF_${prefs.clientId}`;
    await setDoc(doc(db, PREFS_COL, docId), {
        ...prefs,
        updatedAt: new Date().toISOString()
    });
};

// --- CEO Hub Stats ---
export const fetchMessagingStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, HISTORY_COL), where('timestamp', '>=', today));
    try {
        const snap = await getDocs(q);
        return {
            sentToday: snap.size,
            failures: snap.docs.filter(d => d.data().status === 'FAILED').length
        };
    } catch (e) {
        return { sentToday: 0, failures: 0 };
    }
};
