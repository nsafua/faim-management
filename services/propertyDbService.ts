
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Property } from '../types';

const PROPERTIES_COL = 'properties';

const sanitizeData = <T>(data: T, seen = new WeakSet()): T => {
    if (data === null || typeof data !== 'object') return data;
    if (seen.has(data)) return undefined as any;
    seen.add(data);
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, seen)).filter(i => i !== undefined) as any;
    }
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && typeof value !== 'function') {
            const sanitizedValue = sanitizeData(value, seen);
            if (sanitizedValue !== undefined) {
                sanitizedObj[key] = sanitizedValue;
            }
        }
    }
    return sanitizedObj as T;
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
