import React, { useState } from 'react';
import { ArchiveBoxIcon } from '../icons/DummyIcons';
import { LoaderIcon } from '../icons/LoaderIcon';

interface ArchivePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    propertyName: string;
}

export const ArchivePropertyModal: React.FC<ArchivePropertyModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    propertyName
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm();
        } finally {
            // isSubmitting isn't explicitly set to false because the modal should be unmounted by onConfirm -> closeModal
            // If the modal remains due to an error, we reset the button
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 transform scale-100 transition-transform">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                    <ArchiveBoxIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Archive Property?</h3>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
                    Are you sure you want to archive <strong>"{propertyName}"</strong>? This will hide it from active listings and plot selections. You can restore it later from the Archive Vault.
                </p>
                <div className="flex justify-center gap-3">
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2 disabled:bg-amber-800 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && <LoaderIcon className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Archiving...' : 'Archive'}
                    </button>
                </div>
            </div>
        </div>
    );
};