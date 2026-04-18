import React, { useState } from 'react';
import { Property, Staff } from '../types';
import { 
    ArrowLeftIcon, 
    CheckCircleIcon, 
    EyeIcon, 
    ArchiveBoxIcon, 
    ArrowPathIcon,
    ShieldCheckIcon
} from '../components/icons/DummyIcons';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useProperties } from '../hooks/useAppData';
import { useModal } from '../context/ModalContext';
import { MODAL_TYPES } from '../components/ModalManager';

interface PurchaseSaleManagementPageProps {
    onBack: () => void;
    properties: Property[];
    onSaveProperty: (property: Property) => Promise<void>;
    currentStaff: Staff;
    setActivePage: (page: string, context?: any) => void;
}

const PurchaseSaleManagementPage: React.FC<PurchaseSaleManagementPageProps> = ({ onBack, properties, onSaveProperty, currentStaff, setActivePage }) => {
    const { archiveProperty, restoreProperty, archivedProperties } = useProperties();
    const { openModal, closeModal } = useModal();
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
    const [editSellingPrice, setEditSellingPrice] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

    const isCEO = currentStaff.roleId === 'CEO';

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

    const handleArchiveClick = (prop: Property) => {
        openModal(MODAL_TYPES.ARCHIVE_PROPERTY, {
            propertyName: prop.location,
            onConfirm: async () => {
                try {
                    await archiveProperty(prop.id, currentStaff.id);
                    closeModal(); // FIX: Explicitly close the modal on success
                } catch (error) {
                    alert("Failed to archive property. Please try again.");
                }
            }
        });
    };

    const handleRestoreClick = async (prop: Property) => {
        if (confirm(`Restore ${prop.location} to active listings?`)) {
            await restoreProperty(prop.id);
            alert(`${prop.location} restored successfully.`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2 tracking-tight uppercase">Purchase & Sale Management</h1>
                </div>
                
                {isCEO && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'active' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Active Portfolio
                        </button>
                        <button 
                            onClick={() => setViewMode('archived')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewMode === 'archived' ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ArchiveBoxIcon className="w-4 h-4" />
                            Archive Vault
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'active' ? (
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
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <ArchiveBoxIcon className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase">Archive Vault</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Historical and de-listed land assets</p>
                        </div>
                    </div>

                    <TableContainer>
                        <table className="w-full text-sm text-left">
                            <Thead>
                                <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                                    <Th>Property Location</Th>
                                    <Th>Archived On</Th>
                                    <Th>Archived By</Th>
                                    <Th className="text-right">Last Listed Price</Th>
                                    <Th className="text-center">Action</Th>
                                </tr>
                            </Thead>
                            <Tbody>
                                {archivedProperties.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={5} className="text-center py-20 text-gray-400 italic">
                                            Vault is empty. No archived properties found.
                                        </Td>
                                    </Tr>
                                ) : (
                                    archivedProperties.map(prop => (
                                        <Tr key={prop.id}>
                                            <Td className="font-bold text-gray-900 dark:text-white">{prop.location}</Td>
                                            <Td className="font-mono text-xs text-gray-500">{prop.archivedAt ? new Date(prop.archivedAt).toLocaleDateString() : '—'}</Td>
                                            <Td className="text-xs text-gray-600 dark:text-gray-400">{prop.archivedBy || 'System'}</Td>
                                            <Td className="text-right font-black text-gray-400">{formatCurrency(prop.price)}</Td>
                                            <Td className="text-center">
                                                <button 
                                                    onClick={() => handleRestoreClick(prop)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-black uppercase text-[10px] rounded-lg hover:bg-green-100 transition-colors border border-green-100 dark:border-green-800"
                                                >
                                                    <ArrowPathIcon className="w-3 h-3" />
                                                    Restore
                                                </button>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </table>
                    </TableContainer>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-4">
                        <ShieldCheckIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Executive Vault Security</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                                Archiving a property hides it from all Sales and Front Desk staff. Restoring a property immediately re-publishes it to the master catalog with its previous inventory settings.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="text-gray-500 italic text-sm border-t pt-4 border-gray-100 dark:border-gray-800">
                Authority prices and listing status published here are synchronized across all modules.
            </div>
        </div>
    );
};

export default PurchaseSaleManagementPage;