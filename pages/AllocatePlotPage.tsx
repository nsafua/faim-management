import React, { useState, useMemo } from 'react';
import { Client, Property } from '../types';
import { ArrowLeftIcon, UserCheckIcon } from '../components/icons/DummyIcons';

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

    const selectedProperty = useMemo(() => {
        return properties.find(p => p.id === selectedPropertyId);
    }, [selectedPropertyId, properties]);

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                    <UserCheckIcon className="w-10 h-10 text-green-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Allocate Plot to Client</h1>
                        <p className="text-gray-500 mt-1">Assign purchased plots and update ownership records.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="client-select" className="block text-sm font-medium text-gray-700">Select Client</label>
                        <select id="client-select" value={selectedClientId} onChange={(e) => setSelectedClientId(Number(e.target.value))} className="mt-1 block w-full input-class">
                            <option value="">-- Choose a Client --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name} ({client.location})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="property-select" className="block text-sm font-medium text-gray-700">Select Property</label>
                        <select id="property-select" value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(Number(e.target.value))} className="mt-1 block w-full input-class">
                            <option value="">-- Choose a Property --</option>
                            {properties.map(prop => (
                                <option key={prop.id} value={prop.id}>{prop.location}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedClient && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Allocation Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Client Name</th>
                                    <th className="px-4 py-2">Location</th>
                                    <th className="px-4 py-2">Number of Plot(s)</th>
                                    <th className="px-4 py-2">Plot Number(s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-4 py-3 font-medium text-gray-900">{selectedClient.name}</td>
                                    <td className="px-4 py-3">{selectedClient.location}</td>
                                    <td className="px-4 py-3">{selectedClient.plot.split(',').length}</td>
                                    <td className="px-4 py-3">{selectedClient.plot}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <style>{`.input-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input-class:focus { outline: none; --tw-ring-color: #3B82F6; border-color: #3B82F6; }`}</style>
        </div>
    );
};

export default AllocatePlotPage;
