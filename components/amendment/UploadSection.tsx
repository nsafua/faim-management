
import React, { ChangeEvent } from 'react';
import { Card } from '../ui/Card';
import { CheckCircleIcon, UploadIcon } from '../../components/icons/DummyIcons';

interface UploadSectionProps {
    scannedFormPreview: string | null;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ scannedFormPreview, onFileChange, error }) => {
    return (
        <Card title="Upload Filled Form">
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please upload a scanned PDF or image of the physically signed amendment form. This is mandatory.</p>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-1 text-center">
                    {scannedFormPreview ? <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" /> : <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="scanned-form-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span className="px-2">{scannedFormPreview ? 'Change File' : 'Upload a file'}</span>
                            <input id="scanned-form-upload" name="scannedForm" type="file" className="sr-only" onChange={onFileChange} accept="image/*,application/pdf" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{scannedFormPreview ? 'File ready for submission.' : 'PDF, PNG, JPG up to 10MB'}</p>
                </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </Card>
    );
};
