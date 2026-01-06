
import React, { useState, useMemo } from 'react';
import { Client, Property } from '../types';
import { ArrowLeftIcon, UserCheckIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

interface AllocatePlotPageProps {
    onBack: () => void;
    clients: Client[];
    properties: Property[];
}

const AllocatePlotPage: React.FC<AllocatePlotPageProps> = ({ onBack, clients, properties }) => {
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');

    const selectedClient = useMemo(() => {
        return clients.find(c => c.id === selectedClientId);
    }, [selectedClientId, clients]);

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                    <UserCheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Allocate Plot to Client</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Assign purchased plots and update ownership records.</p>
                    </div>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                        label="Select Client" 
                        value={selectedClientId} 
                        onChange={(e) => setSelectedClientId(Number(e.target.value))}
                    >
                        <option value="">-- Choose a Client --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name} ({client.location})</option>
                        ))}
                    </Select>
                    <Select 
                        label="Select Property" 
                        value={selectedPropertyId} 
                        onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                    >
                        <option value="">-- Choose a Property --</option>
                        {properties.map(prop => (
                            <option key={prop.id} value={prop.id}>{prop.location}</option>
                        ))}
                    </Select>
                </div>
            </Card>

            {selectedClient && (
                <Card title="Client Allocation Summary">
                    <TableContainer>
                        <table className="w-full text-sm text-left">
                            <Thead>
                                <tr>
                                    <Th>Client Name</Th>
                                    <Th>Location</Th>
                                    <Th>Number of Plot(s)</Th>
                                    <Th>Plot Number(s)</Th>
                                </tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td className="font-medium text-gray-900 dark:text-white">{selectedClient.name}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300">{selectedClient.location}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300">{selectedClient.plot.split(',').length}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300">{selectedClient.plot}</Td>
                                </Tr>
                            </Tbody>
                        </table>
                    </TableContainer>
                </Card>
            )}
        </div>
    );
};

export default AllocatePlotPage;
