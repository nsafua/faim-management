
import React from 'react';
import { Lead, Staff } from '../../types';
import { STAGE_COLORS } from './constants';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { 
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftEllipsisIcon,
    PencilIcon,
    TrashIcon
} from '../icons/DummyIcons';

interface LeadsListProps {
    leads: Lead[];
    staffList: Staff[];
    isLoading: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    onConvert: (lead: Lead) => void;
    onComment: (lead: Lead) => void;
    onEdit: (lead: Lead) => void;
    onDelete: (id: number) => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
    leads,
    staffList,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    onConvert,
    onComment,
    onEdit,
    onDelete
}) => {
    // Virtual List Row Renderer
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const lead = leads[index];
        const isOdd = index % 2 !== 0;
        
        return (
            <div style={style} className={`flex items-center text-sm border-b dark:border-gray-700 ${isOdd ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}>
                <div className="flex-1 px-4 py-2 font-medium text-gray-900 dark:text-white truncate">
                    <div>{lead.fullName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.email} | {lead.phone}</div>
                </div>
                <div className="w-32 px-4 py-2 text-gray-600 dark:text-gray-300 truncate hidden md:block">{lead.source}</div>
                <div className="w-40 px-4 py-2 text-gray-600 dark:text-gray-300 truncate hidden md:block">{staffList.find(r => r.id === lead.assignedRepId)?.fullName || 'Unassigned'}</div>
                <div className="w-32 px-4 py-2 text-gray-600 dark:text-gray-300 hidden lg:block">{new Date(lead.lastContactDate).toLocaleDateString()}</div>
                <div className="w-40 px-4 py-2 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STAGE_COLORS[lead.status].bg} ${STAGE_COLORS[lead.status].text} ${STAGE_COLORS[lead.status].darkBg} ${STAGE_COLORS[lead.status].darkText}`}>
                        {lead.status}
                    </span>
                </div>
                <div className="w-40 px-4 py-2 flex justify-center gap-2">
                    {lead.status !== 'Converted to Client' && 
                        <button onClick={() => onConvert(lead)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1" title="Convert to Client"><ArrowRightOnRectangleIcon className="w-5 h-5"/></button>
                    }
                    <button onClick={() => onComment(lead)} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 p-1" title="View Comments"><ChatBubbleLeftEllipsisIcon className="w-5 h-5"/></button>
                    <button onClick={() => onEdit(lead)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1" title="Edit Lead"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(lead.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1" title="Delete Lead"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-grow flex flex-col transition-colors overflow-hidden">
            {/* List Header */}
            <div className="flex bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 uppercase font-bold border-b dark:border-gray-700 flex-shrink-0">
                <div className="flex-1 px-4 py-3">Lead Name & Contact</div>
                <div className="w-32 px-4 py-3 hidden md:block">Source</div>
                <div className="w-40 px-4 py-3 hidden md:block">Assigned To</div>
                <div className="w-32 px-4 py-3 hidden lg:block">Last Contact</div>
                <div className="w-40 px-4 py-3 text-center">Status</div>
                <div className="w-40 px-4 py-3 text-center">Actions</div>
            </div>
            {/* Virtualized List Body */}
            <div className="flex-grow">
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            height={height}
                            itemCount={leads.length}
                            itemSize={80} // Fixed height for rows
                            width={width}
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
                {leads.length === 0 && <div className="text-center p-8 text-gray-500 dark:text-gray-400">No leads found.</div>}
            </div>
            {/* Pagination Controls */}
            <div className="py-2 text-center border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                {isLoading ? (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Loading data...</span>
                ) : hasNextPage ? (
                    <button 
                        onClick={() => fetchNextPage()} 
                        disabled={isFetchingNextPage}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                        {isFetchingNextPage ? 'Loading more...' : 'Load More Leads'}
                    </button>
                ) : leads.length > 0 ? (
                    <span className="text-gray-400 text-sm">All leads loaded</span>
                ) : null}
            </div>
        </div>
    );
};
