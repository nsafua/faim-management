
import React from 'react';
import { Lead, Staff } from '../../types';
import { STAGE_COLORS } from './constants';

interface KanbanCardProps {
    lead: Lead;
    assignedRep: Staff | undefined;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: number) => void;
    onClick: (lead: Lead) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ lead, assignedRep, onDragStart, onClick }) => {
    const { bg, text, darkBg, darkText } = STAGE_COLORS[lead.status];
    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={() => onClick(lead)}
            className={`p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all mb-3`}
        >
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 ${bg} ${text} ${darkBg} ${darkText}`}>{lead.status}</div>
            <p className="font-bold text-gray-800 dark:text-white">{lead.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{lead.phone} | {lead.source}</p>
            <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Last update: {new Date(lead.lastContactDate).toLocaleDateString()}</p>
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs" title={assignedRep?.fullName}>
                    {assignedRep?.initials || '??'}
                </div>
            </div>
        </div>
    );
};
