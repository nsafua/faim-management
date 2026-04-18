
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, where, arrayUnion } from 'firebase/firestore';
import { InternalMail } from '../types';

const MAILS_COL = 'internal_mails';

export const sendInternalMail = async (mailData: Omit<InternalMail, 'id'>) => {
    // Ensure participants array is populated for querying
    const participants = Array.from(new Set([mailData.senderId, ...mailData.recipientIds]));
    
    await addDoc(collection(db, MAILS_COL), {
        ...mailData,
        participants,
        timestamp: new Date().toISOString() // Server time ideally, but ISO string works for this app scale
    });
};

export const listenToInbox = (userId: string, onUpdate: (mails: InternalMail[]) => void) => {
    // Query mails where the user is a participant (sender or recipient)
    // Removed orderBy to bypass the need for a composite index on (participants, timestamp).
    // Sorting is performed client-side.
    const q = query(
        collection(db, MAILS_COL),
        where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const mails = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InternalMail));
        // Client-side sort by timestamp descending
        mails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(mails);
    }, (error) => {
        console.error("Error listening to mails:", error);
    });
};

export const markMailRead = async (mailId: string, userId: string) => {
    const ref = doc(db, MAILS_COL, mailId);
    await updateDoc(ref, {
        readBy: arrayUnion(userId)
    });
};

export const toggleMailDeleteStatus = async (mailId: string, isDeleted: boolean) => {
    const ref = doc(db, MAILS_COL, mailId);
    await updateDoc(ref, { isDeleted });
};

export const permanentlyDeleteMail = async (mailId: string) => {
    await deleteDoc(doc(db, MAILS_COL, mailId));
};
