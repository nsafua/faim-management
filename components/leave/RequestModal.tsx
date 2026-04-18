
import React, { useState, useEffect } from 'react';
import { 
    CalendarDaysIcon, 
    XMarkIcon,
    PaperClipIcon
} from '../icons/DummyIcons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    loading: boolean;
}

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        type: 'Annual Leave',
        startDate: '',
        endDate: '',
        days: 0,
        reason: '',
        file: null as File | null
    });

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setFormData(prev => ({ ...prev, days: diffDays > 0 ? diffDays : 0 }));
        }
    }, [formData.startDate, formData.endDate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl p-0 overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 shrink-0">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CalendarDaysIcon className="w-5 h-5 text-blue-600" /> Application for Leave
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                    
                    <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-grow bg-white dark:bg-gray-800">
                        <Select label="Leave Type*" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                            <option>Annual Leave</option>
                            <option>Sick Leave</option>
                            <option>Casual Leave</option>
                            <option>Emergency Leave</option>
                            <option>Other</option>
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Start Date*" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                            <Input label="End Date*" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                        </div>
                        <Input label="Total Days" type="number" value={formData.days} readOnly className="bg-gray-50 font-bold text-blue-600" />
                        <Textarea label="Reason for Leave*" rows={4} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required placeholder="Provide context for your application..." />
                        
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supporting Document (Optional)</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <PaperClipIcon className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">{formData.file ? formData.file.name : 'Click to upload attachment'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={e => setFormData({...formData, file: e.target.files?.[0] || null})} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>Submit Application</Button>
                    </div>
                </form>
            </Card>
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};
