export type MessageCategory = 
    | 'Payment Received' 
    | 'Instalment Reminder' 
    | 'Quarterly Update' 
    | 'Birthday' 
    | '70% Qualification' 
    | 'Allocation Complete' 
    | 'General';

export type MessageChannel = 'SMS' | 'Email' | 'WhatsApp';

export type MessageStatus = 'DRAFT' | 'QUEUED' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface MessageTemplate {
    id: string;
    name: string;
    category: MessageCategory;
    channel: MessageChannel;
    body: string;
    isEnabled: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessageOutbox {
    id: string;
    channel: MessageChannel;
    toPhone?: string;
    toEmail?: string;
    clientId?: number;
    category: MessageCategory;
    templateId?: string;
    messageBodyFinal: string;
    status: MessageStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    notes?: string;
    isOverride?: boolean;
    overrideReason?: string;
}

export interface MessageHistory {
    id: string;
    messageId: string;
    clientId?: number;
    channel: MessageChannel;
    category: MessageCategory;
    recipient: string;
    messagePreview: string;
    status: 'SENT' | 'FAILED';
    timestamp: string;
    failureReason?: string;
    senderName: string;
}

export interface ClientMessagingPreference {
    clientId: number;
    allowSMS: boolean;
    allowEmail: boolean;
    allowWhatsApp: boolean;
    preferredChannel: MessageChannel;
    optedOut: boolean;
    updatedAt: string;
}
