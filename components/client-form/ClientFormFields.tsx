
import React, { ChangeEvent } from 'react';
import { CheckCircleIcon } from '../icons/DummyIcons';
import { FormData } from './types';

const getFieldClass = (error?: string): string => {
    const baseClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white";
    return error ? `${baseClass} border-red-500 dark:border-red-600` : `${baseClass} border-gray-300 dark:border-gray-600`;
};

export const SmartInputField: React.FC<{ 
    id: keyof FormData | string; 
    label: string; 
    value: string | number; 
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void; 
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; 
    error?: string; 
    type?: string; 
    required?: boolean; 
    isTouched?: boolean; 
    readOnly?: boolean; 
    placeholder?: string; 
}> = ({ id, label, value, onChange, onBlur, error, type = 'text', required = false, isTouched, readOnly, placeholder }) => (
    <div className="sm:col-span-1 relative">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} name={id} id={id} value={value} onChange={onChange} onBlur={onBlur} required={required} readOnly={readOnly} placeholder={placeholder} className={`${getFieldClass(error)} ${readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''}`} title={error || ''} />
        {isTouched && !error && required && (
            <CheckCircleIcon className="absolute right-3 top-[37px] w-5 h-5 text-green-500 pointer-events-none" />
        )}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
);

export const SmartSelectField: React.FC<{ 
    id: keyof FormData; 
    label: string; 
    value: string; 
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void; 
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void; 
    children: React.ReactNode; 
    error?: string; 
    required?: boolean; 
    isTouched?: boolean; 
    disabled?: boolean; 
}> = ({ id, label, value, onChange, onBlur, children, error, required = false, isTouched, disabled }) => (
     <div className="sm:col-span-1 relative">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}{required && <span className="text-red-500">*</span>}</label>
        <select id={id} name={id} value={value} onChange={onChange} onBlur={onBlur} required={required} disabled={disabled} className={`${getFieldClass(error)} ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`} title={error || ''}>
            {children}
        </select>
        {isTouched && !error && required && (
            <CheckCircleIcon className="absolute right-8 top-[37px] w-5 h-5 text-green-500 pointer-events-none" />
        )}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
);
