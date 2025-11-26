import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Lead, Staff } from '../types';
import { XIcon } from './icons/XIcon';

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
    assignedRepId: 0,
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
                setFormData({ ...initialFormData, assignedRepId: salesReps[0]?.id || 0 });
            }
        }
    }, [editingLead, isOpen, salesReps]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'assignedRepId' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // FIX: Pass the entire formData object to onSave, as it matches the expected type.
        // The previous implementation incorrectly removed the required 'status' property.
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true">
            <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form id="lead-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name*</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 input-class" />
                        </div>
                         <div>
                            <label htmlFor="assignedRepId" className="block text-sm font-medium text-gray-700">Assign To*</label>
                            <select name="assignedRepId" id="assignedRepId" value={formData.assignedRepId} onChange={handleChange} required className="mt-1 input-class">
                                <option value={0} disabled>Select a Sales Rep</option>
                                {salesReps.map(rep => <option key={rep.id} value={rep.id}>{rep.fullName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 input-class" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number*</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 input-class" />
                        </div>
                        <div>
                            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Lead Source</label>
                            <select name="source" id="source" value={formData.source} onChange={handleChange} className="mt-1 input-class">
                                <option>WhatsApp</option><option>Facebook</option><option>Referral</option><option>Outreach</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="nextFollowUpDate" className="block text-sm font-medium text-gray-700">Next Follow-up Date</label>
                            <input type="date" name="nextFollowUpDate" id="nextFollowUpDate" value={formData.nextFollowUpDate} onChange={handleChange} className="mt-1 input-class" />
                        </div>
                         {editingLead && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                                <p className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-800">{formData.status}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes / Last Conversation</label>
                        <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 input-class"></textarea>
                    </div>
                </form>
                <div className="flex justify-end items-center p-5 border-t bg-white rounded-b-lg gap-4">
                    <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
                    <button type="submit" form="lead-form" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                        {editingLead ? 'Save Changes' : 'Add Lead'}
                    </button>
                </div>
                <style>{`.input-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input-class:focus { outline: none; --tw-ring-color: #3B82F6; border-color: #3B82F6; }`}</style>
            </div>
        </div>
    );
};

export default LeadForm;