import { Client, Property, Staff, Invoice, Lead, Promotion, CompanySettings, ActivityLog } from '../types';
import { 
    CLIENTS, 
    PROPERTIES, 
    STAFF, 
    INVOICES, 
    LEADS, 
    PROMOTIONS, 
    COMPANY_SETTINGS, 
    ACTIVITY_LOGS 
} from '../data/mockData';

const APP_DATA_KEY = 'FAIM_APP_DATA';

type AppData = {
    clients: Client[];
    properties: Property[];
    staff: Staff[];
    invoices: Invoice[];
    leads: Lead[];
    promotions: Promotion[];
    settings: CompanySettings;
    logs: ActivityLog[];
};

// --- Load and Initialize Data ---
export function loadAppData(): AppData {
    try {
        const storedData = localStorage.getItem(APP_DATA_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            // First time load: use mock data and save it
            const initialData: AppData = {
                clients: CLIENTS,
                properties: PROPERTIES,
                staff: STAFF,
                invoices: INVOICES,
                leads: LEADS,
                promotions: PROMOTIONS,
                settings: COMPANY_SETTINGS,
                logs: ACTIVITY_LOGS
            };
            localStorage.setItem(APP_DATA_KEY, JSON.stringify(initialData));
            return initialData;
        }
    } catch (error) {
        console.error("Failed to load or parse app data from localStorage:", error);
        // Fallback to mock data in case of parsing errors
        return {
            clients: CLIENTS,
            properties: PROPERTIES,
            staff: STAFF,
            invoices: INVOICES,
            leads: LEADS,
            promotions: PROMOTIONS,
            settings: COMPANY_SETTINGS,
            logs: ACTIVITY_LOGS
        };
    }
}

// --- Save All Data ---
export function saveAllData(data: AppData): void {
    try {
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save app data to localStorage:", error);
    }
}