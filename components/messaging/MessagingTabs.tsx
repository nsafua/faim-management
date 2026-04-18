import React from 'react';
import { 
    DocumentTextIcon, 
    PaperAirplaneIcon, 
    ClockIcon, 
    ShieldCheckIcon 
} from '../icons/DummyIcons';

interface MessagingTabsProps {
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const MessagingTabs: React.FC<MessagingTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'templates', name: 'Templates', icon: <DocumentTextIcon className="w-5 h-5" /> },
        { id: 'manual', name: 'Manual Send', icon: <PaperAirplaneIcon className="w-5 h-5 -rotate-45" /> },
        { id: 'history', name: 'History', icon: <ClockIcon className="w-5 h-5" /> },
        { id: 'preferences', name: 'Preferences', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl overflow-hidden px-2">
            {tabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => onTabChange(tab.id)} 
                    className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                    {tab.icon} {tab.name}
                </button>
            ))}
        </div>
    );
};
