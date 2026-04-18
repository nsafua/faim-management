
import React, { ChangeEvent } from 'react';
import { UploadIcon } from '../../components/icons/DummyIcons';

interface FileUploadFieldProps {
    id: string;
    label: string;
    file: File | null | undefined;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    accept: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({ id, label, file, onChange, accept }) => (
    <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor={id} className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id={id} name={id} type="file" className="sr-only" onChange={onChange} accept={accept} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">{file ? file.name : "PDF, PNG, JPG up to 10MB"}</p>
            </div>
        </div>
    </div>
);
