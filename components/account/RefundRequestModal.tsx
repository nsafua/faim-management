import React from 'react';
import { Client, RefundRecord } from '../../types';
import { XMarkIcon, LockClosedIcon } from '../icons/DummyIcons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { useRefundRequestState } from '../../hooks/useRefundRequestState';
import { ErrorSummary } from './ErrorSummary';
import { FileUploadField } from './FileUploadField';

interface RefundRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave: (data: RefundRecord) => Promise<void>;
    userName: string;
    userRole: string;
}

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({ 
    isOpen, onClose, client, onSave, userName, userRole 
}) => {
    const {
        formData,
        setFormData,
        formUpload,
        setFormUpload,
        letterUpload,
        setLetterUpload,
        isSubmitting,
        validationErrors,
        globalError,
        totalPaid,
        financialBreakdown,
        handleSubmit
    } = useRefundRequestState(client, onSave, onClose, userName, userRole);

    if (!isOpen) return null;

    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container: Restricted height to enable internal scroll */}
            <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border-0">
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    {/* Fixed Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Refund Request Initiation</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{client.name} (Ref: {client.initials}-{client.id})</p>
                        </div>
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Scrollable Form Body: flex-grow + min-h-0 + overflow-y-auto is essential for flex scrollability */}
                    <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin flex-grow bg-white dark:bg-gray-800 min-h-0">
                        {/* Error Summary Area */}
                        <ErrorSummary validationErrors={validationErrors} globalError={globalError} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Paid (Ledger)</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(totalPaid)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Account Balance</p>
                                <p className="text-lg font-black text-red-600">{formatCurrency(client.payment.balance)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select label="Refund Channel*" value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value as any})} required disabled={isSubmitting}>
                                <option>Bank Transfer</option>
                                <option>Mobile Money</option>
                                <option>Cheque</option>
                                <option>Other</option>
                            </Select>
                            <Input label="Period (Months)*" type="number" value={formData.instalmentPeriod} onChange={e => setFormData({...formData, instalmentPeriod: Number(e.target.value)})} min="1" required disabled={isSubmitting} />
                            <Input label="Other Costs for Refund (GHC)*" type="number" value={formData.otherCosts} onChange={e => setFormData({...formData, otherCosts: Number(e.target.value)})} disabled={isSubmitting} />
                            <div className="flex items-center gap-3 pt-6">
                                <input type="checkbox" id="withholding" checked={formData.withholdingApplied} onChange={e => setFormData({...formData, withholdingApplied: e.target.checked})} disabled={isSubmitting} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                <label htmlFor="withholding" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Apply 25% Withholding Tax</label>
                            </div>
                        </div>

                        <Textarea label="Reason for Refund Request*" rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required disabled={isSubmitting} placeholder="Provide detailed justification for the refund..." />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUploadField label="Signed Refund Form" state={formUpload} setter={setFormUpload} isSubmitting={isSubmitting} />
                            <FileUploadField label="Refund Application Letter" state={letterUpload} setter={setLetterUpload} isSubmitting={isSubmitting} />
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 space-y-3">
                            <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest flex items-center gap-2">
                                <LockClosedIcon className="w-4 h-4" /> Final Refundable Calculation
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-blue-700 dark:text-blue-400">
                                    <span>Total Amount Paid (Base)</span>
                                    <span className="font-bold">{formatCurrency(totalPaid)}</span>
                                </div>
                                {formData.withholdingApplied && (
                                    <div className="flex justify-between text-red-600 dark:text-red-400">
                                        <span>25% Withholding Deduction</span>
                                        <span className="font-bold">-{formatCurrency(financialBreakdown.withholding)}</span>
                                    </div>
                                )}
                                {formData.otherCosts > 0 && (
                                    <div className="flex justify-between text-red-600 dark:text-red-400">
                                        <span>Other Deductible Costs</span>
                                        <span className="font-bold">-{formatCurrency(financialBreakdown.other)}</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between text-lg font-black text-blue-900 dark:text-white">
                                    <span>FINAL REFUNDABLE SUM</span>
                                    <span>{formatCurrency(financialBreakdown.refundable)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 transition-colors disabled:opacity-50">Abort</button>
                        <Button type="submit" isLoading={isSubmitting} className="px-8 font-black uppercase tracking-widest text-xs">
                            {isSubmitting ? 'Processing...' : 'Commit Request'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
