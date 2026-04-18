
import React, { ChangeEvent } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { BanknotesIcon, PlusCircleIcon } from '../../components/icons/DummyIcons';

interface InventoryPartitioningProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const InventoryPartitioning: React.FC<InventoryPartitioningProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-6">
            <div className="border-b-4 border-blue-600 pb-2">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2">
                    <BanknotesIcon className="w-6 h-6 text-blue-600" />
                    Section 5: Inventory Partitioning (Master Source)
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card title="Plot Generation Logic">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-bold">Important:</p>
                        <p>Zone names define the master plot prefix. Changing a zone name will update all unallocated plot identifiers across the system. Format: <code>ZoneName-X</code></p>
                    </div>
                </Card>
            </div>

            <Card title="Master Inventory Management">
                <TableContainer className="border-0 shadow-none">
                    <table className="w-full text-sm">
                        <Thead>
                            <tr>
                                <Th>Zone/Phase Name</Th>
                                <Th>Plot Size</Th>
                                <Th>Number of Plots</Th>
                                <Th>Sold/Allocated</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {formData.inventory.map((inv: any, idx: number) => (
                                <Tr key={idx}>
                                        <Td>
                                        <input 
                                            type="text" 
                                            value={inv.zone} 
                                            onChange={(e) => {
                                                const newInv = [...formData.inventory];
                                                newInv[idx].zone = e.target.value.toUpperCase().replace(/\s/g, '');
                                                setFormData({...formData, inventory: newInv});
                                            }}
                                            placeholder="PHASE1"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 font-mono font-bold" 
                                        />
                                    </Td>
                                    <Td>
                                        <Select 
                                            value={inv.size} 
                                            onChange={(e) => {
                                                const newInv = [...formData.inventory];
                                                newInv[idx].size = e.target.value;
                                                setFormData({...formData, inventory: newInv});
                                            }}
                                            className="w-full text-xs"
                                        >
                                            <option>70x100 ft</option>
                                            <option>70x50 ft</option>
                                            <option>60x80 ft</option>
                                        </Select>
                                    </Td>
                                    <Td>
                                        <input 
                                            type="number" 
                                            value={inv.count} 
                                            onChange={(e) => {
                                                const newInv = [...formData.inventory];
                                                newInv[idx].count = Number(e.target.value);
                                                setFormData({...formData, inventory: newInv});
                                            }}
                                            className="w-24 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 font-bold" 
                                        />
                                    </Td>
                                    <Td>
                                        <Badge variant="neutral">{inv.sold}</Badge>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </table>
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, inventory: [...formData.inventory, { size: '70x100 ft', count: 0, sold: 0, zone: '' }]})}
                            className="text-xs font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest hover:text-blue-800"
                        >
                            <PlusCircleIcon className="w-4 h-4" /> Add Partition
                        </button>
                    </div>
                </TableContainer>
            </Card>
        </div>
    );
};
