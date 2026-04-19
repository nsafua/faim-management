import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { CompanySettings } from '../types';
import { COMPANY_SETTINGS } from '../data/mockData';
import { sanitizeData } from './dbUtils';

const SETTINGS_COL = 'settings';

export const fetchCompanySettings = async (): Promise<CompanySettings> => {
    try {
        const docRef = doc(db, SETTINGS_COL, 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...COMPANY_SETTINGS, ...docSnap.data() } as CompanySettings;
        } else {
            return COMPANY_SETTINGS;
        }
    } catch (error) {
        console.error("Error fetching company settings. Preserving local cache.", error);
        throw error;
    }
};

export const persistCompanySettings = async (settings: CompanySettings) => {
    await setDoc(doc(db, SETTINGS_COL, 'main'), sanitizeData(settings));
};
