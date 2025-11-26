

export type PlotSize = '70x100 ft' | '70x50 ft' | '60x80 ft';

export interface PlotInventory {
    size: PlotSize;
    count: number;
    sold: number;
}

export interface Discount {
    percentage: number;
    endDate: string;
}

export interface Property {
    id: number;
    location: string;
    description: string;
    size: number; // in acres
    price: number; // per plot
    inventory: PlotInventory[];
    registrationStatus: 'Titled' | 'Indenture' | 'Plotted';
    discount?: Discount;
    // Fix: Added optional layoutPdfUrl property to Property type
    layoutPdfUrl?: string;
}

export interface PaymentTransaction {
    id: string;
    date: string;
    amount: number;
    method: 'Cash' | 'Bank Transfer' | 'MoMo' | 'Cheque' | 'Other';
    reference?: string;
    receiptNumber: string;
    status: 'Success' | 'Failed';
}

export interface Installment {
    id: number;
    dueDate: string;
    amountDue: number;
    amountPaid: number;
    balance: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'On Time' | 'Late';
}

export interface Payment {
    total: number;
    paid: number;
    balance: number;
    dueDate: string;
    planType: string;
    promoDetails?: string;
    paymentHistory: PaymentTransaction[];
    installments: Installment[];
}

export interface Interaction {
    id: number;
    type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Amendment';
    date: string;
    agent: string;
    notes: string;
}

export interface Witness {
    name: string;
    address: string;
    phone: string;
}

export interface NextOfKin {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
    address?: string;
}

export interface Indenture {
    name: string;
    address: string;
}

export interface Commission {
    type: 'Percentage' | 'Fixed';
    amount: number;
    status: 'Pending' | 'Paid';
    paymentDate?: string;
}

export interface OfficeUse {
    salesRep: string;
    salesManager: string;
    accountsHead: string;
    clerk: string;
    commission: Commission;
}

// Fix: Added Documentation interface for client documentation details
export interface Documentation {
    status: 'Pending' | 'Ready' | 'Collected';
    collectedDate?: string;
    collectedBy?: string;
    notes?: string;
}

export interface Client {
    id: number;
    name: string;
    surname: string;
    otherNames: string;
    initials: string;
    regDate: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    location: string;
    plot: string;
    photo?: string;
    propertyType?: 'Residential' | 'Commercial';
    plannedDevelopmentYear?: string;
    professionalDetails?: {
        placeOfWork: string;
        profession: string;
        position: string;
    };
    status: 'Active Client' | 'Refunded' | 'Reallocated';
    stage: string; // Acronym from Milestone
    payment: Payment;
    interactions: Interaction[];
    witness: Witness;
    nextOfKin: NextOfKin;
    indenture: Indenture;
    officeUse: OfficeUse;
    // Fix: Added documentation property to Client type
    documentation: Documentation;
    isComplete: boolean;
    filledFormPdf: string | null;
    googleDriveFolderId?: string;
}

export interface Milestone {
    acronym: string;
    label: string;
    progress: number;
}

export interface Staff {
    id: number;
    fullName: string;
    initials: string;
    email: string;
    phone?: string;
    password?: string;
    roleId: number;
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
    id: number;
    name: string;
    description: string;
    isDefault?: boolean;
}

export interface Invoice {
    id: string;
    clientId: number;
    clientName: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    issueDate: string;
    dueDate: string;
}

export type ActivityLogType = 'Login' | 'Logout' | 'Create' | 'Update' | 'Delete' | 'View' | 'Import';
export interface ActivityLog {
    id: number;
    userId: number;
    type: ActivityLogType;
    description: string;
    timestamp: string;
}

export interface PermissionSet {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
}
export interface CompanySettings {
    name: string;
    logo?: string;
}

export type AppModuleName = 'Dashboard' | 'Clients' | 'Account Management' | 'Promotions' | 'Team' | 'Leads Management' | 'Administration' | 'CEO Hub' | 'Settings';
export interface AppModule {
    id: AppModuleName;
    name: string;
}
export interface RolePermission {
    roleId: number;
    moduleId: AppModuleName;
    permissions: PermissionSet;
}

export interface VendorLandPurchase {
    ownerNames: string;
    location: string;
    registrationStatus: string;
    purchaseAgreementDate: string;
    totalSizeAcres: string;
    pricePerAcre: string;
    totalPrice: string;
    familyName: string;
    nameOnSearch: string;
    officialSearchDoc: File | null;
    sitePlanDoc: File | null;
    leadNegotiators: string;
    familyContactPerson: string;
    phoneNumbers: string[];
    additionalNotes: string;
    paymentAmountPerMonth: string;
    paymentPeriodMonths: string;
    recurringPaymentTime: string;
    payees: Payee[];
    plotInventory: { size: PlotSize; count: string }[];
    signingDate: string;
    familyRepSignature: { name: string; date: string };
    ceoSignature: { name: string; date: string };
    managingDirectorSignature: { name: string; date: string };
    accountsHeadSignature: { name: string; date: string };
}
export interface Payee {
    id: string;
    name: string;
    acres: string;
    amount: string;
}

export interface Promotion {
    id: number;
    title: string;
    description: string;
    promoType: 'Discount' | 'Free Plot' | 'Referral Bonus' | 'Seasonal Offer' | 'Other';
    startDate: string;
    endDate: string;
    discountValue: number;
    applicablePropertyId: number | 'all';
    status: 'Active' | 'Inactive';
    bannerImage?: string;
}

export interface ReceiptPattern {
    prefix: string;
    lastNumber: number;
    minLength: number;
}
export interface ReceiptAlert {
    id: number;
    clientId: number;
    enteredBy: string;
    suspiciousNumber: string;
    date: string;
    details: string;
}

export interface AmendmentRequest {
    id: string;
    clientId: number;
    clientFullName: string;
    clientPurchaseRef: string;
    requestDate: string;
    requestingStaffId: number;
    amendmentTypes: {
        personalDetails: boolean;
        nextOfKin: boolean;
        propertyReallocation: boolean;
        paymentPlan: boolean;
        indenture: boolean;
    };
    personalDetails?: {
        dateOfBirth: string;
        currentAddress: string;
        phone: string;
        email: string;
        newDetailsToUpdate: string;
    };
    nextOfKinDetails?: {
        name: string;
        address: string;
        phone: string;
        relationship: string;
        email: string;
        newDetailsToUpdate: string;
    };
    scannedForm: string | null;
    officeUse: {
        receivedBy: string;
        dateReceived: string;
        status: 'Pending' | 'Approved' | 'Rejected';
        approvedBy?: string;
        newPlotAllocated?: string;
        additionalFees?: number;
        remarks?: string;
    };
}
export interface GeneratedReport {
    id: number;
    title: string;
    type: string;
    period: string;
    generatedDate: string;
}
export interface LeadComment {
    id: number;
    text: string;
    authorId: number;
    date: string;
}
export interface Lead {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    source: 'WhatsApp' | 'Facebook' | 'Referral' | 'Outreach' | 'Other';
    status: 'Contacted' | 'Visited Site' | 'Filled a Form' | 'Submitted the Form' | 'Made Payment' | 'Converted to Client';
    assignedRepId: number;
    nextFollowUpDate: string;
    lastContactDate: string;
    notes: string;
    createdAt: string;
    comments: LeadComment[];
}