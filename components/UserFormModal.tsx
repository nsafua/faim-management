import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Staff, Role } from '../types';
import { XIcon } from './icons/XIcon';

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (staffData: Partial<Staff>) => void;
    editingUser: Staff | null;
    roles: Role[];
}

const UserFormModal: React.FC<StaffFormModalProps> = ({ isOpen, onClose, onSave, editingUser, roles }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        roleId: 0,
        password: '',
        status: 'Active' as Staff['status'],
    });

    useEffect(() => {
        if (isOpen) {
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
                    roleId: roles.find(r => r.name === 'Sales Representative')?.id || roles[0]?.id || 0,
                    password: '',
                    status: 'Active',
                });
            }
        }
    }, [isOpen, editingUser, roles]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'roleId' ? Number(value) : value}));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(!editingUser && !formData.password) {
            alert("Password is required for new staff members.");
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold text-gray-800">{editingUser ? 'Edit Staff Account' : 'Create New Staff Account'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name*</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 input-class" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 input-class" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address*</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 input-class" />
                        </div>
                        <div>
                            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Role*</label>
                            <select name="roleId" id="roleId" value={formData.roleId} onChange={handleChange} required className="mt-1 input-class">
                                {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status*</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 input-class">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {editingUser ? 'Reset Password (optional)' : 'Password*'}
                            </label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder={editingUser ? 'Leave blank to keep current password' : ''} className="mt-1 input-class" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                            {editingUser ? 'Save Changes' : 'Create Staff'}
                        </button>
                    </div>
                </form>
                <style>{`.input-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input-class:focus { outline: none; --tw-ring-color: #3B82F6; border-color: #3B82F6; }`}</style>
            </div>
        </div>
    );
};

export default UserFormModal;
