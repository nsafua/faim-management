
import React from 'react';

export interface TabItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

interface SettingsTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => !tab.disabled && (
                <button 
                    key={tab.id} 
                    onClick={() => onTabChange(tab.id)} 
                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}
                >
                    {tab.icon} {tab.name}
                </button>
            ))}
        </div>
    );
};
