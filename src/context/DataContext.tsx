
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as dataService from '../services/dataService';
import { 
    Client, Property, Invoice, Staff, Lead, Promotion, 
    CompanySettings, ActivityLog, Role, AmendmentRequest 
} from '../types';
import { ROLES, AMENDMENT_REQUESTS as MOCK_AMENDMENT_REQUESTS } from '../data/mockData';

interface DataContextType {
    clients: Client[];
    properties: Property[];
    invoices: Invoice[];
    staff: Staff[];
    leads: Lead[];
    promotions: Promotion[];
    companySettings: CompanySettings;
    activityLogs: ActivityLog[];
    roles: Role[];
    amendments: AmendmentRequest[];
    
    // Actions
    saveClient: (client: Client) => Promise<Client>;
    deleteClient: (id: number) => Promise<void>;
    saveProperty: (property: Property) => Promise<void>;
    saveInvoice: (invoice: Invoice) => Promise<void>;
    saveLead: (lead: Lead) => Promise<void>;
    deleteLead: (id: number) => Promise<void>;
    savePromotion: (promotion: Promotion) => Promise<void>;
    deletePromotion: (id: number) => Promise<void>;
    updateStaff: (id: number, details: Partial<Staff>) => void;
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    setCompanySettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
    addActivityLog: (type: ActivityLog['type'], description: string, userId?: number) => void;
    setAmendmentList: React.Dispatch<React.SetStateAction<AmendmentRequest[]>>;
    setInvoiceList: React.Dispatch<React.SetStateAction<Invoice[]>>;
    setClientList: React.Dispatch<React.SetStateAction<Client[]>>;
    setLeadList: React.Dispatch<React.SetStateAction<Lead[]>>;
    setPromotionList: React.Dispatch<React.SetStateAction<Promotion[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appData = dataService.loadAppData();

    const [staffList, setStaffList] = useState<Staff[]>(appData.staff);
    const [clientList, setClientList] = useState<Client[]>(appData.clients);
    const [propertyList, setPropertyList] = useState<Property[]>(appData.properties);
    const [invoiceList, setInvoiceList] = useState<Invoice[]>(appData.invoices);
    const [roleList, setRoleList] = useState<Role[]>(ROLES);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(appData.settings);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(appData.logs);
    const [leadList, setLeadList] = useState<Lead[]>(appData.leads);
    const [promotionList, setPromotionList] = useState<Promotion[]>(appData.promotions);
    const [amendmentList, setAmendmentList] = useState<AmendmentRequest[]>(MOCK_AMENDMENT_REQUESTS);

    // Persistence Effect
    useEffect(() => {
        dataService.saveAllData({
            clients: clientList,
            properties: propertyList,
            staff: staffList,
            invoices: invoiceList,
            leads: leadList,
            promotions: promotionList,
            settings: companySettings,
            logs: activityLogs
        });
    }, [clientList, propertyList, staffList, invoiceList, leadList, promotionList, companySettings, activityLogs]);

    const addActivityLog = useCallback((type: ActivityLog['type'], description: string, userId?: number) => {
        const newLog: ActivityLog = {
            id: Date.now(),
            userId: userId || 0, // Should be passed from AuthContext or call site
            type,
            description,
            timestamp: new Date().toISOString(),
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, []);

    // --- Actions ---

    const saveClient = async (client: Client) => {
        let updatedList: Client[];
        const exists = clientList.some(c => c.id === client.id);
        if (exists) {
            updatedList = clientList.map(c => c.id === client.id ? client : c);
        } else {
            updatedList = [client, ...clientList];
        }
        setClientList(updatedList);
        return client;
    };

    const deleteClient = async (clientId: number) => {
        setClientList(prev => prev.filter(c => c.id !== clientId));
    };

    const saveProperty = async (property: Property) => {
        let updatedList: Property[];
        const exists = propertyList.some(p => p.id === property.id);
        if (exists) {
            updatedList = propertyList.map(p => p.id === property.id ? property : p);
        } else {
            updatedList = [property, ...propertyList];
        }
        setPropertyList(updatedList);
    };

    const saveInvoice = async (invoice: Invoice) => {
        let updatedList: Invoice[];
        const exists = invoiceList.some(i => i.id === invoice.id);
        if (exists) {
            updatedList = invoiceList.map(i => i.id === invoice.id ? invoice : i);
        } else {
            updatedList = [invoice, ...invoiceList];
        }
        setInvoiceList(updatedList);
    };

    const saveLead = async (lead: Lead) => {
        let updatedList: Lead[];
        const exists = leadList.some(l => l.id === lead.id);
        if (exists) {
            updatedList = leadList.map(l => l.id === lead.id ? lead : l);
        } else {
            updatedList = [lead, ...leadList];
        }
        setLeadList(updatedList);
    };

    const deleteLead = async (leadId: number) => {
        setLeadList(prev => prev.filter(l => l.id !== leadId));
    };

    const savePromotion = async (promotion: Promotion) => {
        let updatedList: Promotion[];
        const exists = promotionList.some(p => p.id === promotion.id);
        if (exists) {
            updatedList = promotionList.map(p => p.id === promotion.id ? promotion : p);
        } else {
            updatedList = [promotion, ...promotionList];
        }
        setPromotionList(updatedList);
    };

    const deletePromotion = async (promotionId: number) => {
        setPromotionList(prev => prev.filter(p => p.id !== promotionId));
    };

    const updateStaff = (staffId: number, details: Partial<Staff>) => {
        setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, ...details } : s));
    };

    return (
        <DataContext.Provider value={{
            clients: clientList,
            properties: propertyList,
            invoices: invoiceList,
            staff: staffList,
            leads: leadList,
            promotions: promotionList,
            companySettings,
            activityLogs,
            roles: roleList,
            amendments: amendmentList,
            saveClient,
            deleteClient,
            saveProperty,
            saveInvoice,
            saveLead,
            deleteLead,
            savePromotion,
            deletePromotion,
            updateStaff,
            setStaff: setStaffList,
            setRoles: setRoleList,
            setCompanySettings,
            addActivityLog,
            setAmendmentList,
            setInvoiceList,
            setClientList,
            setLeadList,
            setPromotionList
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
