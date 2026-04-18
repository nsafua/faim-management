import { Payment, Commission } from './finance';

export type ClientType = 'Individual' | 'Corporate/Group';
export type PaymentTrackingMode = 'Group Ledger' | 'Individual Member' | 'Mixed';
export type AllocationStatus = 'RESERVED_NOT_ALLOCATED' | 'ALLOCATED';
export type RefundStatus = 'No Refund' | 'Refund Requested' | 'Refund Ongoing' | 'Refund Completed';

export interface RefundRecord {
    id: string;
    clientId: number;
    reason: string;
    channel: 'Bank Transfer' | 'Mobile Money' | 'Cheque' | 'Other';
    otherCosts: number;
    instalmentPeriod: number;
    withholdingApplied: boolean;
    withholdingAmount: number;
    totalPaidAtRequest: number;
    refundableAmount: number;
    outstandingRefundBalance: number;
    signedFormUrl: string;
    refundLetterUrl: string;
    status: RefundStatus;
    requestedBy: string;
    requestedByRole: string;
    timestamp: string;
}

export interface RefundTransaction {
    id: string;
    refundId: string;
    clientId: number;
    amount: number;
    date: string;
    channel: string;
    reference: string;
    notes?: string;
    enteredBy: string;
    timestamp: string;
}

export interface RefundPlan {
    totalAmount: number;
    schedulePattern: string;
    startDate: string;
    endDate: string;
    isCompleted: boolean;
    isCancelled?: boolean;
    createdAt: string;
    createdBy: string;
    completedAt?: string;
    closedBy?: string;
}

export interface MilestoneRecord {
    id?: string;
    clientId: number;
    milestoneCode: 'SFR' | 'PLR' | 'PFI' | '3MP' | 'IR' | 'DPU' | 'CPD' | 'ACA';
    dateCompleted: string;
    notes?: string;
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
    pickupDetails?: {
        finalPickupDate: string;
        pickupPersonName: string;
        idCardImageUrl: string;
    };
}

export interface Client {
    id: number;
    clientType: ClientType;
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
    refundStatus?: RefundStatus;
    allocationStatus?: AllocationStatus;
    paidPercent?: number;
    isQualified?: boolean;
    qualifiedAt?: string;
    hasQualified70?: boolean;
    qualificationDate?: string;
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
    refundPlan?: RefundPlan;
    groupMetadata?: {
        paymentMode: PaymentTrackingMode;
        totalPlotsEntitlement: number;
        memberCount: number;
    };
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