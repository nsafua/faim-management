import React from 'react';
import { Client, Milestone } from '../types';
import { EyeIcon, PencilIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from './icons/DummyIcons';

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active Client':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Refunded':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Refund Ongoing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'Refund Scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Reallocated':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const formatCurrency = (amount: number) => {
    return `₵${new Intl.NumberFormat('en-GH').format(amount)}`;
};

const ClientListItem: React.FC<ClientListItemProps> = ({ 
    client, 
    onViewDetails, 
    onEdit, 
    onDelete, 
    style
}) => {
  const getDisplayStatus = () => {
    if (client.refundPlan) {
        if (client.refundPlan.isCompleted) return 'Refunded';
        if (client.refundPlan.isCancelled) return 'Active Client';
        
        const today = new Date().toISOString().split('T')[0];
        if (today < client.refundPlan.startDate) return 'Refund Scheduled';
        return 'Refund Ongoing';
    }
    return client.status;
  };

  const displayStatus = getDisplayStatus();

  return (
    <div style={style} className="px-2">
        <div className="bg-white dark:bg-gray-900/50 py-2 px-4 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-full">
            {/* Client & Phone */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                <div 
                    title={client.isComplete ? 'Complete' : 'Incomplete'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs text-white ${client.isComplete ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {client.initials}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                        {client.name}
                        <span title={client.isComplete ? "Complete" : "Incomplete"}>
                            {client.isComplete 
                                ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> 
                                : <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{client.phone}</p>
                </div>
            </div>

            {/* Location */}
            <div className="col-span-12 md:col-span-4 text-sm">
                <p className="font-semibold text-gray-700 dark:text-gray-200 truncate" title={client.location}>
                    {client.location}
                </p>
                <p className="text-xs text-gray-400 truncate">{client.plot}</p>
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2 text-center">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap ${getStatusColor(displayStatus)}`}>
                    {displayStatus}
                </span>
            </div>

            {/* Financials (Outstanding Only) */}
            <div className="col-span-12 md:col-span-1 text-sm">
                <p className="font-black text-gray-800 dark:text-gray-200 text-right">{formatCurrency(client.payment.balance)}</p>
            </div>

            {/* Actions */}
            <div className="col-span-12 md:col-span-1 flex items-center gap-1 justify-end">
                <button onClick={() => onViewDetails(client)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full transition-colors" title="View">
                    <EyeIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onEdit(client)} className="text-gray-400 hover:text-green-600 p-1.5 rounded-full transition-colors" title="Edit">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(client.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-full transition-colors" title="Delete">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    </div>
  );
};

export default ClientListItem;
