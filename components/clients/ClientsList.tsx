
import React from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ClientListItem from '../ClientListItem';
import { Client, Milestone } from '../../types';

interface ClientsListProps {
    clients: Client[];
    onViewDetails: (client: Client) => void;
    onEdit: (client: Client) => void;
    onDelete: (id: number) => void;
    milestones: Milestone[];
    expandedIds: Record<number, boolean>;
    toggleExpand: (id: number, index: number) => void;
    onScroll: (props: { scrollOffset: number }) => void;
    listRef: React.RefObject<List>;
}

export const ClientsList: React.FC<ClientsListProps> = ({
    clients, onViewDetails, onEdit, onDelete, milestones, expandedIds, toggleExpand, onScroll, listRef
}) => {
    const getItemSize = (index: number) => {
        // Increased base height from 64 to 76 to accommodate larger text (+2px bump)
        return expandedIds[clients[index]?.id] ? 140 : 76;
    };

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const client = clients[index];
        if (!client) return null;
        return (
            <ClientListItem 
                key={client.id} 
                client={client} 
                onViewDetails={onViewDetails} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                milestones={milestones}
                style={style}
                isExpanded={!!expandedIds[client.id]}
                onToggleExpand={() => toggleExpand(client.id, index)}
            />
        );
    };

    return (
        <div className="flex-grow relative mt-1">
            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-32 text-gray-500 dark:text-gray-400 text-center px-6">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-60">No clients yet. Create a new client to begin.</p>
                </div>
            ) : (
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            ref={listRef}
                            height={height}
                            itemCount={clients.length}
                            itemSize={getItemSize}
                            width={width}
                            onScroll={onScroll}
                            className="scrollbar-thin"
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            )}
        </div>
    );
};
