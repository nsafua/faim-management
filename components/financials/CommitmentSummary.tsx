
import React from 'react';
import { ChartPieIcon, LockClosedIcon, CheckCircleIcon } from '../../components/icons/DummyIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface FinancialSummary {
    originalPrice: number;
    discountAmount: number;
    priceAfterDiscount: number;
    emiAmount: number;
    totalPaid: number;
    outstandingBalance: number;
}

interface CommitmentSummaryProps {
    financialSummary: FinancialSummary;
    formatCurrency: (amount: number) => string;
    isSaving: boolean;
    onCommit: (e: React.FormEvent) => void;
}

export const CommitmentSummary: React.FC<CommitmentSummaryProps> = ({ financialSummary, formatCurrency, isSaving, onCommit }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="border-l-4 border-l-green-500 bg-white dark:bg-gray-800 shadow-xl p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ChartPieIcon className="w-6 h-6 text-green-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Commitment Summary</h3>
                    </div>
                    <Badge variant={financialSummary.outstandingBalance <= 0 && financialSummary.totalPaid > 0 ? 'success' : 'warning'}>
                        Active Ledger
                    </Badge>
                </div>

                <div className="p-6 space-y-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-green-50/20 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Agreed Total</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(financialSummary.priceAfterDiscount)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Total Paid</p>
                            <p className="text-xl font-black text-green-600">{formatCurrency(financialSummary.totalPaid)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Outstanding</p>
                            <p className="text-xl font-black text-red-600">{formatCurrency(financialSummary.outstandingBalance)}</p>
                        </div>
                    </div>

                    <div className="space-y-0 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                            <span className="text-sm text-gray-500">Base Price (CEO Hub)</span>
                            <span className="text-sm font-bold">{formatCurrency(financialSummary.originalPrice)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                            <span className="text-sm text-gray-500">Discount Amount</span>
                            <span className="text-sm font-bold text-red-500">-{formatCurrency(financialSummary.discountAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-500">Final Contract Total</span>
                            <span className="text-sm font-black text-blue-600">{formatCurrency(financialSummary.priceAfterDiscount)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <LockClosedIcon className="w-3 h-3" />
                        System-Generated Record
                    </div>
                    <Button size="sm" onClick={onCommit} isLoading={isSaving} icon={<CheckCircleIcon className="w-4 h-4" />}>
                        Commit Snapshot
                    </Button>
                </div>
            </Card>
        </div>
    );
};
