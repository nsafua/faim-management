
import React, { useState, useMemo } from 'react';
import { Client, Property, AllocationStatus } from '../types';
import { 
    ArrowLeftIcon, 
    UserCheckIcon, 
    EyeIcon,
    ExclamationTriangleIcon
} from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';
import { Select, Input } from '../components/ui/Input';
import { useClients } from '../hooks/useAppData';

// Modular Imports
import { QualificationCard } from '../components/allocation/QualificationCard';
import { PlotSelectionGrid } from '../components/allocation/PlotSelectionGrid';
import { SiteMapLedger } from '../components/allocation/SiteMapLedger';

interface AllocatePlotPageProps {
    onBack: () => void;
    clients: Client[];
    properties: Property[];
}

const AllocatePlotPage: React.FC<AllocatePlotPageProps> = ({ onBack, clients, properties }) => {
    const { saveClient } = useClients();
    
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
    const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [allocationSuccess, setAllocationSuccess] = useState(false);

    const [isViewAllOpen, setIsViewAllOpen] = useState(false);
    const [viewAllLocationId, setViewAllLocationId] = useState<number | ''>('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Allocated' | 'Available'>('All');

    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
    const selectedProperty = useMemo(() => properties.find(p => p.id === selectedPropertyId), [selectedPropertyId, properties]);

    // Handle Client Selection and Auto-populate Location/Plots
    const handleClientChange = (clientId: number | '') => {
        setSelectedClientId(clientId);
        
        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                // RULE 1: Auto-bind existing plot data from registration
                const preExistingPlots = client.plot && client.plot !== 'N/A' 
                    ? client.plot.split(',').map(p => p.trim()).filter(Boolean) 
                    : [];
                setSelectedPlots(preExistingPlots);

                // Auto-load location
                if (client.location && client.location !== 'N/A') {
                    const matchingProp = properties.find(p => p.location === client.location);
                    setSelectedPropertyId(matchingProp ? matchingProp.id : '');
                } else {
                    setSelectedPropertyId('');
                }
            }
        } else {
            setSelectedClientId('');
            setSelectedPlots([]);
            setSelectedPropertyId('');
        }
    };

    // AUTHORITY RULE: Multiple Allocation Prevention
    const isAlreadyAllocated = useMemo(() => selectedClient?.allocationStatus === 'ALLOCATED', [selectedClient]);
    
    // RULE 3: Determine if plots are pre-reserved
    const isReserved = useMemo(() => selectedClient?.allocationStatus === 'RESERVED_NOT_ALLOCATED' && selectedPlots.length > 0, [selectedClient, selectedPlots]);

    const globalPlotStatus = useMemo(() => {
        const pool: Record<string, { allocated: boolean, owner?: string, status?: AllocationStatus }> = {};
        clients.forEach(c => {
            if (c.plot && c.plot !== 'N/A') {
                c.plot.split(',').forEach(p => {
                    const plotNum = p.trim().toUpperCase();
                    if (plotNum) {
                        pool[plotNum] = { 
                            // Rule: ONLY 'ALLOCATED' status strictly blocks selection for other clients.
                            allocated: c.allocationStatus === 'ALLOCATED', 
                            owner: c.name,
                            status: c.allocationStatus
                        };
                    }
                });
            }
        });
        return pool;
    }, [clients]);

    const availablePlotsList = useMemo(() => {
        if (!selectedProperty || !selectedProperty.inventory) return [];
        const plots: { plotNumber: string; isTaken: boolean; owner?: string; status?: AllocationStatus }[] = [];
        selectedProperty.inventory.forEach((inv: any) => {
            const prefix = inv.zone || 'P1';
            for (let i = 1; i <= inv.count; i++) {
                const pNum = `${prefix}-${i}`;
                plots.push({
                    plotNumber: pNum,
                    isTaken: globalPlotStatus[pNum]?.allocated || false,
                    owner: globalPlotStatus[pNum]?.owner,
                    status: globalPlotStatus[pNum]?.status
                });
            }
        });
        return plots;
    }, [selectedProperty, globalPlotStatus]);

    const masterPlotList = useMemo(() => {
        const prop = properties.find(p => p.id === viewAllLocationId);
        if (!prop || !prop.inventory) return [];
        
        const all: { plotNumber: string; size: string; allocatedTo: string | null; isProvisional: boolean, status?: AllocationStatus }[] = [];
        prop.inventory.forEach((inv: any) => {
            const prefix = inv.zone || 'P1';
            for (let i = 1; i <= inv.count; i++) {
                const pNum = `${prefix}-${i}`;
                const ownerInfo = globalPlotStatus[pNum];
                
                let isProvisional = false;
                if (ownerInfo?.allocated || ownerInfo?.status === 'RESERVED_NOT_ALLOCATED') {
                    const client = clients.find(c => c.name === ownerInfo.owner);
                    if (client) {
                        const pct = client.paidPercent || 0;
                        isProvisional = pct < 70;
                    }
                }

                all.push({
                    plotNumber: pNum,
                    size: inv.size,
                    allocatedTo: ownerInfo?.owner || null,
                    isProvisional,
                    status: ownerInfo?.status
                });
            }
        });

        return all.filter(p => {
            if (statusFilter === 'Allocated') return p.allocatedTo !== null;
            if (statusFilter === 'Available') return p.allocatedTo === null;
            return true;
        });
    }, [viewAllLocationId, properties, globalPlotStatus, clients, statusFilter]);

    const handlePlotToggle = (plot: string) => {
        // Rule 2: If client plots exist (Reserved state), make them read-only
        if (isReserved || globalPlotStatus[plot]?.allocated || isAlreadyAllocated) return;
        setSelectedPlots(prev => prev.includes(plot) ? prev.filter(p => p !== plot) : [...prev, plot]);
    };

    const handleConfirmAllocation = async () => {
        if (!selectedClient || selectedPlots.length === 0 || isAlreadyAllocated) return;
        setIsSaving(true);
        try {
            const updatedClient: Client = {
                ...selectedClient,
                plot: selectedPlots.join(', '),
                allocationStatus: 'ALLOCATED', // Authority: Elevate status on confirmation
                interactions: [
                    { id: Date.now(), type: 'Note', date: new Date().toISOString(), agent: 'System', notes: `Plots ${selectedPlots.join(', ')} confirmed for ALLOCATION at ${selectedProperty?.location}.` },
                    ...selectedClient.interactions
                ]
            };
            await saveClient(updatedClient);
            setAllocationSuccess(true);
            setTimeout(() => onBack(), 2000);
        } catch (error) {
            alert('Save failed.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors"><ArrowLeftIcon className="w-5 h-5" /> Back</button>
                    <div className="flex items-center gap-4">
                        <UserCheckIcon className="w-10 h-10 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ALLOCATE Plot</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Single source inventory partitioning and ALLOCATION.</p>
                        </div>
                    </div>
                </div>
            </div>

            {allocationSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md animate-bounce">ALLOCATION Successful!</div>}

            <Card className="bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                        label="1. Client" 
                        value={selectedClientId} 
                        onChange={(e) => handleClientChange(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">-- Select Client --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    
                    <div>
                        <Input 
                            label="2. Location (Auto-detected)" 
                            value={selectedClient ? (selectedClient.location || 'Not Specified') : 'Select client to load location'} 
                            readOnly 
                            className="bg-gray-50 dark:bg-gray-900 font-bold cursor-not-allowed"
                        />
                        {selectedClient && (!selectedClient.location || selectedClient.location === 'N/A') && (
                            <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded border border-red-100 dark:border-red-900/50">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                Client has no saved location. Update client details first.
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => setIsViewAllOpen(!isViewAllOpen)} className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" /> View Site Map Ledger
                    </button>
                    {isViewAllOpen && (
                        <SiteMapLedger 
                            properties={properties}
                            viewAllLocationId={viewAllLocationId}
                            setViewAllLocationId={setViewAllLocationId}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            masterPlotList={masterPlotList}
                        />
                    )}
                </div>
            </Card>

            {selectedClient && selectedProperty ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    <QualificationCard client={selectedClient} />

                    <PlotSelectionGrid 
                        property={selectedProperty}
                        availablePlots={availablePlotsList}
                        selectedPlots={selectedPlots}
                        onTogglePlot={handlePlotToggle}
                        onConfirm={handleConfirmAllocation}
                        isSaving={isSaving}
                        isAlreadyAllocated={isAlreadyAllocated}
                        isReserved={isReserved}
                        clientPlotNumbers={selectedClient.plot}
                        clientPaidPercent={selectedClient.paidPercent}
                    />
                </div>
            ) : selectedClient && (
                <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-60">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Cannot load plots: Missing or Invalid Location Context
                    </p>
                </div>
            )}
            <style>{` .scrollbar-thin::-webkit-scrollbar { width: 4px; } .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } `}</style>
        </div>
    );
};

export default AllocatePlotPage;
