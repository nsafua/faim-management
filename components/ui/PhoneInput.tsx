
import React, { useState, useEffect, ChangeEvent } from 'react';

interface PhoneInputProps {
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

const COUNTRY_CODES = [
    { code: '+233', country: 'GH', flag: '🇬🇭' },
    { code: '+234', country: 'NG', flag: '🇳🇬' },
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+228', country: 'TG', flag: '🇹🇬' }, // Togo
    { code: '+225', country: 'CI', flag: '🇨🇮' }, // Cote d'Ivoire
];

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, label, required, error, id, name, disabled, className }) => {
    const [selectedCode, setSelectedCode] = useState('+233');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        // Attempt to parse existing value
        if (value) {
            const foundCode = COUNTRY_CODES.find(c => value.startsWith(c.code));
            if (foundCode) {
                setSelectedCode(foundCode.code);
                setPhoneNumber(value.slice(foundCode.code.length));
            } else {
                // If no code matches, assumes it might be a local legacy number. 
                // Default to GH code logic: if starts with 0, strip it.
                if (value.startsWith('0')) {
                    setPhoneNumber(value.substring(1));
                } else {
                    setPhoneNumber(value);
                }
                setSelectedCode('+233'); // Default
            }
        } else {
            setPhoneNumber('');
            setSelectedCode('+233');
        }
    }, [value]);

    const handleCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setSelectedCode(newCode);
        onChange(`${newCode}${phoneNumber}`);
    };

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
        // Restrict to 9 digits
        const truncated = input.slice(0, 9);
        setPhoneNumber(truncated);
        onChange(`${selectedCode}${truncated}`);
    };

    return (
        <div className={`w-full ${className}`}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>}
            <div className="flex relative rounded-md shadow-sm">
                <select
                    disabled={disabled}
                    value={selectedCode}
                    onChange={handleCodeChange}
                    className="inset-y-0 left-0 flex items-center pl-2 pr-8 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-200 sm:text-sm rounded-l-md focus:ring-blue-500 focus:border-blue-500 border-r-0"
                    style={{ minWidth: '80px' }}
                >
                    {COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                        </option>
                    ))}
                </select>
                <input
                    type="tel"
                    name={name}
                    id={id}
                    disabled={disabled}
                    className={`block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${error ? 'border-red-500' : ''}`}
                    placeholder="xxxxxxxxx"
                    value={phoneNumber}
                    onChange={handleNumberChange}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};
