import React from 'react';
import { Client, Invoice, Staff, Role } from '../types';
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
import { useProperties } from '../hooks/useAppData';
import { AccountStatementModal } from '../components/financials/AccountStatementModal';
import { useAccountManagement } from '../hooks/useAccountManagement';

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
  const {
      viewMode, setViewMode,
      activeSubModule, setActiveSubModule,
      selectedClientId, setSelectedClientId,
      isSaving,
      installmentOption, setInstallmentOption,
      isStatementModalOpen, setStatementModalOpen,
      selectedClient,
      isCEO, isAccountant, canGenerateStatement, canMakePayment,
      originalPricePerPlot, discountAmount, priceAfterDiscount,
      paymentAggregation,
      handleInitialSave, handleSaveRefundPlan, openPaymentModal,
      localNotifications, setLocalNotifications,
      currentRoleName, roleAlerts
  } = useAccountManagement(clients, onSaveClient, clientForInvoice, setClientForInvoice, currentStaff, roles, overrideClientId);

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