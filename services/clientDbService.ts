
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, limit, startAfter, where, orderBy, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Client, AmendmentRequest } from '../types';

const CLIENTS_COL = 'clients';
const AMENDMENTS_COL = 'amendments';

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

export const fetchClients = () => fetchCollection<Client>(CLIENTS_COL); 
export const persistClient = async (client: Client) => {
    await setDoc(doc(db, CLIENTS_COL, String(client.id)), sanitizeData(client));
};
export const removeClient = async (id: number) => {
    await deleteDoc(doc(db, CLIENTS_COL, String(id)));
};

export const fetchAmendments = () => fetchCollection<AmendmentRequest>(AMENDMENTS_COL);
export const persistAmendment = async (amendment: AmendmentRequest) => {
    await setDoc(doc(db, AMENDMENTS_COL, String(amendment.id)), sanitizeData(amendment));
};
