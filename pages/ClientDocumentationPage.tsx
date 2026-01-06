
import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { ArrowLeftIcon, FolderIcon, MagnifyingGlassIcon } from '../components/icons/DummyIcons';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

interface ClientDocumentationPageProps {
    onBack: () => void;
    clients: Client[];
    onSaveClient: (client: Client) => Promise<Client>;
}

const getStatusColor = (status: Client['documentation']['status']) => {
    switch(status) {
        case 'Collected': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 focus:ring-green-500';
        case 'Ready': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 focus:ring-blue-500';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 focus:ring-yellow-500';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 focus:ring-gray-500';
    }
}

const ClientDocumentationPage: React.FC<ClientDocumentationPageProps> = ({ onBack, clients, onSaveClient }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) return clients;
        const lowercasedFilter = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.name.toLowerCase().includes(lowercasedFilter) ||
            client.plot.toLowerCase().includes(lowercasedFilter) ||
            client.location.toLowerCase().includes(lowercasedFilter)
        );
    }, [clients, searchTerm]);

    const clientsByProperty = useMemo(() => {
        return filteredClients.reduce<Record<string, Client[]>>((acc, client) => {
            const location = client.location || 'Unassigned';
            if (!acc[location]) {
                acc[location] = [];
            }
            acc[location].push(client);
            return acc;
        }, {});
    }, [filteredClients]);

    const handleStatusChange = (clientId: number, newStatus: Client['documentation']['status']) => {
        const clientToUpdate = clients.find(c => c.id === clientId);
        if (clientToUpdate) {
             const newDocInfo = { ...clientToUpdate.documentation, status: newStatus };
            if (newStatus === 'Collected' && !newDocInfo.collectedDate) {
                newDocInfo.collectedDate = new Date().toISOString().split('T')[0];
            }
            onSaveClient({ ...clientToUpdate, documentation: newDocInfo });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                    <FolderIcon className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Client Documentation</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage client document collection status.</p>
                    </div>
                </div>
            </div>

             <Card className="p-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search by client name, plot, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            <div className="space-y-6">
                {Object.keys(clientsByProperty).map(location => (
                    <Card key={location} title={location} className="overflow-hidden">
                        <TableContainer className="border-0 shadow-none rounded-none">
                            <table className="w-full text-sm">
                                <Thead>
                                    <tr>
                                        <Th>Client</Th>
                                        <Th>Plot</Th>
                                        <Th>Doc Status</Th>
                                    </tr>
                                </Thead>
                                <Tbody>
                                    {clientsByProperty[location].map(client => (
                                        <Tr key={client.id}>
                                            <Td className="font-medium text-gray-900 dark:text-white">{client.name}</Td>
                                            <Td className="text-gray-600 dark:text-gray-300">{client.plot}</Td>
                                            <Td>
                                                <select
                                                    value={client.documentation.status}
                                                    onChange={(e) => handleStatusChange(client.id, e.target.value as Client['documentation']['status'])}
                                                    className={`p-1.5 text-xs font-semibold rounded-md border-transparent focus:outline-none focus:ring-2 cursor-pointer transition-colors ${getStatusColor(client.documentation.status)}`}
                                                >
                                                    <option value="Pending" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Pending</option>
                                                    <option value="Ready" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Ready for Pickup</option>
                                                    <option value="Collected" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Collected</option>
                                                </select>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </table>
                        </TableContainer>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ClientDocumentationPage;
