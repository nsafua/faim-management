import React, { useState } from 'react';
import { Property, Staff } from '../../types';
import { 
    CheckCircleIcon, 
    EyeIcon, 
    ArchiveBoxIcon
} from '../icons/DummyIcons';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface ActivePortfolioProps {
    properties: Property[];
    isCEO: boolean;
    setActivePage: (page: string, context?: any) => void;
    handleArchiveClick: (prop: Property) => void;
    onSaveProperty: (property: Property) => Promise<void>;
}

export const ActivePortfolio: React.FC<ActivePortfolioProps> = ({
    properties,
    isCEO,
    setActivePage,
    handleArchiveClick,
    onSaveProperty
}) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
    const [editSellingPrice, setEditSellingPrice] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    const handlePropertyChange = (id: number) => {
        setSelectedPropertyId(id);
        const prop = properties.find(p => p.id === id);
        if (prop) {
            setEditSellingPrice(String(prop.price));
        }
    };

    const handleUpdatePrice = async () => {
        const prop = properties.find(p => p.id === selectedPropertyId);
        if (!prop || !editSellingPrice) return;

        setIsSaving(true);
        try {
            await onSaveProperty({
                ...prop,
                price: parseFloat(editSellingPrice)
            });
            alert('Selling price updated successfully. This price is now authoritative across the system.');
        } catch (error) {
            alert('Failed to update price.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                <Select 
                    label="Quick Management (Select Property)" 
                    value={selectedPropertyId} 
                    onChange={(e) => handlePropertyChange(Number(e.target.value))}
                >
                    <option value="">-- Choose Property --</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.location}</option>)}
                </Select>

                {selectedPropertyId && (
                    <div className="flex flex-col sm:flex-row gap-4 items-end animate-in fade-in duration-300">
                        <Input 
                            label="New Selling Price per Plot (Market Authority)"
                            type="number"
                            value={editSellingPrice}
                            onChange={(e) => setEditSellingPrice(e.target.value)}
                            placeholder="0.00"
                            className="font-black text-xl text-blue-600"
                            containerClassName="flex-grow"
                        />
                        <Button 
                            onClick={handleUpdatePrice} 
                            isLoading={isSaving}
                            icon={<CheckCircleIcon className="w-5 h-5" />}
                        >
                            Publish Authority Price
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Available Properties</h2>
                    <Badge variant="info">{properties.length} Active Listings</Badge>
                </div>
                
                <TableContainer>
                    <table className="w-full text-sm text-left">
                        <Thead>
                            <tr>
                                <Th>Location</Th>
                                <Th>Reg. Status</Th>
                                <Th>Plots Available</Th>
                                <Th className="text-right">Market Price</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {properties.length === 0 ? (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-20 text-gray-400 italic">
                                        No properties available. Add properties in CEO Hub.
                                    </Td>
                                </Tr>
                            ) : (
                                properties.map(prop => {
                                    const totalPlots = prop.inventory.reduce((sum, inv) => sum + inv.count, 0);
                                    const plotsSold = prop.inventory.reduce((sum, inv) => sum + inv.sold, 0);
                                    const plotsAvailable = totalPlots - plotsSold;
                                    
                                    return (
                                        <Tr key={prop.id}>
                                            <Td className="font-bold text-gray-900 dark:text-white">{prop.location}</Td>
                                            <Td><Badge variant="info">{prop.registrationStatus}</Badge></Td>
                                            <Td className="font-semibold text-gray-600 dark:text-gray-400">{plotsAvailable} Plots</Td>
                                            <Td className="font-black text-right">{formatCurrency(prop.price)}</Td>
                                            <Td>
                                                <div className="flex justify-center items-center gap-1">
                                                    <button 
                                                        onClick={() => setActivePage('Properties', prop)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                        title="Open Dossier"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handlePropertyChange(prop.id)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                        title="Edit Price"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                    {isCEO && (
                                                        <button 
                                                            onClick={() => handleArchiveClick(prop)}
                                                            className="p-2 text-gray-400 hover:text-amber-600 transition-all"
                                                            title="Archive Property"
                                                        >
                                                            <ArchiveBoxIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            )}
                        </Tbody>
                    </table>
                </TableContainer>
            </div>
        </>
    );
};
