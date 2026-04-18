import React, { ChangeEvent, useState } from 'react';
import { Badge } from '../ui/Badge';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '../icons/DummyIcons';

interface LoginDetailsFieldsProps {
    formData: any;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
    error: string | null;
}

export const LoginDetailsFields: React.FC<LoginDetailsFieldsProps> = ({ formData, handleChange, setFormData, isEditing, error }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Login Information</h4>
                {isEditing && (
                    <Badge variant="success" className="flex items-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3" /> Password Configured
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Login Email</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="email"
                            value={formData.email}
                            readOnly={isEditing}
                            disabled={isEditing}
                            onChange={(e) => setFormData((prev: any) => ({...prev, email: e.target.value}))}
                            className={`input-class ${isEditing ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed text-gray-500' : ''}`}
                            placeholder="staff@faim.com"
                            required
                        />
                        {isEditing && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-4 w-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                    {isEditing && <p className="mt-1 text-[10px] text-gray-400 italic">Login identifier is managed by system administrators.</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isEditing ? 'Reset Account Password' : 'Initial Password*'}
                    </label>
                    <div className="relative mt-1">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            id="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder={isEditing ? 'Leave blank to keep existing password' : 'Min 6 characters'} 
                            className={`input-class pr-10 font-mono ${error?.includes("Password") ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
