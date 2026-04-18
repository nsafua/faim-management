
import React, { ChangeEvent } from 'react';

interface AmendmentTextAreaProps {
    label: string;
    id: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
    rows?: number;
    name?: string;
}

export const AmendmentTextArea: React.FC<AmendmentTextAreaProps> = ({ label, id, value, onChange, required, rows = 3, name }) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <textarea
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
);
