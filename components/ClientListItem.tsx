
import React from 'react';
import { Client, Milestone } from '../types';
import { EyeIcon, PencilIcon, ChevronDownIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from './icons/DummyIcons';

interface ClientListItemProps {
  client: Client;
  onViewDetails: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  milestones: Milestone[];
  style?: React.CSSProperties; // For virtualization positioning
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const getStatusColor = (status: Client['status']) => {
  switch (status) {
    case 'Active Client':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Refunded':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Reallocated':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const formatCurrency = (amount: number) => {
    return `GHC ${new Intl.NumberFormat('en-GH').format(amount)}`;
};

const ClientListItem: React.FC<ClientListItemProps> = ({ 
    client, 
    onViewDetails, 
    onEdit, 
    onDelete, 
    milestones, 
    style, 
    isExpanded = false, 
    onToggleExpand 
}) => {
  const currentMilestone = milestones.find(m => m.acronym === client.stage) || { progress: 0, label: 'Unknown Stage' };

  return (
    <div style={style} className="px-2 py-2">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-12 gap-4 items-center hover:shadow-md transition-all duration-200 h-full">
            {/* Client */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                <div 
                    title={client.isComplete ? 'Client record is complete.' : 'Client record is incomplete — update required.'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white ${client.isComplete ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {client.initials}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                        {client.name}
                        <span title={client.isComplete ? "Complete" : "Incomplete"}>
                            {client.isComplete 
                                ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> 
                                : <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />}
                        </span>
                    </p>
                    <div className="w-full mt-2">
                        {isExpanded && (
                            <div className="mb-1 animate-fade-in">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span title={currentMilestone.label}>Stage: <strong>{client.stage}</strong></span>
                                    <span>{currentMilestone.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${currentMilestone.progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {onToggleExpand && (
                    <button onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1">
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
            {/* Contact */}
            <div className="col-span-12 md:col-span-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                <p className="truncate" title={client.email}>{client.email}</p>
                <p>{client.phone}</p>
            </div>
            {/* Location */}
            <div className="col-span-12 md:col-span-2 text-sm truncate">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={client.location}>{client.location}</p>
                <p className="text-gray-500 dark:text-gray-400">Plot: {client.plot}</p>
            </div>
            {/* Status */}
            <div className="col-span-6 md:col-span-1 text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                </span>
            </div>
            {/* Payment Info */}
            <div className="col-span-12 md:col-span-2 text-xs">
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Total:</span> <span className="dark:text-gray-300">{formatCurrency(client.payment.total)}</span></p>
                <p><span className="font-semibold text-red-600 dark:text-red-400">Outstanding:</span> <span className="dark:text-gray-300">{formatCurrency(client.payment.balance)}</span></p>
            </div>
            {/* Actions */}
            <div className="col-span-12 md:col-span-1 flex items-center gap-2 justify-end md:justify-start">
                <button onClick={() => onViewDetails(client)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={`View details for ${client.name}`}>
                    <EyeIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onEdit(client)} className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={`Edit ${client.name}`}>
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(client.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={`Delete ${client.name}`}>
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    </div>
  );
};

export default ClientListItem;
