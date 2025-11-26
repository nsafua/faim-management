import React, { useState, useMemo, useEffect } from 'react';
import { Client } from '../types';
import { ArrowLeftIcon, FolderIcon, MagnifyingGlassIcon } from '../components/icons/DummyIcons';

interface ClientDocumentationPageProps {
    onBack: () => void;
    clients: Client[];
    onSaveClient: (client: Client) => Promise<Client>;
}

const getStatusColor = (status: Client['documentation']['status']) => {
    switch(status) {
        case 'Collected': return 'bg-green-100 text-green-800';
        case 'Ready': return 'bg-blue-100 text-blue-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
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
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                    <FolderIcon className="w-10 h-10 text-orange-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Client Documentation</h1>
                        <p className="text-gray-500 mt-1">Track and manage client document collection status.</p>
                    </div>
                </div>
            </div>

             <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by client name, plot, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {Object.keys(clientsByProperty).map(location => (
                    <div key={location} className="bg-white rounded-lg shadow-sm border">
                        <h3 className="px-6 py-4 text-lg font-semibold text-gray-800 border-b">{location}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-gray-600">Client</th>
                                        <th className="px-6 py-3 font-medium text-gray-600">Plot</th>
                                        <th className="px-6 py-3 font-medium text-gray-600">Doc Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {clientsByProperty[location].map(client => (
                                        <tr key={client.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{client.plot}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={client.documentation.status}
                                                    onChange={(e) => handleStatusChange(client.id, e.target.value as Client['documentation']['status'])}
                                                    className={`p-1 text-xs font-semibold rounded-md border-transparent focus:ring-2 focus:ring-blue-500 ${getStatusColor(client.documentation.status)}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Ready">Ready for Pickup</option>
                                                    <option value="Collected">Collected</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientDocumentationPage;