
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbService from '../services/dbService';
import { auth } from '../services/firebase';
import { COMPANY_SETTINGS } from '../data/mockData';
import { 
    Client, Property, Invoice, Staff, Lead, Promotion, 
    ActivityLog, Role, AmendmentRequest, CompanySettings 
} from '../types';

// --- Clients ---
export const useClients = (searchTerm: string = '') => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;
    
    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients', searchTerm],
        queryFn: () => searchTerm ? dbService.searchClients(searchTerm) : dbService.fetchClients(),
        staleTime: 1000 * 60 * 5, 
        enabled: isAuthenticated,
    });

    const saveClientMutation = useMutation({
        mutationFn: dbService.persistClient,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
    });

    const deleteClientMutation = useMutation({
        mutationFn: dbService.removeClient,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
    });

    return {
        clients,
        isLoading,
        saveClient: async (client: Client) => { 
            await saveClientMutation.mutateAsync(client); 
            return client; 
        },
        deleteClient: async (id: number) => { 
            await deleteClientMutation.mutateAsync(id); 
        },
        hasNextPage: false,
        fetchNextPage: () => {},
        isFetchingNextPage: false
    };
};

// --- Properties ---
export const useProperties = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: properties = [] } = useQuery({
        queryKey: ['properties'],
        queryFn: dbService.fetchProperties,
        staleTime: 1000 * 60 * 10,
        enabled: isAuthenticated,
    });

    const savePropertyMutation = useMutation({
        mutationFn: dbService.persistProperty,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] })
    });

    return {
        properties,
        saveProperty: async (property: Property) => { 
            await savePropertyMutation.mutateAsync(property); 
        }
    };
};

// --- Invoices ---
export const useInvoices = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: dbService.fetchInvoices,
        staleTime: 1000 * 60 * 5,
        enabled: isAuthenticated,
    });

    const saveInvoiceMutation = useMutation({
        mutationFn: dbService.persistInvoice,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
    });

    return {
        invoices,
        saveInvoice: async (invoice: Invoice) => { 
            await saveInvoiceMutation.mutateAsync(invoice); 
        }
    };
};

// --- Staff ---
export const useStaff = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: staff = [] } = useQuery({
        queryKey: ['staff'],
        queryFn: dbService.fetchStaff,
        staleTime: 1000 * 60 * 5,
        enabled: isAuthenticated,
    });

    const saveStaffMutation = useMutation({
        mutationFn: dbService.persistStaff,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
    });

    const deleteStaffMutation = useMutation({
        mutationFn: dbService.removeStaff,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
    });

    return {
        staff,
        saveStaff: async (staffMember: Staff) => { 
            await saveStaffMutation.mutateAsync(staffMember); 
        },
        deleteStaff: async (id: string) => { 
            await deleteStaffMutation.mutateAsync(id); 
        },
        updateStaff: async (id: string, details: Partial<Staff>) => {
             const existing = staff.find(s => s.id === id);
             if (existing) {
                 await saveStaffMutation.mutateAsync({ ...existing, ...details });
             }
        }
    };
};

// --- Leads ---
export const useLeads = (searchTerm: string = '') => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads', searchTerm],
        queryFn: () => searchTerm ? dbService.searchLeads(searchTerm) : dbService.fetchLeads(),
        staleTime: 1000 * 60 * 2,
        enabled: isAuthenticated,
    });

    const saveLeadMutation = useMutation({
        mutationFn: dbService.persistLead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
    });

    const deleteLeadMutation = useMutation({
        mutationFn: dbService.removeLead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
    });

    return {
        leads,
        isLoading,
        saveLead: async (lead: Lead) => { 
            await saveLeadMutation.mutateAsync(lead); 
        },
        deleteLead: async (id: number) => { 
            await deleteLeadMutation.mutateAsync(id); 
        },
        hasNextPage: false,
        fetchNextPage: () => {},
        isFetchingNextPage: false
    };
};

