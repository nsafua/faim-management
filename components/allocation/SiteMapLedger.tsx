
import React from 'react';
import { Property, AllocationStatus } from '../../types';
import { Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';

interface SiteMapLedgerProps {
    properties: Property[];
    viewAllLocationId: number | '';
    setViewAllLocationId: (id: number | '') => void;
    statusFilter: 'All' | 'Allocated' | 'Available';
    setStatusFilter: (filter: 'All' | 'Allocated' | 'Available') => void;
    masterPlotList: { plotNumber: string; size: string; allocatedTo: string | null; isProvisional: boolean, status?: AllocationStatus }[];
}

export const SiteMapLedger: React.FC<SiteMapLedgerProps> = ({
    properties,
    viewAllLocationId,
    setViewAllLocationId,
    statusFilter,
    setStatusFilter,
    masterPlotList
}) => {
    return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border animate-in slide-in-from-top-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Select label="Site" value={viewAllLocationId} onChange={(e) => setViewAllLocationId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">-- Choose Location --</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.location}</option>)}
                </Select>
                <Select label="Filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                    <option value="All">All</option>
                    <option value="Allocated">ALLOCATED</option>
                    <option value="Available">Available</option>
                </Select>
            </div>
            <TableContainer className="max-h-[300px]">
                <table className="w-full text-xs">
                    <Thead><tr><Th>Plot</Th><Th>Owner</Th><Th className="text-center">Status</Th></tr></Thead>
                    <Tbody>
                        {masterPlotList.map((p, i) => {
                            const isReservedOnly = p.status === 'RESERVED_NOT_ALLOCATED';
                            
                            return (
                                <Tr key={i}>
                                    <Td className={`font-mono font-bold ${isReservedOnly ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                        {p.plotNumber} {isReservedOnly && <span className="text-[9px] font-normal italic ml-1">(RESERVED not ALLOCATED)</span>}
                                    </Td>
                                    <Td>{p.allocatedTo || '—'}</Td>
                                    <Td className="text-center">
                                        <Badge variant={p.allocatedTo ? (isReservedOnly ? 'info' : (p.isProvisional ? 'warning' : 'success')) : 'success'}>
                                            {p.allocatedTo ? (isReservedOnly || p.isProvisional ? 'RESERVED' : 'ALLOCATED') : 'Available'}
                                        </Badge>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </table>
            </TableContainer>
        </div>
    );
};
