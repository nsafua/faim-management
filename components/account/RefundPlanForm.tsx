import React, { useMemo } from 'react';
import { Client, RefundRecord, RefundTransaction } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { 
    ExclamationTriangleIcon, 
    CheckCircleIcon, 
    ArrowTrendingUpIcon, 
    PlusCircleIcon,
    DocumentTextIcon,
    LockClosedIcon,
    BanknotesIcon,
    InformationCircleIcon
} from '../icons/DummyIcons';
import { useRefunds, useClients } from '../../hooks/useAppData';
import { useModal } from '../../context/ModalContext';
import { MODAL_TYPES } from '../ModalManager';

interface RefundPlanFormProps {
    client: Client;
    canEdit: boolean;
    userName: string;
    onSave?: (plan: any) => Promise<void>; // Prop inherited but unused for status management here
}

export const RefundPlanForm: React.FC<RefundPlanFormProps> = ({ client, canEdit, userName }) => {
    const { refundRecord, transactions, requestRefund, postTransaction } = useRefunds(client.id);
    const { openModal } = useModal();

    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    const handleInitiateRequest = () => {
        openModal(MODAL_TYPES.REFUND_REQUEST, {
            client,
            userName,
            userRole: canEdit ? 'Chief Accountant / CEO' : 'Staff',
            onSave: async (record: RefundRecord) => {
                // requestRefund now internally updates client.refundStatus atomicly
                // ensuring no CEO approval is triggered as restricted fields are untouched.
                await requestRefund(record);
            }
        });
    };

    const handlePostPayment = () => {
        if (!refundRecord) return;
        openModal(MODAL_TYPES.REFUND_PAYMENT, {
            client,
            refundRecord,
            userName,
            onSave: async (txn: RefundTransaction) => {
                await postTransaction(txn);
            }
        });
    };

    const isRequestActive = !!refundRecord;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Refund Request Details Summary Panel */}
            <Card title="Refund Request Details" action={
                <Badge variant={refundRecord?.status === 'Refund Completed' ? 'success' : isRequestActive ? 'warning' : 'neutral'}>
                    {refundRecord?.status || 'No Active Request'}
                </Badge>
            }>
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {isRequestActive ? 'A formal refund process is active for this account.' : 'Initialize the refund process based on governance protocols.'}
                            </p>
                            <p className="text-xs text-gray-500">All refunds require signed physical documentation scans.</p>
                        </div>
                        {canEdit && !isRequestActive && (
                            <Button 
                                onClick={handleInitiateRequest}
                                icon={<PlusCircleIcon className="w-5 h-5" />}
                                className="px-8 font-black uppercase tracking-widest text-xs shadow-lg"
                            >
                                Request Refund
                            </Button>
                        )}
                    </div>

                    {isRequestActive && (
                        <div className="space-y-6">
                            {/* Detailed Breakdown Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Paid (At Request)</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(refundRecord.totalPaidAtRequest)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">25% Withholding</p>
                                    <p className="text-lg font-bold text-red-600">
                                        {refundRecord.withholdingApplied ? formatCurrency(refundRecord.withholdingAmount) : 'Not Applied'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Other Deductible Costs</p>
                                    <p className="text-lg font-bold text-red-600">{formatCurrency(refundRecord.otherCosts)}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Final Refundable Sum</p>
                                    <p className="text-xl font-black text-blue-700 dark:text-blue-300">{formatCurrency(refundRecord.refundableAmount)}</p>
                                </div>
                            </div>

                            {/* Logistics & Balance Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Refund Logistics</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Channel: <span className="font-normal">{refundRecord.channel}</span></p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Period: <span className="font-normal">{refundRecord.instalmentPeriod} Months</span></p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Payout Status</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-green-600">Settled: {formatCurrency(refundRecord.refundableAmount - refundRecord.outstandingRefundBalance)}</p>
                                        <p className="text-sm font-bold text-red-600">Outstanding: {formatCurrency(refundRecord.outstandingRefundBalance)}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-3">
                                    <InformationCircleIcon className="w-8 h-8 text-indigo-500 opacity-20" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Request Metadata</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic">Requested by {refundRecord.requestedBy} on {new Date(refundRecord.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* 2. Mandatory Documentation Access */}
            {isRequestActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                            <div>
                                <p className="text-xs font-bold text-gray-800 dark:text-white">Signed Refund Form</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black">Verified & Uploaded</p>
                            </div>
                        </div>
                        <a href={refundRecord.signedFormUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-blue-600 hover:underline">VIEW PDF</a>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <DocumentTextIcon className="w-6 h-6 text-indigo-500" />
                            <div>
                                <p className="text-xs font-bold text-gray-800 dark:text-white">Refund Application Letter</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black">Verified & Uploaded</p>
                            </div>
                        </div>
                        <a href={refundRecord.refundLetterUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-blue-600 hover:underline">VIEW PDF</a>
                    </div>
                </div>
            )}

            {/* 3. Refund Payout Ledger (Separate from standard ledger) */}
            <Card title="Refund Payout Ledger" action={
                canEdit && isRequestActive && refundRecord.status !== 'Refund Completed' && (
                    <Button 
                        size="sm" 
                        variant="success" 
                        onClick={handlePostPayment}
                        icon={<BanknotesIcon className="w-4 h-4" />}
                    >
                        Make Refund Payment
                    </Button>
                )
            }>
                <TableContainer className="border-0 shadow-none">
                    <table className="w-full text-sm text-left">
                        <Thead>
                            <tr>
                                <Th>Payout Date</Th>
                                <Th className="text-right">Amount</Th>
                                <Th>Channel</Th>
                                <Th>Reference</Th>
                                <Th>Entered By</Th>
                                <Th className="text-right">System Timestamp</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {transactions.length === 0 ? (
                                <Tr>
                                    <Td colSpan={6} className="text-center py-12 text-gray-400 italic">No refund payouts recorded yet.</Td>
                                </Tr>
                            ) : (
                                transactions.map(txn => (
                                    <Tr key={txn.id}>
                                        <Td className="font-bold text-gray-700 dark:text-gray-300">{txn.date}</Td>
                                        <Td className="text-right font-black text-red-600">{formatCurrency(txn.amount)}</Td>
                                        <Td><Badge variant="neutral">{txn.channel}</Badge></Td>
                                        <Td className="font-mono text-xs uppercase text-gray-500">{txn.reference}</Td>
                                        <Td className="text-xs font-bold text-gray-600">{txn.enteredBy}</Td>
                                        <Td className="text-right font-mono text-[10px] text-gray-400">
                                            {new Date(txn.timestamp).toLocaleString()}
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </table>
                </TableContainer>
            </Card>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900 flex items-start gap-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest">Financial Integrity Clause</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                        Initiating a refund implies account closure. Once the refund balance reaches zero, the account will be marked as "Refund Completed" and locked. Historical payment transactions are retained for audit reconciliation.
                    </p>
                </div>
            </div>
        </div>
    );
};