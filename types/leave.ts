
export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Casual Leave' | 'Emergency Leave' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: LeaveStatus;
    attachmentUrl?: string;
    requestDate: string;
    processedBy?: string;
    processedDate?: string;
}
