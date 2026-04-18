
import React from 'react';
import { Card } from '../ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Property } from '../../types';

interface InventoryTableProps {
    inventory: Property['inventory'];
    isEditMode: boolean;
    onChange: (inventory: Property['inventory']) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, isEditMode, onChange }) => {
    const handleUpdate = (index: number, field: string, value: string | number) => {
        const newInv = [...inventory];
        (newInv[index] as any)[field] = value;
        onChange(newInv);
    };

    return (
        <Card title="Inventory Partitioning">
            <TableContainer className="border-0 shadow-none">
                <table className="w-full text-sm">
                    <Thead>
                        <tr>
                            <Th>Plot Size</Th>
                            <Th>Count</Th>
                            <Th>Sold</Th>
                            <Th>Zone/Phase</Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {inventory.map((inv, idx) => (
                            <Tr key={idx}>
                                <Td>{inv.size}</Td>
                                <Td>
                                    {isEditMode ? (
                                        <input 
                                            type="number" 
                                            value={inv.count} 
                                            onChange={(e) => handleUpdate(idx, 'count', Number(e.target.value))}
                                            className="w-16 p-1 border rounded bg-white dark:bg-gray-950 dark:border-gray-700 dark:text-white" 
                                        />
                                    ) : inv.count}
                                </Td>
                                <Td>{inv.sold}</Td>
                                <Td>
                                    {isEditMode ? (
                                        <input 
                                            type="text" 
                                            value={(inv as any).zone || ''} 
                                            onChange={(e) => handleUpdate(idx, 'zone', e.target.value)}
                                            className="w-full p-1 border rounded bg-white dark:bg-gray-950 dark:border-gray-700 dark:text-white" 
                                        />
                                    ) : ((inv as any).zone || '—')}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </table>
            </TableContainer>
        </Card>
    );
};
