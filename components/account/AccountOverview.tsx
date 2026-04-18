
import React, { useMemo, useState, useEffect } from 'react';
import { Client } from '../../types';
import { CheckCircleIcon, BanknotesIcon, LockClosedIcon } from '../../components/icons/DummyIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

interface AccountOverviewProps {
    selectedClient: Client;
    originalPricePerPlot: number;
    discountAmount: number;
    priceAfterDiscount: number;
    installmentOption: string;
    setInstallmentOption: (val: string) => void;
    onInitialSave: (customMonths?: number, financialSnapshot?: any) => void;
    isSaving: boolean;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
    selectedClient,
    originalPricePerPlot,
    discountAmount: propDiscountAmount,
    priceAfterDiscount: propPriceAfterDiscount,
    installmentOption,
    setInstallmentOption,
    onInitialSave,
    isSaving
}) => {
    const isInitialized = !!(selectedClient.payment as any).isInitialized;
    const plotCount = useMemo(() => selectedClient.plot.split(',').filter(p => p.trim()).length || 1, [selectedClient.plot]);
    const preDiscountTotal = originalPricePerPlot * plotCount;

    // Internal state for Discount Logic (Only used before Save)
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
        (selectedClient.payment as any).discountType || 'percentage'
    );
    const [discountValue, setDiscountValue] = useState<string>(
        String((selectedClient.payment as any).discountValue || '0')
    );
    const [customMonths, setCustomMonths] = useState<string>(
        String((selectedClient.payment as any).customMonths || '24')
    );

    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    const financials = useMemo(() => {
        const dVal = parseFloat(discountValue) || 0;
        let dAmt = 0;
        
        if (discountType === 'percentage') {
            dAmt = preDiscountTotal * (Math.min(100, Math.max(0, dVal)) / 100);
        } else {
            dAmt = Math.min(preDiscountTotal, Math.max(0, dVal));
        }

        const finalTotal = preDiscountTotal - dAmt;
        const months = installmentOption === 'Outright' ? 1 : 
                       (installmentOption === 'Other' ? (parseInt(customMonths) || 1) : parseInt(installmentOption));
        
        const emi = finalTotal / months;

        return {
            preDiscountTotal,
            discountAmount: dAmt,
            finalTotal: isInitialized ? selectedClient.payment.total : finalTotal,
            emi: isInitialized ? ((selectedClient.payment as any).emiMonthlyPayment || (selectedClient.payment.total / months)) : emi,
            months
        };
    }, [discountType, discountValue, preDiscountTotal, installmentOption, customMonths, isInitialized, selectedClient.payment]);

    const handleSave = () => {
        const snapshot = {
            discountType,
            discountValue: parseFloat(discountValue),
            discountAmountApplied: financials.discountAmount,
            contractTotalBeforeDiscount: financials.preDiscountTotal,
            contractTotalAfterDiscount: financials.finalTotal,
            emiMonthlyPayment: financials.emi,
            monthlyInstallmentAmount: financials.emi, // Explicitly mirrored
            customMonths: installmentOption === 'Other' ? parseInt(customMonths) : null
        };
        onInitialSave(installmentOption === 'Other' ? parseInt(customMonths) : undefined, snapshot);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Card title="Active Account Ledger">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Property Location</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedClient.location || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Number of Plots</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{plotCount}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Price Total</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(preDiscountTotal)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Status</p>
                        <Badge variant={isInitialized ? 'success' : 'warning'}>
                            {isInitialized ? 'LOCKED' : 'PENDING INITIALIZATION'}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">EMI Selection</p>
                        <Badge variant="info">{selectedClient.payment.planType || 'N/A'}</Badge>
                    </div>
                </div>
                {!isInitialized && (
                    <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            isLoading={isSaving}
                            icon={<CheckCircleIcon className="w-5 h-5" />}
                            className="w-full md:w-auto px-12 py-3"
                        >
                            Save Payment Details
                        </Button>
                    </div>
                )}
            </Card>

            <Card title="Financial Configuration">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase">Discount Type</label>
                        <Select 
                            value={discountType} 
                            onChange={(e) => setDiscountType(e.target.value as any)}
                            disabled={isInitialized}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (GHC)</option>
                        </Select>
                    </div>

                    <Input 
                        label={`Discount Value ${discountType === 'percentage' ? '(%)' : '(GHC)'}`} 
                        type="number"
                        value={discountValue} 
                        onChange={(e) => setDiscountValue(e.target.value)}
                        disabled={isInitialized}
                        className="font-bold"
                    />

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase">Installment Option</label>
                        {isInitialized ? (
                            <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md font-bold text-gray-800 dark:text-white">
                                {selectedClient.payment.planType}
                            </div>
                        ) : (
                            <Select 
                                value={installmentOption} 
                                onChange={(e) => setInstallmentOption(e.target.value)}
                            >
                                <option value="Outright">Outright</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                                <option value="Other">Other (Custom)</option>
                            </Select>
                        )}
                    </div>

                    {installmentOption === 'Other' && (
                        <Input 
                            label="Custom Months (1-60)" 
                            type="number" 
                            value={customMonths} 
                            onChange={(e) => setCustomMonths(e.target.value)}
                            disabled={isInitialized}
                            className="font-bold"
                        />
                    )}
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Total (After Discount)</p>
                        <p className="text-xl font-black text-green-600">{formatCurrency(financials.finalTotal)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Discount Applied</p>
                        <p className="text-xl font-black text-red-500">-{formatCurrency(financials.discountAmount)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">EMI Monthly Payment (GHS)</p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(financials.emi)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Monthly Installment Amount (GHS)</p>
                        <p className="text-xl font-black text-blue-700 dark:text-blue-300">{formatCurrency(financials.emi)}</p>
                    </div>
                </div>

                {isInitialized && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <LockClosedIcon className="w-5 h-5 text-gray-400" />
                        <p className="text-xs text-gray-500 italic">This ledger is initialized and locked. Contact the Chief Accountant for modifications.</p>
                    </div>
                )}
            </Card>

            <Card title="Current Ledger Standing" className="bg-gray-50/50 dark:bg-gray-900/20 border-dashed">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Total</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(selectedClient.payment.total)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount Paid</p>
                        <p className="text-2xl font-black text-green-600">{formatCurrency(selectedClient.payment.paid)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
                        <p className={`text-2xl font-black ${selectedClient.payment.balance < 0 ? 'text-purple-600' : 'text-red-600'}`}>
                            {formatCurrency(selectedClient.payment.balance)}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
