import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Staff, Role } from '../../types';
import { PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon } from '../icons/DummyIcons';

interface ExecutiveTeamWidgetProps {
    staff: Staff[];
    roles: Role[];
    openStaffModal: (member?: Staff) => void;
    handleToggleStaffStatus: (staffId: string) => void;
    onViewStaffActivity: (member: Staff) => void;
    handleDeleteClick: (member: Staff) => void;
}

export const ExecutiveTeamWidget: React.FC<ExecutiveTeamWidgetProps> = ({ 
    staff, roles, openStaffModal, handleToggleStaffStatus, onViewStaffActivity, handleDeleteClick 
}) => {
    return (
        <Card title="Executive Team Management" action={<Button size="sm" onClick={() => openStaffModal()} icon={<PlusCircleIcon className="w-4 h-4"/>}>Add Executive</Button>}>
            <TableContainer className="border-0 shadow-none">
                <table className="w-full text-sm text-left">
                    <Thead>
                        <tr>
                            <Th>Executive</Th>
                            <Th>Role</Th>
                            <Th className="text-center">Status</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {staff.map(member => (
                            <Tr key={member.id}>
                                <Td className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-300">
                                        {member.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{member.fullName}</div>
                                        <div className="text-[10px] text-gray-400">{member.email}</div>
                                    </div>
                                </Td>
                                <Td>
                                    <Badge variant="info">{roles.find(r => r.id === member.roleId)?.name || 'Executive'}</Badge>
                                </Td>
                                <Td className="text-center">
                                    <button onClick={() => handleToggleStaffStatus(member.id)}>
                                        <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>{member.status}</Badge>
                                    </button>
                                </Td>
                                <Td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onViewStaffActivity(member)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><EyeIcon className="w-5 h-5"/></button>
                                        <button onClick={() => openStaffModal(member)} className="p-1 text-gray-400 hover:text-green-600 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick(member)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </table>
            </TableContainer>
        </Card>
    );
};
