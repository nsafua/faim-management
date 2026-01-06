
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, limit, startAfter, where, orderBy, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Lead } from '../types';

const LEADS_COL = 'leads';

const sanitizeData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

const fetchCollection = async <T>(colName: string): Promise<T[]> => {
    try {
        const snapshot = await getDocs(collection(db, colName));
        return snapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
        console.error(`Error fetching ${colName}:`, error);
        return [];
    }
};

export const fetchLeadsPaginated = async (lastDoc: QueryDocumentSnapshot<DocumentData> | null, pageSize: number = 20) => {
    try {
        let q = query(collection(db, LEADS_COL), orderBy('id', 'desc'), limit(pageSize));
        if (lastDoc) {
            q = query(collection(db, LEADS_COL), orderBy('id', 'desc'), startAfter(lastDoc), limit(pageSize));
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as Lead);
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        return { data, lastDoc: lastVisible };
    } catch (error) {
        console.error("Error fetching paginated leads:", error);
        return { data: [], lastDoc: null };
    }
};

export const searchLeads = async (searchTerm: string) => {
    try {
        const q = query(
            collection(db, LEADS_COL),
            where('fullName', '>=', searchTerm),
            where('fullName', '<=', searchTerm + '\uf8ff'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Lead);
    } catch (error) {
        console.error("Error searching leads:", error);
        return [];
    }
};

export const fetchLeads = () => fetchCollection<Lead>(LEADS_COL);
export const persistLead = async (lead: Lead) => {
    await setDoc(doc(db, LEADS_COL, String(lead.id)), sanitizeData(lead));
};
export const removeLead = async (id: number) => {
    await deleteDoc(doc(db, LEADS_COL, String(id)));
};
