import React from 'react';
import { ExclamationTriangleIcon } from '../icons/DummyIcons';

interface ErrorSummaryProps {
    validationErrors: string[];
    globalError: string | null;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ validationErrors, globalError }) => {
    return (
        <>
            {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded flex gap-3 animate-in slide-in-from-top-1">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-black text-red-800 dark:text-red-300 uppercase tracking-tight">Missing Required Fields</p>
                        <ul className="mt-1 list-disc list-inside text-xs text-red-700 dark:text-red-400 font-medium">
                            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                </div>
            )}

            {globalError && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 rounded flex items-center gap-3 animate-pulse">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800 dark:text-red-200 font-bold">{globalError}</p>
                </div>
            )}
        </>
    );
};
