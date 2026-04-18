import React, { useState, useEffect, useMemo } from 'react';
import { Client, Invoice, PaymentTransaction, Staff, Role, AppNotification, RefundPlan } from '../types';
import { 
    BellIcon,
    UserCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    ChartBarIcon,
    DocumentDuplicateIcon,
    ArrowTrendingUpIcon
} from '../components/icons/DummyIcons';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { NotificationCenter } from '../components/NotificationCenter';
import { AccountOverview } from '../components/account/AccountOverview';
import { AccountHistory } from '../components/account/AccountHistory';
import { RefundPlanForm } from '../components/account/RefundPlanForm';
import { useNotificationTriggers } from '../hooks/useNotificationTriggers';
import { useProperties, useMilestones } from '../hooks/useAppData';
import { useModal } from '../context/ModalContext';
import { MODAL_TYPES } from '../components/ModalManager';
import { AccountStatementModal } from '../components/financials/AccountStatementModal';
import { recordPaymentAtomic } from '../services/financeDbService';

interface AccountManagementPageProps {
  clients: Client[];
  onSaveClient: (client: Client) => Promise<Client>;
  onClientSelect?: (client: Client) => void;
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => Promise<void>;
  clientForInvoice: Client | null;
  setClientForInvoice: (client: Client | null) => void;
  receiptPattern: any; 
  setReceiptPattern: any;
  setReceiptAlerts: any;
  currentStaff: Staff;
  roles: Role[];
  setActivePage: (page: string, context?: any) => void;
  overrideClientId?: number | null;
  isEmbedded?: boolean;
}

const AccountManagementPage: React.FC<AccountManagementPageProps> = ({ 
    clients, onSaveClient, clientForInvoice, setClientForInvoice, currentStaff, roles, setActivePage, overrideClientId = null, isEmbedded = false
}) => {
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
    // FIX: Corrected variable name from 'matching property' to 'matchingProperty' to resolve reference error.
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
    // Authority Redirect: Use the atomic transaction service
    await recordPaymentAtomic(client.id, paymentData, currentStaff.fullName);
    
    // Background Milestone Sync
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
      if(selectedClient) {
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

  return (
    <div className={`flex flex-col ${isEmbedded ? 'h-auto' : 'h-[calc(100vh-120px)]'} space-y-6`}>
      {!isEmbedded && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Management</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">Standard bookkeeping ledger and transactional audit.</p>
          </div>
          <div className="flex gap-3">
            {canGenerateStatement && (
              <Button 
                variant="secondary"
                disabled={!selectedClient}
                className="bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400 font-bold"
                onClick={() => setStatementModalOpen(true)}
                icon={<DocumentDuplicateIcon className="w-5 h-5" />}
              >
                Official Statement
              </Button>
            )}
            <Button 
              variant={roleAlerts.length > 0 ? 'primary' : 'secondary'} 
              onClick={() => setViewMode(viewMode === 'alerts' ? 'list' : 'alerts')} 
              icon={<BellIcon className="w-5 h-5" />}
              className="relative"
            >
                Role Alerts
                {roleAlerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">{roleAlerts.length}</span>
                    </span>
                )}
            </Button>
            <Button variant="secondary" onClick={() => setActivePage('Analytics & Reports')} icon={<ChartBarIcon className="w-5 h-5" />}>
                Business Analysis
            </Button>
          </div>
        </div>
      )}

      <div className="flex-grow flex gap-6 overflow-hidden">
        <div className="w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col shrink-0 overflow-hidden">
          {!isEmbedded && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
               <Select 
                label="Select Account" 
                value={selectedClientId || ''} 
                onChange={(e) => {
                    setSelectedClientId(Number(e.target.value));
                    setClientForInvoice(null);
                }}
              >
                <option value="">-- Choose Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
          )}
          <nav className="p-2 space-y-1">
            <button 
              onClick={() => setActiveSubModule('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeSubModule === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <DocumentTextIcon className="w-5 h-5" />
              Overview
            </button>
            <button 
              onClick={() => setActiveSubModule('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeSubModule === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <ClockIcon className="w-5 h-5" />
              History
            </button>
            {selectedClient && (
              <button 
                onClick={() => setActiveSubModule('refund')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeSubModule === 'refund' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <ArrowTrendingUpIcon className="w-5 h-5 rotate-180" />
                Refunds
              </button>
            )}
          </nav>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
            {viewMode === 'alerts' ? (
                <NotificationCenter 
                    notifications={localNotifications}
                    currentRole={currentRoleName}
                    onReschedule={() => {}}
                    onMarkRead={(id) => setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
                />
            ) : !selectedClient ? (
                <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 opacity-40 py-20">
                  <UserCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-xl font-black uppercase text-gray-400">
                    {isEmbedded ? 'Client data unavailable.' : 'Select a Client to view financial records'}
                  </p>
                </div>
            ) : activeSubModule === 'overview' ? (
                <AccountOverview
                    selectedClient={selectedClient}
                    originalPricePerPlot={originalPricePerPlot}
                    discountAmount={discountAmount}
                    priceAfterDiscount={priceAfterDiscount}
                    installmentOption={installmentOption}
                    setInstallmentOption={setInstallmentOption}
                    onInitialSave={handleInitialSave}
                    isSaving={isSaving}
                />
            ) : activeSubModule === 'history' ? (
                <AccountHistory 
                    selectedClient={selectedClient}
                    canMakePayment={canMakePayment}
                    isCEO={isCEO}
                    isAccountant={isAccountant}
                    onMakePayment={openPaymentModal}
                    onAuthorizeAmendment={() => setActivePage('Amendment Form', selectedClient)}
                    onOpenRefund={() => setActiveSubModule('refund')}
                    paymentAggregation={paymentAggregation}
                />
            ) : (
                <RefundPlanForm 
                    client={selectedClient}
                    canEdit={isCEO || isAccountant}
                    userName={currentStaff.fullName}
                    onSave={handleSaveRefundPlan}
                />
            )}
        </div>
      </div>

      {isStatementModalOpen && selectedClient && (
          <AccountStatementModal 
            isOpen={isStatementModalOpen}
            onClose={() => setStatementModalOpen(false)}
            client={selectedClient}
            properties={properties}
            setActivePage={setActivePage}
          />
      )}
    </div>
  );
};

export default AccountManagementPage;