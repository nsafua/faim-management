
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Lead, Staff } from '../types';
import { XIcon } from './icons/XIcon';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { PhoneInput } from './ui/PhoneInput';
import { EmailInput } from './ui/EmailInput';

interface LeadFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastContactDate' | 'comments'>) => void;
    salesReps: Staff[];
    editingLead: Lead | null;
}

const initialFormData = {
    fullName: '',
    email: '',
    phone: '',
    source: 'WhatsApp' as Lead['source'],
    status: 'Contacted' as Lead['status'],
    assignedRepId: '',
    nextFollowUpDate: '',
    notes: '',
};

const LeadForm: React.FC<LeadFormProps> = ({ isOpen, onClose, onSave, salesReps, editingLead }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (editingLead) {
                setFormData({
                    fullName: editingLead.fullName,
                    email: editingLead.email,
                    phone: editingLead.phone,
                    source: editingLead.source,
                    status: editingLead.status,
                    assignedRepId: editingLead.assignedRepId,
                    nextFollowUpDate: editingLead.nextFollowUpDate,
                    notes: editingLead.notes,
                });
            } else {
                setFormData({ ...initialFormData, assignedRepId: salesReps[0]?.id || '' });
            }
        }
    }, [editingLead, isOpen, salesReps]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, phone: value }));
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form id="lead-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4 bg-gray-50 dark:bg-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name*"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <Select
                            label="Assign To*"
                            id="assignedRepId"
                            name="assignedRepId"
                            value={formData.assignedRepId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a Sales Rep</option>
                            {salesReps.map(rep => <option key={rep.id} value={rep.id}>{rep.fullName}</option>)}
                        </Select>
                        <EmailInput
                            label="Email Address"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={(val) => setFormData(prev => ({...prev, email: val}))}
                        />
                        <PhoneInput
                            label="Phone Number*"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                        />
                        <Select
                            label="Lead Source"
                            id="source"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                        >
                            <option>WhatsApp</option><option>Facebook</option><option>Referral</option><option>Outreach</option><option>Other</option>
                        </Select>
                        <Input
                            label="Next Follow-up Date"
                            type="date"
                            id="nextFollowUpDate"
                            name="nextFollowUpDate"
                            value={formData.nextFollowUpDate}
                            onChange={handleChange}
                        />
                         {editingLead && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Status</label>
                                <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-800 dark:text-white">{formData.status}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Last Conversation</label>
                        <textarea
                            name="notes"
                            id="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                    </div>
                </form>
                <div className="flex justify-end items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="lead-form">
                        {editingLead ? 'Save Changes' : 'Add Lead'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LeadForm;
