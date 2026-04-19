import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Staff, ActivityLog, AmendmentRequest } from '../types';
import { sanitizeData } from './dbUtils';

const USERS_COL = 'user';
const LOGS_COL = 'activity_logs';
const AMENDMENTS_COL = 'amendments';

const fetchCollection = async <T>(colName: string): Promise<T[]> => {
    try {
        const snapshot = await getDocs(collection(db, colName));
        return snapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
        console.error(`Error fetching ${colName}:`, error);
        return [];
    }
};

// --- Staff ---
export const fetchStaff = () => fetchCollection<Staff>(USERS_COL);
export const persistStaff = async (staff: Staff) => {
    const { password, ...staffDataWithoutPassword } = staff;
    await setDoc(doc(db, USERS_COL, String(staff.id)), sanitizeData(staffDataWithoutPassword));
};
export const removeStaff = async (id: string) => {
    await deleteDoc(doc(db, USERS_COL, id));
};

// --- Activity Logs ---
export const fetchActivityLogs = () => fetchCollection<ActivityLog>(LOGS_COL);
export const persistActivityLog = async (log: ActivityLog) => {
    await setDoc(doc(db, LOGS_COL, String(log.id)), sanitizeData(log));
};

// --- Amendments ---
export const fetchAmendments = () => fetchCollection<AmendmentRequest>(AMENDMENTS_COL);
export const persistAmendment = async (amendment: AmendmentRequest) => {
    await setDoc(doc(db, AMENDMENTS_COL, String(amendment.id)), sanitizeData(amendment));
};