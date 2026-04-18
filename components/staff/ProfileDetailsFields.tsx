import React, { ChangeEvent } from 'react';
import { Staff, Role } from '../../types';
import { PhoneInput } from '../ui/PhoneInput';

interface ProfileDetailsFieldsProps {
    formData: any;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    roles: Role[];
}

export const ProfileDetailsFields: React.FC<ProfileDetailsFieldsProps> = ({ formData, handleChange, setFormData, roles }) => {
    return (
        <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Profile Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name*</label>
                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 input-class" />
                </div>
                <div>
                    <PhoneInput label="Phone Number" id="phone" name="phone" value={formData.phone} onChange={(val) => setFormData((prev: any) => ({...prev, phone: val}))} />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Status*</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 input-class">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">System Role*</label>
                    <select name="roleId" id="roleId" value={formData.roleId} onChange={handleChange} required className="mt-1 input-class">
                        {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};
