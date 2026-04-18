
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Staff, Role } from '../types';
import { XIcon } from './icons/XIcon';
import { ExclamationTriangleIcon } from './icons/DummyIcons';
import { LoaderIcon } from './icons/LoaderIcon';
import { ProfileDetailsFields } from './staff/ProfileDetailsFields';
import { LoginDetailsFields } from './staff/LoginDetailsFields';

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (staffData: Partial<Staff>) => Promise<void>;
    editingUser: Staff | null;
    roles: Role[];
}

const UserFormModal: React.FC<StaffFormModalProps> = ({ isOpen, onClose, onSave, editingUser, roles }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        roleId: '',
        password: '',
        status: 'Active' as Staff['status'],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (editingUser) {
                setFormData({
                    fullName: editingUser.fullName,
                    phone: editingUser.phone || '',
                    email: editingUser.email,
                    roleId: editingUser.roleId,
                    password: '',
                    status: editingUser.status,
                });
            } else {
                setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    roleId: roles.find(r => r.name === 'Sales Representative')?.id || roles[0]?.id || '',
                    password: '',
                    status: 'Active',
                });
            }
        }
    }, [isOpen, editingUser, roles]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Security Validation
        if(!editingUser && (!formData.password || formData.password.length < 6)) {
            setError("Security Requirement: Password must be at least 6 characters long.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "An unexpected system error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {editingUser ? 'Edit Staff Account' : 'Create New Staff Account'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
                            </div>
                        )}

                        <ProfileDetailsFields 
                            formData={formData} 
                            handleChange={handleChange} 
                            setFormData={setFormData} 
                            roles={roles} 
                        />

                        <LoginDetailsFields 
                            formData={formData} 
                            handleChange={handleChange} 
                            setFormData={setFormData} 
                            isEditing={!!editingUser} 
                            error={error} 
                        />
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            type="button" 
                            disabled={isSaving}
                            onClick={onClose} 
                            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-2.5 px-5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-blue-600 text-white font-black uppercase tracking-widest py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving && <LoaderIcon className="w-4 h-4 animate-spin" />}
                            {editingUser ? 'Save Changes' : 'Create Account'}
                        </button>
                    </div>
                </form>
                <style>{`
                    .input-class { 
                        display: block; 
                        width: 100%; 
                        padding: 0.625rem 0.75rem; 
                        background-color: white; 
                        border: 1px solid #D1D5DB; 
                        border-radius: 0.5rem; 
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
                        color: #111827; 
                        font-size: 0.875rem;
                        transition: all 0.2s;
                    } 
                    .dark .input-class { 
                        background-color: #0f172a; 
                        border-color: #374151; 
                        color: #ffffff; 
                    } 
                    .input-class:focus { 
                        outline: none; 
                        ring: 2px;
                        border-color: #3B82F6; 
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default UserFormModal;
