
import React, { useEffect, useState } from 'react';
import { EnvelopeIcon, XMarkIcon } from '../icons/DummyIcons';

interface ToastNotificationProps {
    message: string;
    subtext?: string;
    onClose: () => void;
    duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, subtext, onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-4 right-4 z-[100] max-w-sm w-full bg-white dark:bg-gray-800 border-l-4 border-blue-600 rounded shadow-2xl p-4 transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{message}</p>
                    {subtext && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">{subtext}</p>}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
