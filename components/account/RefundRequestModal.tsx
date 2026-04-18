import React, { useState, useMemo } from 'react';
import { Client, RefundRecord } from '../../types';
import { XMarkIcon, ExclamationTriangleIcon, UploadIcon, LockClosedIcon, ArrowPathIcon } from '../icons/DummyIcons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { uploadFile } from '../../services/storageService';

interface RefundRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave: (data: RefundRecord) => Promise<void>;
    userName: string;
    userRole: string;
}

type UploadState = {
    file: File | null;
    status: 'idle' | 'uploading' | 'success' | 'failed';
    progress: number;
    url: string | null;
    error: string | null;
};

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({ 
    isOpen, onClose, client, onSave, userName, userRole 
}) => {
    // Form Fields
    const [formData, setFormData] = useState({
        reason: '',
        channel: 'Bank Transfer' as any,
        otherCosts: 0,
        instalmentPeriod: 1,
        withholdingApplied: true
    });

    // Upload States for mandatory documents
    const [formUpload, setFormUpload] = useState<UploadState>({ file: null, status: 'idle', progress: 0, url: null, error: null });
    const [letterUpload, setLetterUpload] = useState<UploadState>({ file: null, status: 'idle', progress: 0, url: null, error: null });

    // UI Orchestration
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const totalPaid = client.payment.paid;
    
    const financialBreakdown = useMemo(() => {
        const withholding = formData.withholdingApplied ? totalPaid * 0.25 : 0;
        const other = Number(formData.otherCosts) || 0;
        const refundable = Math.max(0, totalPaid - withholding - other);
        
        return { withholding, other, refundable };
    }, [totalPaid, formData]);

    if (!isOpen) return null;

    const validate = () => {
        const errors: string[] = [];
        if (!formData.reason.trim()) errors.push("Reason for Refund Request is required.");
        if (formData.instalmentPeriod < 1) errors.push("Instalment Period must be at least 1 month.");
        if (!formUpload.file && !formUpload.url) errors.push("Signed Refund Form (PDF) is required.");
        if (!letterUpload.file && !letterUpload.url) errors.push("Refund Application Letter (PDF) is required.");
        
        setValidationErrors(errors);
        return errors.length === 0;
    };

    const performUpload = async (
        state: UploadState, 
        setter: React.Dispatch<React.SetStateAction<UploadState>>, 
        prefix: string
    ): Promise<string | null> => {
        if (state.url) return state.url;
        if (!state.file) return null;

        setter(prev => ({ ...prev, status: 'uploading', progress: 30, error: null }));
        try {
            const path = `refunds/${client.id}/${prefix}_${Date.now()}_${state.file.name}`;
            const url = await uploadFile(state.file, path);
            setter(prev => ({ ...prev, status: 'success', progress: 100, url }));
            return url;
        } catch (err: any) {
            setter(prev => ({ ...prev, status: 'failed', error: "Upload failed. Please retry." }));
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError(null);
        
        if (!validate()) return;

        setIsSubmitting(true);
        
        try {
            // 1. Sequentially handle uploads
            const formUrl = await performUpload(formUpload, setFormUpload, 'form');
            const letterUrl = await performUpload(letterUpload, setLetterUpload, 'letter');

            if (!formUrl || !letterUrl) {
                setIsSubmitting(false);
                return; // Upload failed, error is shown per-field
            }

            // 2. Construct deterministic record
            const record: RefundRecord = {
                id: `REF-${client.id}`, // Deterministic ID: One active refund per client
                clientId: client.id,
                reason: formData.reason,
                channel: formData.channel,
                otherCosts: formData.otherCosts,
                instalmentPeriod: formData.instalmentPeriod,
                withholdingApplied: formData.withholdingApplied,
                withholdingAmount: financialBreakdown.withholding,
                totalPaidAtRequest: totalPaid,
                refundableAmount: financialBreakdown.refundable,
                outstandingRefundBalance: financialBreakdown.refundable,
                signedFormUrl: formUrl,
                refundLetterUrl: letterUrl,
                status: 'Refund Requested',
                requestedBy: userName,
                requestedByRole: userRole,
                timestamp: new Date().toISOString()
            };

            // 3. Persist
            await onSave(record);
            
            // 4. Finalize
            onClose();
        } catch (err: any) {
            console.error("Refund Save Error:", err);
            if (err.message?.includes("permission-denied")) {
                setGlobalError("You don't have permission to request a refund.");
            } else {
                setGlobalError(err.message || "An unexpected error occurred during save.");
            }
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    const renderFileUpload = (
        label: string, 
        state: UploadState, 
        setter: React.Dispatch<React.SetStateAction<UploadState>>
    ) => {
        const isUploading = state.status === 'uploading';
        const isSuccess = state.status === 'success';
        const isFailed = state.status === 'failed';

        return (
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase block">{label}*</label>
                <div className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${
                    isFailed ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                    isSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-blue-400'
                }`}>
                    {isUploading ? (
                        <div className="text-center p-4">
                            <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                            <p className="text-xs font-bold text-blue-600">Uploading {state.progress}%...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="text-center p-4">
                            <LockClosedIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-xs font-bold text-green-600 truncate max-w-[180px]">{state.file?.name}</p>
                            <button type="button" onClick={() => setter({ file: null, status: 'idle', progress: 0, url: null, error: null })} className="text-[10px] text-gray-400 underline mt-1">Remove</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center cursor-pointer" onClick={() => !isSubmitting && document.getElementById(`file-${label}`)?.click()}>
                            <UploadIcon className={`w-8 h-8 mb-2 ${isFailed ? 'text-red-400' : 'text-gray-400'}`} />
                            <p className="text-[10px] font-bold text-gray-500">{state.file ? state.file.name : 'Select PDF File'}</p>
                            {isFailed && <button type="button" className="text-[10px] text-red-600 font-black uppercase mt-1">Retry Upload</button>}
                        </div>
                    )}
                    <input 
                        id={`file-${label}`}
                        type="file" 
                        className="hidden" 
                        accept="application/pdf" 
                        disabled={isSubmitting || isUploading}
                        onChange={e => setter({ ...state, file: e.target.files?.[0] || null, status: 'idle', error: null })} 
                    />
                </div>
                {state.error && <p className="text-[10px] text-red-600 font-bold">{state.error}</p>}
            </div>
        );
    };

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
                        {validationErrors.length > 0 && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded flex gap-3 animate-in slide-in-from-top-1">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-black text-red-800 dark:text-red-300 uppercase tracking-tight">Missing Required Fields</p>
                                    <ul className="mt-1 list-disc list-inside text-xs text-red-700 dark:text-red-400 font-medium">
                                        {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {globalError && (
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 rounded flex items-center gap-3 animate-pulse">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                <p className="text-sm text-red-800 dark:text-red-200 font-bold">{globalError}</p>
                            </div>
                        )}

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
                            {renderFileUpload("Signed Refund Form", formUpload, setFormUpload)}
                            {renderFileUpload("Refund Application Letter", letterUpload, setLetterUpload)}
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
