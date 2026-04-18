
import React from 'react';
import { ChartBarIcon, InboxArrowDownIcon, PaperAirplaneIcon, DocumentDuplicateIcon, TrashIcon } from '../icons/DummyIcons';

export type MailFolder = 'dashboard' | 'inbox' | 'sent' | 'drafts' | 'trash';

interface MailingSidebarProps {
    activeFolder: MailFolder;
    onFolderSelect: (folder: MailFolder) => void;
    stats: {
        unread: number;
        drafts: number;
    };
}

export const MailingSidebar: React.FC<MailingSidebarProps> = ({ activeFolder, onFolderSelect, stats }) => {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
        { id: 'inbox', label: 'Inbox', icon: <InboxArrowDownIcon className="w-5 h-5" />, badge: stats.unread },
        { id: 'sent', label: 'Sent', icon: <PaperAirplaneIcon className="w-5 h-5 -rotate-45" /> },
        { id: 'drafts', label: 'Drafts', icon: <DocumentDuplicateIcon className="w-5 h-5" />, badge: stats.drafts },
        { id: 'trash', label: 'Trash', icon: <TrashIcon className="w-5 h-5" /> }
    ];

    return (
        <div className="w-16 md:w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50 shrink-0">
            <nav className="p-3 space-y-1">
                {items.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => onFolderSelect(item.id as MailFolder)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg font-bold transition-all ${activeFolder === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon}
                            <span className="hidden md:block text-sm uppercase tracking-wider">{item.label}</span>
                        </div>
                        {item.badge ? (
                            <span className={`hidden md:block px-2 py-0.5 text-[10px] rounded-full ${activeFolder === item.id ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                                {item.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </nav>
        </div>
    );
};
