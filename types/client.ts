
import { Payment, Commission } from './finance';

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

export interface OfficeUse {
    salesRep: string;
    salesManager: string;
    accountsHead: string;
    clerk: string;
    commission: Commission;
}

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
    stage: string; 
    payment: Payment;
    interactions: Interaction[];
    witness: Witness;
    nextOfKin: NextOfKin;
    indenture: Indenture;
    officeUse: OfficeUse;
    documentation: Documentation;
    isComplete: boolean;
    filledFormPdf: string | null;
    googleDriveFolderId?: string;
}

export interface AmendmentRequest {
    id: string;
    clientId: number;
    clientFullName: string;
    clientPurchaseRef: string;
    requestDate: string;
    requestingStaffId: string;
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
    propertyReallocation?: {
        currentLocation: string;
        currentPlot: string;
        newLocation: string;
        newPlot: string;
    };
    paymentPlanDetails?: {
        currentPlan: string;
        newPlan: string;
    };
    indentureDetails?: {
        currentName: string;
        currentAddress: string;
        newName: string;
        newAddress: string;
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
