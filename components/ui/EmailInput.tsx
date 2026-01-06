
import React, { ChangeEvent, useState, useEffect } from 'react';

interface EmailInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    error?: string;
    id?: string;
    name?: string;
    disabled?: boolean;
    className?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({ value, onChange, label, required, error: propError, id, name, disabled, className }) => {
    const [localError, setLocalError] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        
        // Instant feedback validation (optional, can also rely on propError)
        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            setLocalError('Invalid format (e.g. example@example.com)');
        } else {
            setLocalError('');
        }
    };

    // Sync with prop error if provided, otherwise use local logic
    const displayError = propError || (value && localError ? localError : '');

    return (
        <div className={`w-full ${className}`}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>}
            <input
                type="email"
                name={name}
                id={id}
                disabled={disabled}
                className={`block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${displayError ? 'border-red-500' : ''}`}
                placeholder="example@example.com"
                value={value}
                onChange={handleChange}
            />
            {displayError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{displayError}</p>}
        </div>
    );
};
