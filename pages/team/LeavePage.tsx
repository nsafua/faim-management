
import React, { useState, useMemo, useEffect } from 'react';
import { LeaveRequest, LeaveType, LeaveStatus } from '../../types';
import { 
    PlusCircleIcon, 
    EyeIcon
} from '../../components/icons/DummyIcons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import { useActivityLogs, useStaff, useRoles } from '../../hooks/useAppData';
import { uploadFile } from '../../services/storageService';

// Modular Imports
import { RequestModal } from '../../components/leave/RequestModal';
import { DetailModal } from '../../components/leave/DetailModal';

const LeavePage: React.FC = () => {
    const { currentStaff } = useAuth();
    const { roles } = useRoles();
    const { addActivityLog } = useActivityLogs();

    // UI States
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Data Persistence
    const [requests, setRequests] = useState<LeaveRequest[]>([
        {
            id: 'LR-101',
            employeeId: '1',
            employeeName: 'Araba CEO',
            type: 'Annual Leave',
            startDate: '2024-12-20',
            endDate: '2024-12-27',
            days: 5,
            reason: 'End of year family vacation.',
            status: 'Approved',
            requestDate: '2024-11-01',
            processedBy: 'System',
            processedDate: '2024-11-02'
        }
    ]);

    const userRole = useMemo(() => roles.find(r => r.id === currentStaff?.roleId)?.name, [roles, currentStaff]);
    const isAdmin = userRole === 'CEO' || userRole === 'Administrator';

    const filteredRequests = useMemo(() => {
        if (isAdmin) return requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        return requests.filter(r => r.employeeId === currentStaff?.id).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [requests, isAdmin, currentStaff]);

    const handleCreateRequest = async (data: any) => {
        setIsSubmitting(true);
        try {
            let attachmentUrl = '';
            if (data.file) {
                attachmentUrl = await uploadFile(data.file, `leave_requests/${currentStaff?.id}/${Date.now()}_${data.file.name}`);
            }

            const newRequest: LeaveRequest = {
                id: `LR-${Math.floor(Math.random() * 10000)}`,
                employeeId: currentStaff?.id || '0',
                employeeName: currentStaff?.fullName || 'Unknown',
                type: data.type as LeaveType,
                startDate: data.startDate,
                endDate: data.endDate,
                days: data.days,
                reason: data.reason,
                status: 'Pending',
                attachmentUrl,
                requestDate: new Date().toISOString().split('T')[0],
            };

            setRequests(prev => [newRequest, ...prev]);
            if (currentStaff) {
                addActivityLog('Create', `Submitted a ${newRequest.type} request for ${newRequest.days} days.`, currentStaff.id);
            }
            setRequestModalOpen(false);
        } catch (error) {
            alert('Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProcessRequest = (id: string, newStatus: LeaveStatus) => {
        setRequests(prev => prev.map(r => 
            r.id === id ? { 
                ...r, 
                status: newStatus, 
                processedBy: currentStaff?.fullName, 
                processedDate: new Date().toISOString().split('T')[0] 
            } : r
        ));
        if (currentStaff) {
            addActivityLog('Update', `${newStatus} leave request ${id}.`, currentStaff.id);
        }
        setViewingRequest(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leave Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {isAdmin ? 'Review and manage company-wide leave requests.' : 'Submit and track your leave applications.'}
                    </p>
                </div>
                <button 
                  onClick={() => setRequestModalOpen(true)} 
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    Request Leave
                </button>
            </div>

            <Card className="p-0 overflow-hidden">
                <TableContainer className="border-0 shadow-none">
                    <table className="w-full text-sm text-left">
                        <Thead>
                            <tr>
                                <Th>Employee</Th>
                                <Th>Leave Type</Th>
                                <Th>Duration</Th>
                                <Th>Days</Th>
                                <Th className="text-center">Status</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {filteredRequests.map(req => (
                                <Tr key={req.id}>
                                    <Td className="font-bold text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px]">
                                                {req.employeeName.substring(0,2).toUpperCase()}
                                            </div>
                                            {req.employeeName}
                                        </div>
                                    </Td>
                                    <Td>{req.type}</Td>
                                    <Td className="text-gray-500">
                                        <div className="flex flex-col">
                                            <span>{req.startDate}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">to {req.endDate}</span>
                                        </div>
                                    </Td>
                                    <Td className="font-semibold">{req.days} days</Td>
                                    <Td className="text-center">
                                        <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}>
                                            {req.status}
                                        </Badge>
                                    </Td>
                                    <Td className="text-right">
                                        <button 
                                            onClick={() => setViewingRequest(req)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="View Details"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </Td>
                                </Tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <Tr>
                                    <Td colSpan={6} className="py-20 text-center text-gray-400 italic">
                                        No leave requests found.
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </table>
                </TableContainer>
            </Card>

            <RequestModal 
                isOpen={isRequestModalOpen} 
                onClose={() => setRequestModalOpen(false)} 
                onSubmit={handleCreateRequest}
                loading={isSubmitting}
            />

            <DetailModal 
                request={viewingRequest} 
                onClose={() => setViewingRequest(null)} 
                isAdmin={isAdmin}
                onAction={handleProcessRequest}
            />
        </div>
    );
};

export default LeavePage;
