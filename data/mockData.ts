
import { Role, Staff, Client, Property, Invoice, Milestone, CompanySettings, ActivityLog, Lead, Promotion, GeneratedReport, AmendmentRequest, RolePermission, AppModule, AppModuleName } from '../types';

export const COMPANY_SETTINGS: CompanySettings = {
    name: "FAIM",
    logo: undefined,
    appLogoLight: undefined,
    appLogoDark: undefined,
    companyLogoLight: undefined,
    companyLogoDark: undefined,
    favicon: undefined,
};

export const ROLES: Role[] = [
    { id: 'CEO', name: 'CEO', description: 'Overall management and strategic decisions.' },
    { id: 'Administrator', name: 'Administrator', description: 'Handles system administration and high-level operations.' },
    { id: 'Front Desk Executive', name: 'Front Desk Executive', description: 'Manages client interactions and front desk tasks.' },
    { id: 'Chief Accountant', name: 'Chief Accountant', description: 'Oversees all financial activities.' },
    { id: 'Head of Sales', name: 'Head of Sales', description: 'Leads the sales team and strategy.' },
    { id: 'Sales Representative', name: 'Sales Representative', description: 'Handles sales and client acquisition.' },
];

export const STAFF: Staff[] = [
    { id: '1', fullName: 'Araba CEO', initials: 'AC', email: 'ceo@faim.com', password: 'password', roleId: 'CEO', status: 'Active', lastLogin: '2024-08-14T10:00:00Z'},
    { id: '2', fullName: 'Samuel Sales', initials: 'SS', email: 'sales@faim.com', password: 'password', roleId: 'Sales Representative', status: 'Active', lastLogin: '2024-08-14T09:00:00Z' },
];

export const PROPERTIES: Property[] = [
    {
        id: 1,
        location: 'East Legon Hills',
        description: 'Prime residential plots in a rapidly developing area.',
        size: 50,
        price: 250000,
        inventory: [{ size: '70x100 ft', count: 50, sold: 10 }],
        registrationStatus: 'Titled',
        discount: { percentage: 10, endDate: '2024-12-31' },
    },
    {
        id: 2,
        location: 'Appolonia City',
        description: 'Serviced plots with modern amenities.',
        size: 100,
        price: 180000,
        inventory: [{ size: '70x50 ft', count: 120, sold: 40 }, { size: '70x100 ft', count: 50, sold: 5 }],
        registrationStatus: 'Indenture',
    },
];

export const CLIENTS: Client[] = [
    {
        id: 1,
        // FIX: Added required clientType property to mock data
        clientType: 'Individual',
        name: 'John Doe',
        surname: 'Doe',
        otherNames: 'John',
        initials: 'JD',
        regDate: '2024-05-20',
        email: 'john.doe@example.com',
        phone: '0241234567',
        location: 'East Legon Hills',
        plot: 'ELH-101',
        status: 'Active Client',
        stage: 'PFI',
        payment: { total: 225000, paid: 150000, balance: 75000, dueDate: '2024-09-01', planType: '3-Month Installment', promoDetails: '10% discount applied', paymentHistory: [], installments: [] },
        interactions: [],
        witness: { name: 'Witness One', address: 'Accra', phone: '0551112222' },
        nextOfKin: { name: 'Jane Doe', phone: '0242223333', relationship: 'Spouse' },
        indenture: { name: 'John Doe', address: 'P.O. Box 123' },
        officeUse: { salesRep: 'Samuel Sales', salesManager: 'Head of Sales', accountsHead: 'Chief Accountant', clerk: 'Front Desk', commission: { type: 'Percentage', amount: 5, status: 'Pending' } },
        documentation: { status: 'Pending' },
        isComplete: true,
        filledFormPdf: 'dummy-pdf-base64',
    }
];

export const INVOICES: Invoice[] = [
    { id: 'INV-001', clientId: 1, clientName: 'John Doe', amount: 75000, status: 'Pending', issueDate: '2024-08-01', dueDate: '2024-09-01' }
];

export const MILESTONES: Milestone[] = [
    { acronym: 'SFR', label: 'Form Received', progress: 10 },
    { acronym: 'PLR', label: 'Land Payment', progress: 25 },
    { acronym: 'PFI', label: 'Doc Payment', progress: 40 },
    { acronym: '3MP', label: 'Processing', progress: 55 },
    { acronym: 'IR', label: 'Doc Ready', progress: 70 },
    { acronym: 'DPU', label: 'Picked Up', progress: 85 },
    { acronym: 'CPD', label: 'Final Handover', progress: 95 },
    { acronym: 'ACA', label: 'Addressed', progress: 100 },
];

export const ACTIVITY_LOGS: ActivityLog[] = [];

