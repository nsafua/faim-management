import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as dbService from '../../services/dbService';
import { auth } from '../../services/firebase';
import { Lead, Promotion } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/DataContext';

// --- Leads ---
export const useLeads = (searchTerm: string = '') => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const { rolePermissions } = usePermissions();
    const isAuthenticated = !!auth.currentUser;

    const canView = useMemo(() => {
        if (!currentStaff) return false;
        if (currentStaff.roleId === 'CEO') return true;
        const perms = rolePermissions.find(rp => rp.roleId === currentStaff.roleId && rp.moduleId === 'Leads Management');
        return !!perms?.permissions?.view;
    }, [currentStaff, rolePermissions]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['leads', searchTerm],
        queryFn: ({ pageParam }) => 
            searchTerm 
                ? dbService.searchLeads(searchTerm).then(data => ({ data, lastDoc: null }))
                : dbService.fetchLeadsPaginated(pageParam as any),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.lastDoc,
        enabled: isAuthenticated && canView,
    });

    const leads = data?.pages.flatMap(page => page.data) || [];

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
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        saveLead: (lead: Lead) => saveLeadMutation.mutateAsync(lead),
        deleteLead: (id: number) => deleteLeadMutation.mutateAsync(id)
    };
};

// --- Promotions ---
export const usePromotions = () => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const { rolePermissions } = usePermissions();
    const isAuthenticated = !!auth.currentUser;

    const canView = useMemo(() => {
        if (!currentStaff) return false;
        if (currentStaff.roleId === 'CEO') return true;
        const perms = rolePermissions.find(rp => rp.roleId === currentStaff.roleId && rp.moduleId === 'Promotions');
        return !!perms?.permissions?.view;
    }, [currentStaff, rolePermissions]);

    const { data: promotions = [] } = useQuery({
        queryKey: ['promotions'],
        queryFn: dbService.fetchPromotions,
        enabled: isAuthenticated && canView,
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
        savePromotion: (promo: Promotion) => savePromotionMutation.mutateAsync(promo),
        deletePromotion: (id: number) => deletePromotionMutation.mutateAsync(id)
    };
};