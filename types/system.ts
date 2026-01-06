
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
