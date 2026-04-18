import { useState, useMemo } from 'react';
import { Client, Property, AllocationStatus } from '../types';

export const usePlotAllocation = (clients: Client[], properties: Property[]) => {
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
    const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
    
    // UI Layout state
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);
    const [viewAllLocationId, setViewAllLocationId] = useState<number | ''>('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Allocated' | 'Available'>('All');

    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
    const selectedProperty = useMemo(() => properties.find(p => p.id === selectedPropertyId), [selectedPropertyId, properties]);

    const handleClientChange = (clientId: number | '') => {
        setSelectedClientId(clientId);
        
        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                const preExistingPlots = client.plot && client.plot !== 'N/A' 
                    ? client.plot.split(',').map(p => p.trim()).filter(Boolean) 
                    : [];
                setSelectedPlots(preExistingPlots);

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

    const isAlreadyAllocated = useMemo(() => selectedClient?.allocationStatus === 'ALLOCATED', [selectedClient]);
    const isReserved = useMemo(() => selectedClient?.allocationStatus === 'RESERVED_NOT_ALLOCATED' && selectedPlots.length > 0, [selectedClient, selectedPlots]);

    const globalPlotStatus = useMemo(() => {
        const pool: Record<string, { allocated: boolean, owner?: string, status?: AllocationStatus }> = {};
        clients.forEach(c => {
            if (c.plot && c.plot !== 'N/A') {
                c.plot.split(',').forEach(p => {
                    const plotNum = p.trim().toUpperCase();
                    if (plotNum) {
                        pool[plotNum] = { 
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
        if (isReserved || globalPlotStatus[plot]?.allocated || isAlreadyAllocated) return;
        setSelectedPlots(prev => prev.includes(plot) ? prev.filter(p => p !== plot) : [...prev, plot]);
    };

    return {
        selectedClientId,
        selectedClient,
        selectedProperty,
        selectedPlots,
        isViewAllOpen,
        setIsViewAllOpen,
        viewAllLocationId,
        setViewAllLocationId,
        statusFilter,
        setStatusFilter,
        handleClientChange,
        isAlreadyAllocated,
        isReserved,
        availablePlotsList,
        masterPlotList,
        handlePlotToggle,
    };
};
