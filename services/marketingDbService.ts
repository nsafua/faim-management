
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Promotion } from '../types';

const PROMOTIONS_COL = 'promotions';

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

export const fetchPromotions = () => fetchCollection<Promotion>(PROMOTIONS_COL);
export const persistPromotion = async (promotion: Promotion) => {
    await setDoc(doc(db, PROMOTIONS_COL, String(promotion.id)), sanitizeData(promotion));
};
export const removePromotion = async (id: number) => {
    await deleteDoc(doc(db, PROMOTIONS_COL, String(id)));
};
