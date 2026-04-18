
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Promotion } from '../types';

const PROMOTIONS_COL = 'promotions';

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

export const fetchPromotions = () => fetchCollection<Promotion>(PROMOTIONS_COL);
export const persistPromotion = async (promotion: Promotion) => {
    await setDoc(doc(db, PROMOTIONS_COL, String(promotion.id)), sanitizeData(promotion));
};
export const removePromotion = async (id: number) => {
    await deleteDoc(doc(db, PROMOTIONS_COL, String(id)));
};
