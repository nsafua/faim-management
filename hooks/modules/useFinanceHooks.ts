import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbService from '../../services/dbService';
import { auth } from '../../services/firebase';
import { Invoice } from '../../types';
import { useAuth } from '../../context/AuthContext';

// --- Invoices ---
export const useInvoices = () => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const isAuthenticated = !!auth.currentUser;

    const canManageFinance = useMemo(() => {
        if (!currentStaff) return false;
        return ['CEO', 'Chief Accountant'].includes(currentStaff.roleId);
    }, [currentStaff]);

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: dbService.fetchInvoices,
        enabled: isAuthenticated,
    });

    const saveInvoiceMutation = useMutation({
        mutationFn: (invoice: Invoice) => {
            if (!canManageFinance) throw new Error("GOVERNANCE_VIOLATION: Role lacks financial write authority.");
            return dbService.persistInvoice(invoice);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
    });

    return {
        invoices,
        canManageFinance,
        saveInvoice: (invoice: Invoice) => saveInvoiceMutation.mutateAsync(invoice)
    };
};