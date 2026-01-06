
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Property } from '../types';

const PROPERTIES_COL = 'properties';

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

export const fetchProperties = () => fetchCollection<Property>(PROPERTIES_COL);
export const persistProperty = async (property: Property) => {
    await setDoc(doc(db, PROPERTIES_COL, String(property.id)), sanitizeData(property));
};
export const removeProperty = async (id: number) => {
    await deleteDoc(doc(db, PROPERTIES_COL, String(id)));
};
