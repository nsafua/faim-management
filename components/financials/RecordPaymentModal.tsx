
import React, { useState } from 'react';
import { Client } from '../../types';
import { XMarkIcon, ExclamationTriangleIcon } from '../../components/icons/DummyIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave: (paymentData: any) => Promise<void> | void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, client, onSave }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'MoMo' | 'Cheque' | 'Other'>('Bank Transfer');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [type, setType] = useState<'Land' | 'Indenture' | 'Commission'>('Land');
    
    // UI State for Submission Flow
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Await the save operation provided by parent
            await onSave({
                amount: parseFloat(amount),
                method,
                receiptNumber,
                type,
                date: new Date().toISOString().split('T')[0]
            });
            
            // On Success: Automatically close the window
            onClose();
        } catch (err: any) {
            // On Failure: Keep window open and show error
            console.error("Payment Submission Error:", err);
            setError(err.message || "Failed to post transaction. Please verify your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">Record New Payment</h3>
                            <p className="text-[10px] text-gray-500 font-medium uppercase">{client.name}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6"/>
                        </button>
                    </div>

                    <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded flex gap-2 animate-in slide-in-from-top-1">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
                                <p className="text-xs text-red-800 dark:text-red-200 font-medium">{error}</p>
                            </div>
                        )}

                        <Input 
                            label="Amount (GHC)*" 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            required 
                            disabled={isSubmitting}
                            className="font-bold text-lg"
                        />
                        
                        <div className="grid grid-cols-1 gap-4">
                            <Select 
                                label="Payment Method*" 
                                value={method} 
                                onChange={e => setMethod(e.target.value as any)} 
                                required 
                                disabled={isSubmitting}
                            >
                                <option>Bank Transfer</option>
                                <option>MoMo</option>
                                <option>Cash</option>
                                <option>Cheque</option>
                                <option>Other</option>
                            </Select>
                            
                            <Select 
                                label="Transaction Type*" 
                                value={type} 
                                onChange={e => setType(e.target.value as any)} 
                                required 
                                disabled={isSubmitting}
                            >
                                <option value="Land">Land Payment</option>
                                <option value="Indenture">Indenture / Documentation</option>
                                <option value="Commission">Commission Payout</option>
                            </Select>
                        </div>

                        <Input 
                            label="Receipt Number*" 
                            value={receiptNumber} 
                            onChange={e => setReceiptNumber(e.target.value)} 
                            required 
                            disabled={isSubmitting}
                            placeholder="e.g. REC-100234"
                            className="font-mono uppercase"
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <Button 
                            type="submit" 
                            variant="success"
                            isLoading={isSubmitting}
                            className="font-black uppercase tracking-widest px-6"
                        >
                            Post Transaction
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
