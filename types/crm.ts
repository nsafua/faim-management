
export interface Milestone {
    acronym: string;
    label: string;
    progress: number;
}

export interface LeadComment {
    id: number;
    text: string;
    authorId: string;
    date: string;
}

export interface Lead {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    source: 'WhatsApp' | 'Facebook' | 'Referral' | 'Outreach' | 'Other';
    status: 'Contacted' | 'Visited Site' | 'Filled a Form' | 'Submitted the Form' | 'Made Payment' | 'Converted to Client';
    assignedRepId: string;
    nextFollowUpDate: string;
    lastContactDate: string;
    notes: string;
    createdAt: string;
    comments: LeadComment[];
}
