
import React from 'react';
import { Promotion, Property } from '../../types';
import { PencilIcon, TrashIcon } from '../icons/DummyIcons';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface PromotionListProps {
    promotions: Promotion[];
    properties: Property[];
    onEdit: (promo: Promotion) => void;
    onDelete: (id: number) => void;
    onStatusToggle: (promo: Promotion) => void;
}

export const PromotionList: React.FC<PromotionListProps> = ({ 
    promotions, 
    properties, 
    onEdit, 
    onDelete, 
    onStatusToggle 
}) => {
    return (
        <TableContainer>
            <table className="w-full text-sm text-left">
                <Thead>
                    <tr>
                        <Th>Title</Th>
                        <Th>Targeting</Th>
                        <Th>Promo Price</Th>
                        <Th>Duration</Th>
                        <Th className="text-center">Status</Th>
                        <Th className="text-center">Actions</Th>
                    </tr>
                </Thead>
                <Tbody>
                    {promotions.map(promo => (
                        <Tr key={promo.id}>
                            <Td className="font-medium text-gray-900 dark:text-white">
                                <div className="flex flex-col">
                                    <span>{promo.title}</span>
                                    <span className="text-[10px] text-gray-400">{promo.promoType}</span>
                                </div>
                            </Td>
                            <Td className="text-gray-600 dark:text-gray-300">
                                <div className="text-xs">
                                    <p>{promo.targetPlotSize} @ {promo.applicablePropertyId === 'all' ? 'All' : properties.find(p=>p.id === promo.applicablePropertyId)?.location}</p>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase">{promo.numberOfPlots} Plots Available</p>
                                </div>
                            </Td>
                            <Td>
                                <div className="font-black text-blue-600 dark:text-blue-400">GHC {promo.promoPrice?.toLocaleString()}</div>
                                <div className="text-[9px] text-gray-400 line-through">GHC {promo.originalPrice?.toLocaleString()}</div>
                            </Td>
                            <Td className="text-gray-600 dark:text-gray-300 text-xs">{promo.startDate} to {promo.endDate}</Td>
                            <Td className="text-center">
                                <button onClick={() => onStatusToggle(promo)}>
                                    <Badge variant={promo.status === 'Active' ? 'success' : 'danger'}>{promo.status}</Badge>
                                </button>
                            </Td>
                            <Td className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => onEdit(promo)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDelete(promo.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </table>
            {promotions.length === 0 && <div className="text-center py-10 text-gray-500 dark:text-gray-400">No promotions found.</div>}
        </TableContainer>
    );
};
