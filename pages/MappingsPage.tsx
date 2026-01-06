
import React from 'react';
import { Property } from '../types';
import { ArrowLeftIcon, MapPinIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

interface MappingsPageProps {
    onBack: () => void;
    properties: Property[];
}

const MappingsPage: React.FC<MappingsPageProps> = ({ onBack, properties }) => {
    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                    <MapPinIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mappings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage digital coordinates and GPS data for properties.</p>
                    </div>
                </div>
            </div>

            <Card>
                <TableContainer>
                    <table className="w-full text-sm text-left">
                        <Thead>
                            <tr>
                                <Th>Property Location</Th>
                                <Th>Coordinates (Lat, Long)</Th>
                                <Th>Map Status</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {properties.map(prop => (
                                <Tr key={prop.id}>
                                    <Td className="font-medium text-gray-900 dark:text-white">{prop.location}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300">5.6037° N, 0.1870° W (Mock)</Td>
                                    <Td><span className="text-green-600 dark:text-green-400 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Mapped</span></Td>
                                    <Td className="text-center">
                                        <button className="text-blue-600 hover:underline dark:text-blue-400">Update Coordinates</button>
                                    </Td>
                                </Tr>
                            ))}
                             {properties.length === 0 && (
                                <Tr>
                                    <Td className="text-center py-8 text-gray-500 dark:text-gray-400" colSpan={4}>No properties available for mapping.</Td>
                                </Tr>
                            )}
                        </Tbody>
                    </table>
                </TableContainer>
            </Card>
        </div>
    );
};

export default MappingsPage;
