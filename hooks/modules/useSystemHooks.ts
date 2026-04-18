import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbService from '../../services/dbService';
import { auth } from '../../services/firebase';
import { AmendmentRequest, CompanySettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/DataContext';

// --- Amendments ---
export const useAmendments = () => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const { rolePermissions } = usePermissions();
    const isAuthenticated = !!auth.currentUser;

    const canView = useMemo(() => {
        if (!currentStaff) return false;
        if (currentStaff.roleId === 'CEO') return true;
        const perms = rolePermissions.find(rp => rp.roleId === currentStaff.roleId && rp.moduleId === 'Clients');
        return !!perms?.permissions?.view;
    }, [currentStaff, rolePermissions]);

    const { data: amendments = [] } = useQuery({
        queryKey: ['amendments'],
        queryFn: dbService.fetchAmendments,
        enabled: isAuthenticated && canView,
    });

    const setAmendmentListMutation = useMutation({
        mutationFn: async (updated: AmendmentRequest[]) => {
            for (const item of updated) {
                await dbService.persistAmendment(item);
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amendments'] })
    });

    return {
        amendments,
        setAmendmentList: (amendments: React.SetStateAction<AmendmentRequest[]>) => {
            if (typeof amendments === 'function') {
                const next = amendments(queryClient.getQueryData(['amendments']) || []);
                setAmendmentListMutation.mutate(next);
            } else {
                setAmendmentListMutation.mutate(amendments);
            }
        }
    };
};

// --- Company Settings ---
const SETTINGS_STORAGE_KEY = 'faim_app_settings_cache';

const getStoredSettings = (): CompanySettings | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : undefined;
    } catch (e) {
        console.warn("Failed to load cached settings", e);
        return undefined;
    }
};

export const useCompanySettings = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: companySettings = { name: 'FAIM' } } = useQuery({
        queryKey: ['company_settings'],
        queryFn: async () => {
            const settings = await dbService.fetchCompanySettings();
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            return settings;
        },
        initialData: getStoredSettings(),
        enabled: true, 
        staleTime: 1000 * 60 * 5,
    });

    const setCompanySettingsMutation = useMutation({
        mutationFn: async (settings: React.SetStateAction<CompanySettings>) => {
            const next = typeof settings === 'function' 
                ? settings(queryClient.getQueryData(['company_settings']) || { name: 'FAIM' }) 
                : settings;
            
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            await dbService.persistCompanySettings(next);
            return next;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['company_settings'], data);
            queryClient.invalidateQueries({ queryKey: ['company_settings'] });
        }
    });

    return {
        companySettings,
        setCompanySettings: (settings: React.SetStateAction<CompanySettings>) => 
            setCompanySettingsMutation.mutateAsync(settings)
    };
};