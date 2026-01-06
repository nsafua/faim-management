
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Invoice } from '../types';

const INVOICES_COL = 'invoices';

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

export const fetchInvoices = () => fetchCollection<Invoice>(INVOICES_COL);
export const persistInvoice = async (invoice: Invoice) => {
    await setDoc(doc(db, INVOICES_COL, String(invoice.id)), sanitizeData(invoice));
};
export const removeInvoice = async (id: string) => {
    await deleteDoc(doc(db, INVOICES_COL, id));
};
