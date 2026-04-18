
import React from 'react';
import { Client } from '../../types';
import { Card } from '../ui/Card';
import { Select } from '../ui/Input';

interface ClientSelectorProps {
    clients: Client[];
    selectedClientId: number | '';
    onSelect: (id: number | '') => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ clients, selectedClientId, onSelect }) => {
    return (
        <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-dashed border-2">
            <Select 
                label="Select Client Dossier" 
                value={selectedClientId} 
                onChange={e => onSelect(e.target.value ? Number(e.target.value) : '')}
            >
                <option value="">-- Choose a client to view progress --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plot})</option>)}
            </Select>
        </Card>
    );
};
