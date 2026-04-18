import { useState, useEffect, useMemo } from 'react';
import { Client, Staff, Role, AppNotification, RefundPlan } from '../types';
import { useProperties, useMilestones } from './useAppData';
import { useNotificationTriggers } from './useNotificationTriggers';
import { useModal } from '../context/ModalContext';
import { MODAL_TYPES } from '../components/ModalManager';
import { recordPaymentAtomic } from '../services/financeDbService';

export const useAccountManagement = (
    clients: Client[],
    onSaveClient: (client: Client) => Promise<Client>,
    clientForInvoice: Client | null,
    setClientForInvoice: (client: Client | null) => void,
    currentStaff: Staff,
    roles: Role[],
    overrideClientId: number | null = null
) => {
    const { properties } = useProperties();
    const { saveMilestone } = useMilestones();
    const { openModal } = useModal();
    const [viewMode, setViewMode] = useState<'list' | 'alerts'>('list');
    const [activeSubModule, setActiveSubModule] = useState<'overview' | 'history' | 'refund'>('overview');
    const [selectedClientId, setSelectedClientId] = useState<number | null>(overrideClientId);
    const [isSaving, setIsSaving] = useState(false);
    const [installmentOption, setInstallmentOption] = useState<string>('Outright');
    const [isStatementModalOpen, setStatementModalOpen] = useState(false);

    useEffect(() => {
        if (overrideClientId !== null) {
            setSelectedClientId(overrideClientId);
        }
    }, [overrideClientId]);

    const selectedClient = useMemo(() => 
        clients.find(c => c.id === (selectedClientId || clientForInvoice?.id))
    , [clients, selectedClientId, clientForInvoice]);

    const isCEO = useMemo(() => currentStaff.roleId === 'CEO', [currentStaff]);
    const isAccountant = useMemo(() => currentStaff.roleId === 'Chief Accountant', [currentStaff]);
    const canGenerateStatement = useMemo(() => isCEO || isAccountant, [isCEO, isAccountant]);

    const canMakePayment = useMemo(() => {
        return ['CEO', 'Chief Accountant'].includes(currentStaff.roleId);
    }, [currentStaff]);

    const originalPricePerPlot = useMemo(() => {
        if (!selectedClient) return 0;
        const matchingProperty = properties.find(p => p.location === selectedClient.location);
        return matchingProperty ? matchingProperty.price : 0;
    }, [selectedClient, properties]);

    const discountAmount = selectedClient?.payment.promoDetails ? (originalPricePerPlot * 0.1) : 0; 
    const priceAfterDiscount = originalPricePerPlot - discountAmount;

    const paymentAggregation = useMemo(() => {
        if (!selectedClient) return { land: 0, indenture: 0 };
        return selectedClient.payment.paymentHistory.reduce((acc, txn) => {
            const type = (txn as any).type || 'Land';
            if (type === 'Land') acc.land += txn.amount;
            if (type === 'Indenture') acc.indenture += txn.amount;
            return acc;
        }, { land: 0, indenture: 0 });
    }, [selectedClient]);

    const handleInitialSave = async (customMonths?: number, financialSnapshot?: any) => {
        if (!selectedClient) return;
        setIsSaving(true);
        try {
            const monthsCount = installmentOption === 'Other' ? (customMonths || 1) : parseInt(installmentOption);
            const finalPlanType = installmentOption === 'Outright' ? 'Outright' : `${monthsCount} Months`;
            const updatedClient = {
                ...selectedClient,
                payment: {
                    ...selectedClient.payment,
                    isInitialized: true,
                    planType: finalPlanType,
                    total: financialSnapshot?.contractTotalAfterDiscount || priceAfterDiscount,
                    balance: (financialSnapshot?.contractTotalAfterDiscount || priceAfterDiscount) - selectedClient.payment.paid,
                    ...financialSnapshot
                }
            };
            await onSaveClient(updatedClient);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecordPayment = async (client: Client, paymentData: any) => {
        await recordPaymentAtomic(client.id, paymentData, currentStaff.fullName);
        
        if (client.payment.balance - paymentData.amount <= 0) {
            saveMilestone({
                clientId: client.id,
                milestoneCode: 'PLR',
                dateCompleted: new Date().toISOString().split('T')[0],
                notes: 'Full payment for land received.'
            }).catch(() => {});
        }
    };

    const handleSaveRefundPlan = async (plan: RefundPlan) => {
        if (!selectedClient) return;
        setIsSaving(true);
        try {
            const updatedClient = {
                ...selectedClient,
                refundPlan: plan,
                status: plan.isCompleted ? 'Refunded' : 'Active Client'
            } as Client;
            await onSaveClient(updatedClient);
        } finally {
            setIsSaving(false);
        }
    };

    const openPaymentModal = () => {
        if (selectedClient) {
            openModal(MODAL_TYPES.RECORD_PAYMENT, {
                client: selectedClient,
                onSave: (data: any) => handleRecordPayment(selectedClient, data)
            });
        }
    };

    const generatedNotifications = useNotificationTriggers(clients);
    const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);
    
    useEffect(() => {
        setLocalNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newAlerts = generatedNotifications.filter(n => !existingIds.has(n.id));
            return [...prev, ...newAlerts];
        });
    }, [generatedNotifications]);

    const currentRoleName = roles.find(r => r.id === currentStaff.roleId)?.name || 'Staff';
    const roleAlerts = localNotifications.filter(n => n.recipientRole === currentRoleName && !n.isRead);

    return {
        viewMode, setViewMode,
        activeSubModule, setActiveSubModule,
        selectedClientId, setSelectedClientId,
        isSaving, setIsSaving,
        installmentOption, setInstallmentOption,
        isStatementModalOpen, setStatementModalOpen,
        selectedClient,
        isCEO, isAccountant, canGenerateStatement, canMakePayment,
        originalPricePerPlot, discountAmount, priceAfterDiscount,
        paymentAggregation,
        handleInitialSave, handleSaveRefundPlan, openPaymentModal,
        localNotifications, setLocalNotifications,
        currentRoleName, roleAlerts
    };
};