export const LEADS: Lead[] = [
    { id: 1, fullName: 'Ama Serwaa', email: 'ama@example.com', phone: '0551234567', source: 'Facebook', status: 'Contacted', assignedRepId: '2', nextFollowUpDate: '2024-08-20', lastContactDate: '2024-08-14T11:00:00Z', notes: 'Interested in Appolonia.', createdAt: '2024-08-12T10:00:00Z', comments: [] },
    { id: 2, fullName: 'Kwame Asante', email: 'kwame@example.com', phone: '0209876543', source: 'Referral', status: 'Visited Site', assignedRepId: '2', nextFollowUpDate: '2024-08-18', lastContactDate: '2024-08-13T15:00:00Z', notes: 'Visited East Legon Hills, very impressed.', createdAt: '2024-08-10T09:00:00Z', comments: [] }
];

export const PROMOTIONS: Promotion[] = [
    { id: 1, title: 'Independence Day Sale', description: '15% off all plots at East Legon Hills.', promoType: 'Discount', startDate: '2024-03-01', endDate: '2024-03-31', discountValue: 15, applicablePropertyId: 1, status: 'Inactive' }
];

export const GENERATED_REPORTS: GeneratedReport[] = [
    { id: 1, title: 'July 2024 Sales Performance', type: 'Sales', period: 'July 2024', generatedDate: '2024-08-01' },
    { id: 2, title: 'Q2 2024 Financial Summary', type: 'Financial', period: 'Q2 2024', generatedDate: '2024-07-01' }
];

export const AMENDMENT_REQUESTS: AmendmentRequest[] = [];

export const APP_MODULES: AppModule[] = [
    { id: 'Dashboard', name: 'Dashboard' },
    { id: 'Clients', name: 'Client List' },
    { id: 'Account Management', name: 'Account Management' },
    { id: 'Team', name: 'Team' },
    { id: 'Leads Management', name: 'Leads Management' },
    { id: 'Internal Mailing', name: 'Internal Mailing' },
    { id: 'Promotions', name: 'Promotions' },
    { id: 'Administration', name: 'Administration' },
    { id: 'CEO Hub', name: 'CEO Hub' },
    { id: 'Settings', name: 'Settings' },
];

export const ROLE_PERMISSIONS: RolePermission[] = [
    ...APP_MODULES.map(m => ({ roleId: 'CEO', moduleId: m.id as AppModuleName, permissions: { view: true, create: true, edit: true, delete: true, approve: true } })),
    ...APP_MODULES.map(m => ({ roleId: 'Administrator', moduleId: m.id as AppModuleName, permissions: { view: true, create: true, edit: true, delete: true, approve: m.id === 'CEO Hub' ? false : true } })),
    { roleId: 'Front Desk Executive', moduleId: 'Dashboard', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Front Desk Executive', moduleId: 'Clients', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Front Desk Executive', moduleId: 'Account Management', permissions: { view: true, create: false, edit: false, delete: false, approve: false } }, 
    { roleId: 'Front Desk Executive', moduleId: 'Team', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Front Desk Executive', moduleId: 'Internal Mailing', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Front Desk Executive', moduleId: 'Promotions', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Front Desk Executive', moduleId: 'Administration', permissions: { view: true, create: false, edit: false, delete: false, approve: false } }, 
    { roleId: 'Front Desk Executive', moduleId: 'CEO Hub', permissions: { view: false, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Front Desk Executive', moduleId: 'Settings', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Chief Accountant', moduleId: 'Dashboard', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Chief Accountant', moduleId: 'Clients', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Chief Accountant', moduleId: 'Account Management', permissions: { view: true, create: true, edit: true, delete: true, approve: true } }, 
    { roleId: 'Chief Accountant', moduleId: 'Team', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Chief Accountant', moduleId: 'Internal Mailing', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Chief Accountant', moduleId: 'Promotions', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Chief Accountant', moduleId: 'Administration', permissions: { view: true, create: false, edit: true, delete: false, approve: false } }, 
    { roleId: 'Chief Accountant', moduleId: 'CEO Hub', permissions: { view: true, create: false, edit: false, delete: false, approve: false } }, 
    { roleId: 'Chief Accountant', moduleId: 'Settings', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Head of Sales', moduleId: 'Dashboard', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Head of Sales', moduleId: 'Clients', permissions: { view: true, create: true, edit: true, delete: true, approve: true } },
    { roleId: 'Head of Sales', moduleId: 'Account Management', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Head of Sales', moduleId: 'Team', permissions: { view: true, create: true, edit: true, delete: true, approve: true } },
    { roleId: 'Head of Sales', moduleId: 'Leads Management', permissions: { view: true, create: true, edit: true, delete: true, approve: true } },
    { roleId: 'Head of Sales', moduleId: 'Internal Mailing', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Head of Sales', moduleId: 'Promotions', permissions: { view: true, create: true, edit: true, delete: true, approve: true } },
    { roleId: 'Head of Sales', moduleId: 'Administration', permissions: { view: false, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Head of Sales', moduleId: 'CEO Hub', permissions: { view: true, create: false, edit: false, delete: false, approve: false } }, 
    { roleId: 'Head of Sales', moduleId: 'Settings', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Dashboard', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Clients', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Team', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Leads Management', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Internal Mailing', permissions: { view: true, create: true, edit: true, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Promotions', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
    { roleId: 'Sales Representative', moduleId: 'Settings', permissions: { view: true, create: false, edit: false, delete: false, approve: false } },
];
