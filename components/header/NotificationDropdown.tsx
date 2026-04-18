import React, { useRef, useEffect } from 'react';
import { BellIcon, CheckCircleIcon } from '../icons/DummyIcons';
import { HeaderNotification } from '../Header';

interface NotificationDropdownProps {
    notifications: HeaderNotification[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    handleNotificationClick: (n: HeaderNotification) => void;
    setActivePage: (page: string, context?: any) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
    notifications, 
    isOpen, 
    setIsOpen, 
    handleNotificationClick, 
    setActivePage 
}) => {
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
                className="relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center font-bold">
                            {notifications.length > 9 ? '9+' : notifications.length}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                            {notifications.length} Pending
                        </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <CheckCircleIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">All caught up!</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map((n) => (
                                <button 
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700 last:border-0 flex gap-3 transition-colors group"
                                >
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate w-60">
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                                            {n.description}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                            {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
                            <button 
                                onClick={() => { setActivePage('Account Management'); setIsOpen(false); }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 uppercase tracking-widest"
                            >
                                View All Alerts
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
