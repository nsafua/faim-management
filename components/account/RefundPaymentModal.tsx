import React, { useState } from 'react';
import { Client, RefundRecord, RefundTransaction } from '../../types';
import { XMarkIcon, ExclamationTriangleIcon, BanknotesIcon } from '../icons/DummyIcons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';

interface RefundPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    refundRecord: RefundRecord;
    onSave: (data: RefundTransaction) => Promise<void>;
    userName: string;
}

export const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({ 
    isOpen, onClose, client, refundRecord, onSave, userName 
}) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [channel, setChannel] = useState(refundRecord.channel);
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const numAmount = Number(amount);
        if (numAmount <= 0) {
            setError("Please enter a valid payout amount.");
            return;
        }

        if (numAmount > refundRecord.outstandingRefundBalance) {
            setError(`Payout exceeds current refund balance of ${formatCurrency(refundRecord.outstandingRefundBalance)}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const txn: RefundTransaction = {
                id: `RPY-${client.id}-${Date.now()}`,
                refundId: refundRecord.id,
                clientId: client.id,
                amount: numAmount,
                date,
                channel,
                reference,
                notes,
                enteredBy: userName,
                timestamp: new Date().toISOString()
            };

            await onSave(txn);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to post refund payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">Record Refund Payout</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{client.name}</p>
                        </div>
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                    </div>

                    <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded flex gap-2 animate-in slide-in-from-top-1">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
                                <p className="text-xs text-red-800 dark:text-red-200 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                            <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Pending Refund Liability</p>
                            <p className="text-xl font-black text-amber-700 dark:text-amber-300">{formatCurrency(refundRecord.outstandingRefundBalance)}</p>
                        </div>

                        <Input label="Payout Amount (GHS)*" type="number" value={amount} onChange={e => setAmount(e.target.value)} required disabled={isSubmitting} className="font-black text-lg text-blue-600" />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Date*" type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isSubmitting} />
                            <Select label="Channel*" value={channel} onChange={e => setChannel(e.target.value as any)} required disabled={isSubmitting}>
                                <option>Bank Transfer</option>
                                <option>Mobile Money</option>
                                <option>Cheque</option>
                                <option>Other</option>
                            </Select>
                        </div>

                        <Input label="Reference Number*" value={reference} onChange={e => setReference(e.target.value)} required disabled={isSubmitting} placeholder="E.g. CHQ-10023" />
                        <Textarea label="Internal Remarks" value={notes} onChange={e => setNotes(e.target.value)} rows={2} disabled={isSubmitting} />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50">Cancel</button>
                        <Button type="submit" variant="success" isLoading={isSubmitting} className="font-black uppercase tracking-widest px-6" icon={<BanknotesIcon className="w-5 h-5" />}>Commit Payout</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};