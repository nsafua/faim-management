
import React from 'react';
import { CheckCircleIcon, XMarkIcon } from '../../components/icons/DummyIcons';

interface ActionFeedback {
    type: 'success' | 'error';
    message: string;
}

interface SettingsHeaderProps {
    title: string;
    actionFeedback: ActionFeedback | null;
    onClearFeedback: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, actionFeedback, onClearFeedback }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
            {actionFeedback && (
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border animate-in fade-in slide-in-from-top-4 duration-300 ${actionFeedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                    {actionFeedback.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                    <span className="text-sm font-bold">{actionFeedback.message}</span>
                    <button onClick={onClearFeedback} className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                        <XMarkIcon className="w-4 h-4 opacity-50" />
                    </button>
                </div>
            )}
        </div>
    );
};
