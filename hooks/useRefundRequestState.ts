import { useState, useMemo } from 'react';
import { Client, RefundRecord } from '../types';
import { uploadFile } from '../services/storageService';

export type UploadState = {
    file: File | null;
    status: 'idle' | 'uploading' | 'success' | 'failed';
    progress: number;
    url: string | null;
    error: string | null;
};

export const useRefundRequestState = (client: Client, onSave: (data: RefundRecord) => Promise<void>, onClose: () => void, userName: string, userRole: string) => {
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

    return {
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
    };
};
