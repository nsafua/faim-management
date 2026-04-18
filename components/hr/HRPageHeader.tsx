
import React from 'react';
import { ArrowLeftIcon, BriefcaseIcon } from '../icons/DummyIcons';

interface HRPageHeaderProps {
    onBack: () => void;
}

export const HRPageHeader: React.FC<HRPageHeaderProps> = ({ onBack }) => {
    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
            </button>
            <div className="flex items-center gap-4">
                    <BriefcaseIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Human Resources</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage staff employment details and official documents.</p>
                </div>
            </div>
        </div>
    );
};
