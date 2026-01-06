
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

export interface Commission {
    type: 'Percentage' | 'Fixed';
    amount: number;
    status: 'Pending' | 'Paid';
    paymentDate?: string;
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
