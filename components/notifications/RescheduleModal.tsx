import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { XMarkIcon, ExclamationTriangleIcon } from '../icons/DummyIcons';

interface RescheduleModalProps {
    onSubmit: (date: string, reason: string) => void;
    onCancel: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ onSubmit, onCancel }) => {
    const [rescheduleForm, setRescheduleForm] = useState({ date: '', reason: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rescheduleForm.date, rescheduleForm.reason);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-sm p-0 overflow-hidden shadow-2xl border border-indigo-500/30">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Reschedule Protocol</h3>
                        <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 rounded flex gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-[10px] text-amber-800 dark:text-amber-400 font-bold leading-relaxed uppercase">
                                Alert: This action is permanent and will be logged in the system audit trail.
                            </p>
                        </div>
                        <Input 
                            label="New Follow-up Commitment Date" 
                            type="date" 
                            value={rescheduleForm.date}
                            onChange={e => setRescheduleForm({...rescheduleForm, date: e.target.value})}
                            required 
                            className="font-bold"
                        />
                        <Textarea 
                            label="Justification for Delay" 
                            value={rescheduleForm.reason}
                            onChange={e => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                            placeholder="Provide business justification..."
                            required 
                            rows={4}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                        <Button type="button" variant="secondary" className="flex-1 uppercase font-black text-[10px]" onClick={onCancel}>Abort</Button>
                        <Button type="submit" className="flex-1 uppercase font-black text-[10px]">Commit Change</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
