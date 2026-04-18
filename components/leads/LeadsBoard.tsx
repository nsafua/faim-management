
import React from 'react';
import { Lead, Staff } from '../../types';
import { KanbanCard } from './KanbanCard';
import { KANBAN_STAGES, STAGE_COLORS } from './constants';

interface LeadsBoardProps {
    leads: Lead[];
    staffList: Staff[];
    searchTerm: string;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: number) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: Lead['status']) => void;
    onCardClick: (lead: Lead) => void;
}

export const LeadsBoard: React.FC<LeadsBoardProps> = ({
    leads,
    staffList,
    searchTerm,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    onDragStart,
    onDragOver,
    onDrop,
    onCardClick
}) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-y-auto flex-grow p-1">
                {KANBAN_STAGES.map(stage => (
                    <div key={stage} onDragOver={onDragOver} onDrop={(e) => onDrop(e, stage)} className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg min-h-[200px] border border-gray-200 dark:border-gray-700 flex flex-col">
                        <h3 className={`font-semibold mb-3 pb-2 border-b-2 ${STAGE_COLORS[stage].border} ${STAGE_COLORS[stage].darkBorder} ${STAGE_COLORS[stage].text} ${STAGE_COLORS[stage].darkText}`}>
                            {stage} ({leads.filter(l => l.status === stage).length})
                        </h3>
                        <div className="space-y-3 flex-grow">
                            {leads.filter(l => l.status === stage).map(lead => (
                                <KanbanCard 
                                    key={lead.id} 
                                    lead={lead} 
                                    assignedRep={staffList.find(u => u.id === lead.assignedRepId)}
                                    onDragStart={onDragStart}
                                    onClick={onCardClick}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center py-2 flex-shrink-0">
                {hasNextPage && !searchTerm && (
                    <button 
                        onClick={() => fetchNextPage()} 
                        disabled={isFetchingNextPage} 
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                    >
                        {isFetchingNextPage ? 'Loading more...' : 'Load more leads to board'}
                    </button>
                )}
            </div>
        </>
    );
};
