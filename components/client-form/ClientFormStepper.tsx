
import React from 'react';
import { UserGroupIcon, BuildingLibraryIcon, BriefcaseIcon } from '../icons/DummyIcons';

interface ClientFormStepperProps {
    currentStep: number;
}

export const ClientFormStepper: React.FC<ClientFormStepperProps> = ({ currentStep }) => {
    const steps = [
        { name: 'Client Information', icon: <UserGroupIcon className="w-5 h-5" /> },
        { name: 'Acquisition Details', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
        { name: 'Office Details', icon: <BriefcaseIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <nav aria-label="Progress">
                 <ol role="list" className="flex items-center">
                    {steps.map((s, stepIdx) => (
                        <li key={s.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                            {currentStep > stepIdx + 1 ? (
                                <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-blue-600" /></div>
                                <div className="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white">{s.icon}</div>
                                </>
                            ) : currentStep === stepIdx + 1 ? (
                                <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" /></div>
                                <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-blue-600 rounded-full text-blue-600">{s.icon}</div>
                                </>
                            ) : (
                                <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" /></div>
                                <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-400">{s.icon}</div>
                                </>
                            )}
                             <span className="absolute -bottom-6 text-xs font-semibold text-center w-24 -left-8 text-gray-600 dark:text-gray-400">{s.name}</span>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};
