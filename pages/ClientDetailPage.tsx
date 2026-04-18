import React, { useState, useMemo } from 'react';
import { Client, Property, Staff, Role } from '../types';
import { 
    ArrowLeftIcon, 
    BriefcaseIcon, 
    DocumentTextIcon, 
    UserCircleIcon, 
    UserGroupIcon, 
    BanknotesIcon, 
    UserCheckIcon, 
    FolderIcon,
    BuildingLibraryIcon,
    InformationCircleIcon
} from '../components/icons/DummyIcons';
import ClientProfileHeader from '../components/ClientProfileHeader';
import PaymentSummary from '../components/PaymentSummary';
import InteractionHistory from '../components/InteractionHistory';
import AccountManagementPage from './AccountManagementPage';
import DocumentPickupModal from '../components/DocumentPickupModal';
import ClientDocumentationPage from './ClientDocumentationPage';
import { useClients, useInvoices, useMilestones } from '../hooks/useAppData';
import { Badge } from '../components/ui/Badge';

// Modular Imports
import { InfoField } from '../components/client-details/InfoField';
import { DetailSection } from '../components/client-details/DetailSection';

interface ClientDetailPageProps {
  client: Client;
  properties: Property[];
  onBack: () => void;
  currentStaff: Staff;
  roles: Role[];
  setActivePage: (page: string, context?: any) => void;
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ client, properties, onBack, currentStaff, roles, setActivePage }) => {
  const { saveClient } = useClients();
  const { invoices, saveInvoice } = useInvoices();
  const { saveMilestone } = useMilestones();
  const [activeTab, setActiveTab] = useState<'details' | 'financials' | 'milestones'>('details');
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  const isGroup = client.clientType === 'Corporate/Group';
  
  const paymentPercentage = useMemo(() => {
    const total = client.payment.total || 1;
    return (client.payment.paid / total) * 100;
  }, [client]);

  const isQualified = paymentPercentage >= 70;

  const currentRoleName = useMemo(() => {
    return roles.find(r => r.id === currentStaff.roleId)?.name;
  }, [currentStaff, roles]);
  
  const canAmend = useMemo(() => {
      if (!currentRoleName) return false;
      return ['CEO', 'Administrator', 'Front Desk Executive'].includes(currentRoleName);
  }, [currentRoleName]);

  const canViewMilestones = true;

  const handleDocumentPickup = async (pickupData: { finalPickupDate: string; pickupPersonName: string; idCardUrl: string }) => {
    const updatedClient: Client = {
        ...client,
        stage: 'DPU',
        documentation: {
            ...client.documentation,
            status: 'Collected',
            collectedDate: pickupData.finalPickupDate,
            collectedBy: pickupData.pickupPersonName,
            pickupDetails: {
                finalPickupDate: pickupData.finalPickupDate,
                pickupPersonName: pickupData.pickupPersonName,
                idCardImageUrl: pickupData.idCardUrl
            }
        },
        interactions: [
            {
                id: Date.now(),
                type: 'Note',
                date: new Date().toISOString(),
                agent: currentStaff.fullName,
                notes: `Documents picked up by ${pickupData.pickupPersonName} on ${pickupData.finalPickupDate}. Stage updated to DPU.`
            },
            ...client.interactions
        ]
    };
    await saveClient(updatedClient);
    await saveMilestone({ clientId: client.id, milestoneCode: 'DPU', dateCompleted: pickupData.finalPickupDate, notes: `Documents collected by ${pickupData.pickupPersonName}` });
    await saveMilestone({ clientId: client.id, milestoneCode: 'CPD', dateCompleted: new Date().toISOString().split('T')[0], notes: 'Final confirmation of document handover.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Clients
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        <ClientProfileHeader 
            client={client} 
            onAmend={canAmend ? () => setActivePage('Amendment Form', client) : undefined}
        />
        <div className="flex justify-end px-6 -mt-16 relative z-10 gap-3">
             <button 
                onClick={() => setIsPickupModalOpen(true)}
                className="bg-amber-600 dark:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
             >
                <UserCheckIcon className="w-5 h-5" /> Document Pickup
             </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'details' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
                  {isGroup ? <BuildingLibraryIcon className="w-5 h-5"/> : <UserCircleIcon className="w-5 h-5"/>}
                  {isGroup ? 'Group Profile' : 'Details'}
              </button>
              <button onClick={() => setActiveTab('financials')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'financials' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
                  <BanknotesIcon className="w-5 h-5"/>
                  Financials
              </button>
              {canViewMilestones && (
                <button onClick={() => setActiveTab('milestones')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'milestones' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
                    <FolderIcon className="w-5 h-5"/>
                    Milestones
                </button>
              )}
          </nav>
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="lg:col-span-2 space-y-6">
                
                {/* Qualification Badge for Group/Individual */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isQualified ? 'bg-green-50 border-green-200 dark:bg-green-900/10' : 'bg-amber-50 border-amber-200 dark:bg-green-900/10'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isQualified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isQualified ? <UserCheckIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Allocation Qualification</p>
                            <p className={`text-lg font-bold ${isQualified ? 'text-green-700' : 'text-amber-700'}`}>
                                {isQualified ? 'Qualified for Plot Selection (≥70%)' : 'Payment Milestone Pending (<70%)'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black">{Math.round(paymentPercentage)}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Current Standing</p>
                    </div>
                </div>

                <DetailSection title={isGroup ? "Corporate Identity & Contact" : "Personal & Contact Information"} icon={isGroup ? <BuildingLibraryIcon className="w-5 h-5 text-blue-600" /> : <UserCircleIcon className="w-5 h-5 text-blue-600" />}>
                    <InfoField label={isGroup ? "Company Name" : "Full Name"} value={client.name} />
                    <InfoField label={isGroup ? "Primary Contact Liaison" : "Date of Birth"} value={isGroup ? client.otherNames : client.dateOfBirth} />
                    <InfoField label="Phone Number" value={client.phone} />
                    <InfoField label="Email Address" value={client.email} />
                    <InfoField label="Registered Address" value={client.location} />
                    {isGroup && <InfoField label="Tracking Mode" value={<Badge variant="info">{client.groupMetadata?.paymentMode || 'Group Ledger'}</Badge>} />}
                </DetailSection>

                <DetailSection title={isGroup ? "Shared Group Logistics" : "Next of Kin & Witness"} icon={<UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}>
                    {!isGroup ? (
                        <>
                            <InfoField label="Next of Kin Name" value={client.nextOfKin.name} />
                            <InfoField label="Next of Kin Phone" value={client.nextOfKin.phone} />
                            <InfoField label="Next of Kin Relationship" value={client.nextOfKin.relationship} />
                        </>
                    ) : (
                        <InfoField label="Total Plot Entitlement" value={`${client.groupMetadata?.totalPlotsEntitlement || client.plot.split(',').length} Plots`} />
                    )}
                    <InfoField label="Witness Name" value={client.witness.name} />
                    <InfoField label="Witness Phone" value={client.witness.phone} />
                    <InfoField label="Witness Address" value={client.witness.address} />
                </DetailSection>

                <DetailSection title="Indenture & Documentation" icon={<DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}>
                    <InfoField label="Name on Indenture" value={client.indenture.name} />
                    <InfoField label="Address on Indenture" value={client.indenture.address} />
                    <InfoField label="Doc Status" value={client.documentation.status} />
                    <InfoField label="Filled Form" value={client.filledFormPdf ? <span className="text-green-600 dark:text-green-400 font-semibold">On File</span> : <span className="text-red-600 dark:text-red-400 font-semibold">Missing</span>} />
                </DetailSection>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <PaymentSummary payment={client.payment} />
                <InteractionHistory interactions={client.interactions} />
            </div>
        </div>
      )}

      {activeTab === 'financials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AccountManagementPage 
                  clients={[client]}
                  onSaveClient={saveClient}
                  invoices={invoices}
                  onSaveInvoice={saveInvoice}
                  clientForInvoice={null}
                  setClientForInvoice={() => {}}
                  receiptPattern={null}
                  setReceiptPattern={() => {}}
                  setReceiptAlerts={() => {}}
                  currentStaff={currentStaff}
                  roles={roles}
                  setActivePage={setActivePage}
                  overrideClientId={client.id}
                  isEmbedded={true}
              />
          </div>
      )}

      {activeTab === 'milestones' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ClientDocumentationPage clients={[client]} onSaveClient={saveClient} fixedClientId={client.id} />
          </div>
      )}

      {/* FIX: clientid to clientId */}
      <DocumentPickupModal isOpen={isPickupModalOpen} onClose={() => setIsPickupModalOpen(false)} onConfirm={handleDocumentPickup} clientName={client.name} clientId={client.id} />
    </div>
  );
};

// FIX: Added default export for ClientDetailPage to resolve import error in App.tsx
export default ClientDetailPage;