
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Invoice, PaymentTransaction, Role } from '../types';
import { ArrowLeftIcon, UserCheckIcon } from './icons/DummyIcons';
import { useProperties } from '../hooks/useAppData';
import { RecordPaymentModal } from './financials/RecordPaymentModal';
import { LedgerSidebar } from './financials/LedgerSidebar';
import { CommitmentSummary } from './financials/CommitmentSummary';

export { RecordPaymentModal };

const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

export const FinancialRecordEditor: React.FC<{
    onBack?: () => void;
    clients: Client[];
    onSave: (invoice: Invoice, updatedClient?: Client) => void;
    onRecordPayment: (client: Client, paymentData: Omit<PaymentTransaction, 'id' | 'status'> & { type: 'Land' | 'Indenture' | 'Commission' }) => void;
    editingInvoice: Invoice | null;
    clientForInvoice: Client | null;
    fixedClient?: Client;
    className?: string;
    roles: Role[];
}> = ({ onBack, clients, onSave, onRecordPayment, editingInvoice, clientForInvoice, fixedClient, className, roles = [] }) => {
    const { properties } = useProperties();
    
    const [selectedClientId, setSelectedClientId] = useState<number | null>(() => {
        if (fixedClient) return fixedClient.id;
        if (clientForInvoice) return clientForInvoice.id;
        return null;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [originalPrice, setOriginalPrice] = useState('0');
    const [discountValue, setDiscountValue] = useState('0');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [installmentCount, setInstallmentCount] = useState('1');

    const selectedClient = fixedClient || clients.find(c => c.id === selectedClientId);

    // AUTHORITY RULE: Auto-populate price from CEO Hub catalog. Set to Read-Only.
    useEffect(() => {
        if (selectedClient) {
            // If already initialized, keep the historical price
            if (selectedClient.payment && (selectedClient.payment as any).isInitialized) {
                setOriginalPrice(String(selectedClient.payment.total || 0));
            } else {
                // Fetch current published price for the location
                const match = properties.find(p => p.location === selectedClient.location);
                setOriginalPrice(match ? String(match.price) : '0');
            }
        }
    }, [selectedClient, properties]);

    const financialSummary = useMemo(() => {
        const P_orig = parseFloat(originalPrice) || 0;
        const D_val = parseFloat(discountValue) || 0;
        const I_count = parseInt(installmentCount) || 1;
        
        const discountAmount = discountType === 'percentage' ? P_orig * (D_val / 100) : D_val;
        const priceAfterDiscount = Math.max(0, P_orig - discountAmount);
        const emiAmount = I_count > 1 ? priceAfterDiscount / I_count : 0;
        const totalPaid = selectedClient?.payment.paid || 0;
        const outstandingBalance = Math.max(0, priceAfterDiscount - totalPaid);

        return {
            originalPrice: P_orig,
            discountAmount,
            priceAfterDiscount,
            emiAmount,
            totalPaid,
            outstandingBalance
        };
    }, [originalPrice, discountValue, discountType, installmentCount, selectedClient]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient || isSaving) return;
        
        setIsSaving(true);
        const updatedClient = {
            ...selectedClient,
            payment: {
                ...selectedClient.payment,
                isInitialized: true,
                total: financialSummary.priceAfterDiscount,
                balance: financialSummary.outstandingBalance,
                planType: parseInt(installmentCount) > 1 ? `${installmentCount}-Month EMI` : 'Outright'
            }
        } as Client;
        
        try {
            await onSave({ id: `AUTO-${Date.now()}`, clientId: selectedClient.id, clientName: selectedClient.name, amount: 0, status: 'Pending', issueDate: '', dueDate: '' }, updatedClient);
        } finally {
            setIsSaving(false);
        }
    };

    const isClientListEmpty = !clients || clients.length === 0;

    return (
        <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${className || 'h-[calc(100vh-9rem)]'}`}>
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-4">
                    {onBack && <button onClick={onBack} className="text-gray-500 p-1 rounded-full hover:bg-gray-100"><ArrowLeftIcon className="w-6 h-6" /></button>}
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-tight">Financial Commitment</h2>
                </div>
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-gray-900">
                <LedgerSidebar 
                    clients={clients}
                    fixedClient={fixedClient}
                    selectedClient={selectedClient}
                    setSelectedClientId={setSelectedClientId}
                    originalPrice={originalPrice}
                    discountValue={discountValue}
                    setDiscountValue={setDiscountValue}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    installmentCount={installmentCount}
                    setInstallmentCount={setInstallmentCount}
                    isClientListEmpty={isClientListEmpty}
                />

                <div className="flex-grow p-6 overflow-y-auto scrollbar-thin">
                    {selectedClient ? (
                        <CommitmentSummary 
                            financialSummary={financialSummary}
                            formatCurrency={formatCurrency}
                            isSaving={isSaving}
                            onCommit={handleFormSubmit}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 p-10 text-center">
                            <UserCheckIcon className="w-16 h-16 mb-4" />
                            <p className="text-lg font-bold uppercase tracking-widest">Select Account</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
