
import React from 'react';
import { Staff, Role } from '../../types';
import { BriefcaseIcon, FolderIcon } from '../icons/DummyIcons';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';

interface StaffDirectoryProps {
    staff: Staff[];
    roles: Role[];
    onEditDetails: (id: string) => void;
    onManageDocuments: (id: string) => void;
}

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({ staff, roles, onEditDetails, onManageDocuments }) => {
    return (
        <TableContainer>
            <table className="w-full text-sm text-left">
                <Thead>
                    <tr>
                        <Th>Staff Member</Th>
                        <Th>Position & Role</Th>
                        <Th>Employment Details</Th>
                        <Th>Documents</Th>
                        <Th className="text-center">Actions</Th>
                    </tr>
                </Thead>
                <Tbody>
                    {staff.map(member => {
                        const roleName = roles.find(r => r.id === member.roleId)?.name || 'N/A';
                        const details = member.employmentDetails;
                        const docs = member.documents;
                        return (
                            <Tr key={member.id}>
                                <Td>
                                    <div className="font-medium text-gray-900 dark:text-white">{member.fullName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                                </Td>
                                <Td>
                                    <div className="text-gray-900 dark:text-gray-200">{details?.position || 'Not Set'}</div>
                                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">{roleName}</div>
                                </Td>
                                <Td className="text-gray-700 dark:text-gray-300">
                                    {details ? (
                                        <>
                                            <div>Start Date: {details.startDate}</div>
                                            <div className="text-xs">{details.employmentType}</div>
                                        </>
                                    ) : <span className="text-gray-400 dark:text-gray-500">Not specified</span>}
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold ${docs?.contractUrl ? 'text-green-600 dark:text-green-400' : 'text-red-400 dark:text-red-500'}`}>Contract</span>
                                        <span className={`text-xs font-semibold ${docs?.idUrl ? 'text-green-600 dark:text-green-400' : 'text-red-400 dark:text-red-500'}`}>ID</span>
                                        <span className={`text-xs font-semibold ${docs?.cvUrl ? 'text-green-600 dark:text-green-400' : 'text-red-400 dark:text-red-500'}`}>CV</span>
                                    </div>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => onEditDetails(member.id)} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Employment Details">
                                            <BriefcaseIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onManageDocuments(member.id)} className="font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300" title="Manage Documents">
                                            <FolderIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        );
                    })}
                    {staff.length === 0 && (
                        <Tr>
                            <Td className="text-center py-10" colSpan={5}>
                                <p className="text-gray-500 dark:text-gray-400">No staff members found.</p>
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </table>
        </TableContainer>
    );
};
