export interface Staff {
    id: string;
    fullName: string;
    initials: string;
    email: string;
    phone?: string;
    password?: string;
    roleId: string;
    status: 'Active' | 'Inactive';
    lastLogin: string;
    photo?: string;
    employmentDetails?: {
        startDate: string;
        employmentType: 'Full-time' | 'Part-time' | 'Contract';
        position: string;
    };
    documents?: {
        contractUrl?: string;
        idUrl?: string;
        cvUrl?: string;
    };
}

export interface Role {
    id: string;
    name: string;
    description: string;
    isDefault?: boolean;
}

export interface PermissionSet {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
}

export type AppModuleName = 'Dashboard' | 'Clients' | 'Account Management' | 'Promotions' | 'Team' | 'Leads Management' | 'Administration' | 'CEO Hub' | 'Settings' | 'Internal Mailing';

export interface AppModule {
    id: AppModuleName;
    name: string;
}

export interface RolePermission {
    roleId: string;
    moduleId: AppModuleName;
    permissions: PermissionSet;
}