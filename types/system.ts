
export type ActivityLogType = 'Login' | 'Logout' | 'Create' | 'Update' | 'Delete' | 'View' | 'Import';

export interface ActivityLog {
    id: number;
    userId: string;
    type: ActivityLogType;
    description: string;
    timestamp: string;
}

export interface CompanySettings {
    name: string;
    logo?: string; // Deprecated, kept for backward compatibility if needed
    appLogoLight?: string;
    appLogoDark?: string;
    companyLogoLight?: string;
    companyLogoDark?: string;
    favicon?: string;
}

export interface GeneratedReport {
    id: number;
    title: string;
    type: string;
    period: string;
    generatedDate: string;
}

export interface RescheduleDetails {
    newDate: string;
    reason: string;
    rescheduledBy: string;
    timestamp: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'Qualification' | 'Escalation' | 'Reminder' | 'Default' | 'Birthday';
    recipientRole: 'Administrator' | 'CEO' | 'Chief Accountant' | 'Front Desk Executive' | 'ALL_USERS';
    timestamp: string;
    isRead: boolean;
    metadata?: {
        clientId?: number;
        clientName?: string;
        qualificationDate?: string;
        outstandingAmount?: number;
        paidTotal?: number;
        contractTotal?: number;
        qualifiedAt?: string;
        rescheduleHistory?: RescheduleDetails[];
        eventType?: 'CLIENT_BIRTHDAY' | 'ALLOCATION_70_PERCENT_QUALIFIED' | 'ALLOCATION_NOT_DONE_48H';
    };
}

export interface InternalMail {
    id: string;
    senderId: string;
    senderName: string;
    recipientIds: string[];
    groupIds: string[]; // e.g. "ALL_STAFF", "ROLE_CEO"
    participants: string[]; // For Firestore Querying (Sender + Recipients)
    subject: string;
    body: string;
    attachments: { name: string; url: string; type: string; size: number }[];
    timestamp: string;
    readBy: string[];
    isDraft?: boolean;
    isDeleted?: boolean;
    targetPage?: string;
    targetContext?: any;
}

// --- SMS Conduit Types ---

export type SMSProvider = 'Disabled' | 'mNotify' | 'Hubtel' | 'Custom';

export interface SMSConfig {
    provider: SMSProvider;
    apiKey: string;
    senderId: string;
    baseUrl?: string;
    updatedAt: string;
    isConnected: boolean;
}

export interface SMSLog {
    id: string;
    clientId?: number;
    toPhone: string;
    correlationId: string;
    status: 'queued' | 'sent' | 'failed' | 'disabled' | 'duplicate';
    provider: SMSProvider;
    messageHash: string;
    timestamp: string;
    errorReason?: string;
}
