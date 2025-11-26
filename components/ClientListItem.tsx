

import React, { useState } from 'react';
import { Client, Milestone } from '../types';
import { DocumentDuplicateIcon, EyeIcon, PencilIcon, ChevronDownIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from './icons/DummyIcons';

interface ClientListItemProps {
  client: Client;
  onViewDetails: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  milestones: Milestone[];
}

const getStatusColor = (status: Client['status']) => {
  switch (status) {
    case 'Active Client':
      return 'bg-green-100 text-green-800';
    case 'Refunded':
      return 'bg-yellow-100 text-yellow-800';
    case 'Reallocated':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
    return `GHC ${new Intl.NumberFormat('en-GH').format(amount)}`;
};

const ClientListItem: React.FC<ClientListItemProps> = ({ client, onViewDetails, onEdit, onDelete, milestones }) => {
  const [milestoneVisible, setMilestoneVisible] = useState(false);
  const currentMilestone = milestones.find(m => m.acronym === client.stage) || { progress: 0, label: 'Unknown Stage' };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-12 gap-4 items-center hover:shadow-md transition-shadow">
        {/* Client */}
        <div className="col-span-12 md:col-span-4 flex items-center gap-3">
             <div 
                title={client.isComplete ? 'Client record is complete.' : 'Client record is incomplete — update required.'}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white ${client.isComplete ? 'bg-green-500' : 'bg-red-500'}`}
            >
                {client.initials}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    {client.name}
                    {/* FIX: Wrapped icons in a span with a title attribute to prevent type errors. */}
                    {client.isComplete 
                        ? <span title="Complete"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span> 
                        : <span title="Incomplete"><ExclamationTriangleIcon className="w-4 h-4 text-red-500" /></span>}
                </p>
                <div className="w-full mt-2">
                    {milestoneVisible && (
                         <div className="mb-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span title={currentMilestone.label}>Stage: <strong>{client.stage}</strong></span>
                                <span>{currentMilestone.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${currentMilestone.progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
             <button onClick={() => setMilestoneVisible(!milestoneVisible)} className="text-gray-400 hover:text-gray-600 p-1">
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${milestoneVisible ? 'rotate-180' : ''}`} />
            </button>
        </div>
        {/* Contact */}
        <div className="col-span-12 md:col-span-2 text-sm text-gray-600">
            <p>{client.email}</p>
            <p>{client.phone}</p>
        </div>
         {/* Location */}
        <div className="col-span-12 md:col-span-2 text-sm">
            <p className="font-medium text-gray-800">{client.location}</p>
            <p className="text-gray-500">Plot: {client.plot}</p>
        </div>
        {/* Status */}
        <div className="col-span-6 md:col-span-1 text-center">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                {client.status}
            </span>
        </div>
         {/* Payment Info */}
        <div className="col-span-12 md:col-span-2 text-xs">
            <p><span className="font-semibold text-gray-600">Total:</span> {formatCurrency(client.payment.total)}</p>
            <p><span className="font-semibold text-red-600">Outstanding:</span> {formatCurrency(client.payment.balance)}</p>
        </div>
         {/* Actions */}
        <div className="col-span-12 md:col-span-1 flex items-center gap-2">
            <button onClick={() => onViewDetails(client)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100" aria-label={`View details for ${client.name}`}>
                <EyeIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => onEdit(client)} className="text-gray-500 hover:text-green-600 p-1 rounded-full hover:bg-gray-100" aria-label={`Edit ${client.name}`}>
                <PencilIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => onDelete(client.id)} className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100" aria-label={`Delete ${client.name}`}>
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
  );
};

export default ClientListItem;