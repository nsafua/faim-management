import React, { useMemo } from 'react';
import { Client } from '../../types';
import { PlusCircleIcon, ShieldCheckIcon, ArrowTrendingUpIcon } from '../../components/icons/DummyIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';

interface AccountHistoryProps {
    selectedClient: Client;
    canMakePayment: boolean;
    isCEO: boolean;
    isAccountant: boolean;
    onMakePayment: () => void;
    onAuthorizeAmendment: () => void;
    onOpenRefund: () => void;
    paymentAggregation: { land: number; indenture: number };
}

export const AccountHistory: React.FC<AccountHistoryProps> = ({
    selectedClient,
    canMakePayment,
    isCEO,
    isAccountant,
    onMakePayment,
    onAuthorizeAmendment,
    onOpenRefund,
    paymentAggregation
}) => {
    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    const canManageRefund = isCEO || isAccountant;

    const mergedLedger = useMemo(() => {
        // 1. Get real transactions
        const history = selectedClient.payment.paymentHistory.map(txn => ({
            ...txn,
            isExpected: false,
            displayType: (txn as any).type || 'Land'
        }));

        // 2. Get expected schedule from localStorage
        const storageKey = `expected_schedule_${selectedClient.id}`;
        const rawSchedule = localStorage.getItem(storageKey);
        const schedule = rawSchedule ? JSON.parse(rawSchedule).map((item: any) => ({
            ...item,
            isExpected: true,
            displayType: 'EXPECTED PAYMENT',
            status: 'Pending'
        })) : [];

        // 3. Merge and sort chronologically
        const combined = [...history, ...schedule].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return combined;
    }, [selectedClient]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Card title="Transactional Ledger History" action={
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={onOpenRefund}
                        icon={<ArrowTrendingUpIcon className="w-4 h-4 rotate-180" />}
                    >
                        {canManageRefund ? 'Manage Refund' : 'View Refund Status'}
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        disabled={!canMakePayment}
                        onClick={onMakePayment}
                        icon={<PlusCircleIcon className="w-4 h-4" />}
                        title={!canMakePayment ? "Insufficient permissions" : "Post new payment"}
                    >
                        Make Payment
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        disabled={!isCEO}
                        onClick={onAuthorizeAmendment}
                        icon={<ShieldCheckIcon className="w-4 h-4" />}
                    >
                        Authorize Amendment
                    </Button>
                </div>
            }>
                <TableContainer className="border-0 shadow-none">
                    <table className="w-full text-sm text-left">
                        <Thead>
                            <tr>
                                <Th>Type</Th>
                                <Th>Actual Date</Th>
                                <Th>Scheduled Date</Th>
                                <Th className="text-right">Amount</Th>
                                <Th className="text-center">Status</Th>
                                <Th className="text-right">Description</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {mergedLedger.length === 0 ? (
                                <Tr>
                                    <Td colSpan={6} className="text-center py-12 text-gray-400 italic">No transactional records found.</Td>
                                </Tr>
                            ) : (
                                mergedLedger.map((item, idx) => {
                                    const isFuture = new Date(item.date) > new Date();
                                    
                                    return (
                                        <Tr key={item.id || idx} className={item.isExpected ? 'opacity-70 border-dashed bg-blue-50/10 dark:bg-blue-900/5' : ''}>
                                            <Td className={`font-bold ${item.isExpected ? 'text-blue-500 italic' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {item.displayType}
                                            </Td>
                                            <Td className="font-mono text-gray-600 dark:text-gray-400">
                                                {item.isExpected ? '—' : (item.date || '—')}
                                            </Td>
                                            <Td className={`font-bold ${item.isExpected ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                                                {item.date || '—'}
                                            </Td>
                                            <Td className={`text-right font-black ${item.isExpected ? 'text-blue-400' : 'text-green-600'}`}>
                                                {formatCurrency(item.amount)}
                                            </Td>
                                            <Td className="text-center">
                                                <Badge variant={item.isExpected ? 'neutral' : (isFuture ? 'info' : 'success')}>
                                                    {item.isExpected ? 'EXPECTED' : (isFuture ? 'SCHEDULED' : 'PAID')}
                                                </Badge>
                                            </Td>
                                            <Td className="text-right font-medium text-gray-500">
                                                {item.isExpected ? item.description : (item.receiptNumber || 'Ref Entry')}
                                            </Td>
                                        </Tr>
                                    );
                                })
                            )}
                        </Tbody>
                    </table>
                </TableContainer>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Land Payments Made</p>
                        <p className="text-xl font-black text-blue-700 dark:text-blue-300">{formatCurrency(paymentAggregation.land)}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Indenture Payments Made</p>
                        <p className="text-xl font-black text-emerald-700 dark:text-blue-300">{formatCurrency(paymentAggregation.indenture)}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
