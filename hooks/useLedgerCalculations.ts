import { useMemo } from 'react';
import { Client } from '../types';

export const useLedgerCalculations = (
    client: Client,
    startDate: string,
    endDate: string
) => {
    return useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        
        // 1. Sort history chronologically
        const fullHistory = [...client.payment.paymentHistory].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let runningBalance = client.payment.total;
        const ledgerEntries: any[] = [];
        let totalPaidInPeriod = 0;

        // Base entry logic - Merge installments with history
        // If history is empty, we show the initial expectation
        if (fullHistory.length === 0) {
            ledgerEntries.push({
                type: 'Initial Deposit',
                expectedDate: client.regDate,
                actualDate: '',
                amount: 0,
                status: new Date(client.regDate) < today ? 'Overdue' : 'Pending',
                balance: runningBalance
            });
        } else {
            fullHistory.forEach((txn, idx) => {
                runningBalance -= txn.amount;
                const txnDate = new Date(txn.date);
                
                // Determine Row Type
                const rowType = idx === 0 ? 'Initial Deposit' : 'Instalment Payment';
                
                // Determine Status
                let status = 'Paid';
                if (txn.status === 'Failed') status = 'Adjustment';
                else if (txn.amount > (client.payment.total / 12)) status = 'Advance'; // Simplified logic for demo
                
                if (txnDate >= start && txnDate <= end) {
                    totalPaidInPeriod += txn.amount;
                }

                ledgerEntries.push({
                    type: rowType,
                    expectedDate: client.regDate, // Simplified: using regDate as expected for first, ideally map to installments array
                    actualDate: txn.date,
                    amount: txn.amount,
                    status: status,
                    balance: runningBalance
                });
            });
        }

        return {
            ledgerEntries,
            totalPaidInPeriod,
            closingBalance: runningBalance
        };
    }, [client, startDate, endDate]);
};
