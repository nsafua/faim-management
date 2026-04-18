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

export interface PriceHistory {
    date: string;
    oldPrice: number;
    newPrice: number;
    changedBy: string;
}

export interface Property {
    id: number;
    location: string;
    description: string;
    size: number; // in acres
    price: number; // per plot (selling price)
    costPrice?: number; // per plot (acquisition cost)
    inventory: PlotInventory[];
    registrationStatus: 'Titled' | 'Indenture' | 'Plotted';
    discount?: Discount;
    layoutPdfUrl?: string;
    priceHistory?: PriceHistory[];
    // Archiving System
    isArchived?: boolean;
    archivedAt?: string;
    archivedBy?: string;
}

export interface Payee {
    id: string;
    name: string;
    acres: string;
    amount: string;
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