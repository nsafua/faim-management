import React, { useState, useMemo } from 'react';
import { Client, Property, Staff, Role } from '../types';
import { ArrowLeftIcon, BriefcaseIcon, DocumentTextIcon, EnvelopeIcon, UserCircleIcon, UserGroupIcon } from '../components/icons/DummyIcons';
import ClientProfileHeader from '../components/ClientProfileHeader';
import PaymentSummary from '../components/PaymentSummary';
import InteractionHistory from '../components/InteractionHistory';

const InfoField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
    </div>
);

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            {icon}
            {title}
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            {children}
        </dl>
    </div>
);

interface ClientDetailPageProps {
  client: Client;
  properties: Property[];
  onBack: () => void;
  currentStaff: Staff;
  roles: Role[];
  setActivePage: (page: string, context?: any) => void;
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ client, onBack, currentStaff, roles, setActivePage }) => {
  const currentRoleName = useMemo(() => {
    return roles.find(r => r.id === currentStaff.roleId)?.name;
  }, [currentStaff, roles]);
  
  const canAmend = useMemo(() => {
      if (!currentRoleName) return false;
      return ['CEO', 'Administrator', 'Front desk executive'].includes(currentRoleName);
  }, [currentRoleName]);

  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Clients
        </button>
      </div>
      
      <ClientProfileHeader 
          client={client} 
          onAmend={canAmend ? () => setActivePage('Amendment Form', client) : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <DetailSection title="Personal & Contact Information" icon={<UserCircleIcon className="w-5 h-5 text-blue-600" />}>
              <InfoField label="Full Name" value={client.name} />
              <InfoField label="Date of Birth" value={client.dateOfBirth} />
              <InfoField label="Phone Number" value={client.phone} />
              <InfoField label="Email Address" value={client.email} />
              <InfoField label="Address" value={client.location} />
           </DetailSection>

           <DetailSection title="Next of Kin & Witness" icon={<UserGroupIcon className="w-5 h-5 text-blue-600" />}>
               <InfoField label="Next of Kin Name" value={client.nextOfKin.name} />
               <InfoField label="Next of Kin Phone" value={client.nextOfKin.phone} />
               <InfoField label="Next of Kin Relationship" value={client.nextOfKin.relationship} />
               <InfoField label="Witness Name" value={client.witness.name} />
               <InfoField label="Witness Phone" value={client.witness.phone} />
               <InfoField label="Witness Address" value={client.witness.address} />
           </DetailSection>

           <DetailSection title="Indenture & Documentation" icon={<DocumentTextIcon className="w-5 h-5 text-blue-600" />}>
              <InfoField label="Name on Indenture" value={client.indenture.name} />
              <InfoField label="Address on Indenture" value={client.indenture.address} />
              <InfoField label="Filled Form" value={client.filledFormPdf ? <span className="text-green-600 font-semibold">On File</span> : <span className="text-red-600 font-semibold">Missing</span>} />
           </DetailSection>

           <DetailSection title="Office Use" icon={<BriefcaseIcon className="w-5 h-5 text-blue-600" />}>
                <InfoField label="Sales Representative" value={client.officeUse.salesRep} />
                <InfoField label="Sales Manager" value={client.officeUse.salesManager} />
                <InfoField label="Accounts Head" value={client.officeUse.accountsHead} />
                <InfoField label="Clerk" value={client.officeUse.clerk} />
           </DetailSection>
        </div>
        <div className="lg:col-span-1 space-y-6">
           <PaymentSummary payment={client.payment} />
           <InteractionHistory interactions={client.interactions} />
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;