// --- Promotions ---
export const usePromotions = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: promotions = [] } = useQuery({
        queryKey: ['promotions'],
        queryFn: dbService.fetchPromotions,
        enabled: isAuthenticated,
    });

    const savePromotionMutation = useMutation({
        mutationFn: dbService.persistPromotion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] })
    });

    const deletePromotionMutation = useMutation({
        mutationFn: dbService.removePromotion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] })
    });

    return {
        promotions,
        savePromotion: async (promotion: Promotion) => { 
            await savePromotionMutation.mutateAsync(promotion); 
        },
        deletePromotion: async (id: number) => { 
            await deletePromotionMutation.mutateAsync(id); 
        }
    };
};

// --- Activity Logs ---
export const useActivityLogs = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: activityLogs = [] } = useQuery({
        queryKey: ['activityLogs'],
        queryFn: dbService.fetchActivityLogs,
        enabled: isAuthenticated,
    });

    const addLogMutation = useMutation({
        mutationFn: dbService.persistActivityLog,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activityLogs'] })
    });

    return {
        activityLogs,
        addActivityLog: (type: ActivityLog['type'], description: string, userId: string = 'system') => {
            const newLog: ActivityLog = {
                id: Date.now(),
                userId: String(userId),
                type,
                description,
                timestamp: new Date().toISOString(),
            };
            addLogMutation.mutate(newLog);
        }
    };
};

// --- Roles ---
export const useRoles = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: dbService.fetchRoles,
        enabled: isAuthenticated,
    });

    const saveRoleMutation = useMutation({
        mutationFn: dbService.persistRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
    });
    
    const removeRoleMutation = useMutation({
        mutationFn: dbService.removeRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
    });

    const setRoles = (action: React.SetStateAction<Role[]>) => {
        const newRolesList = typeof action === 'function' ? action(roles) : action;
        
        // 1. Added
        const added = newRolesList.filter(r => !roles.find(old => old.id === r.id));
        added.forEach(r => saveRoleMutation.mutate(r));
        
        // 2. Updated
        const updated = newRolesList.filter(r => {
            const old = roles.find(o => o.id === r.id);
            return old && JSON.stringify(old) !== JSON.stringify(r);
        });
        updated.forEach(r => saveRoleMutation.mutate(r));
        
        // 3. Deleted
        const deleted = roles.filter(old => !newRolesList.find(n => n.id === old.id));
        deleted.forEach(r => removeRoleMutation.mutate(r.id));
        
        // Optimistic update
        queryClient.setQueryData(['roles'], newRolesList);
    };

    return { roles, setRoles };
};

// --- Amendments ---
export const useAmendments = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: amendments = [] } = useQuery({
        queryKey: ['amendments'],
        queryFn: dbService.fetchAmendments,
        enabled: isAuthenticated,
    });

    const saveAmendmentMutation = useMutation({
        mutationFn: dbService.persistAmendment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amendments'] })
    });

    const setAmendmentList = (action: React.SetStateAction<AmendmentRequest[]>) => {
        const newAnds = typeof action === 'function' ? action(amendments) : action;
        const added = newAnds.filter(a => !amendments.find(old => old.id === a.id));
        added.forEach(a => saveAmendmentMutation.mutate(a));
        queryClient.setQueryData(['amendments'], newAnds);
    };

    return { amendments, setAmendmentList };
};

// --- Company Settings ---
export const useCompanySettings = () => {
    const queryClient = useQueryClient();
    // Settings are public, so no auth check needed for read
    const { data: companySettings = COMPANY_SETTINGS } = useQuery({ 
        queryKey: ['settings'], 
        queryFn: dbService.fetchCompanySettings,
        staleTime: 1000 * 60 * 5,
    });
    
    const setSettings = useMutation({
        mutationFn: dbService.persistCompanySettings,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
    });

    return { 
        companySettings, 
        setCompanySettings: async (action: React.SetStateAction<CompanySettings>) => {
            const newS = typeof action === 'function' ? action(companySettings) : action;
            await setSettings.mutateAsync(newS);
            return newS; // To satisfy potential void | Promise returns
        }
    };
};
