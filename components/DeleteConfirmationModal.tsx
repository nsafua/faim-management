
import React from 'react';
import { TrashIcon } from './icons/DummyIcons';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType?: string;
    message?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemName, 
    itemType = "item",
    message 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 transform scale-100 transition-transform">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Delete {itemType}?</h3>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
                    {message || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
                </p>
                <div className="flex justify-center gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
