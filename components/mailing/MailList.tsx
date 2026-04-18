
import React from 'react';
import { MagnifyingGlassIcon } from '../icons/DummyIcons';
import { InternalMail } from '../../types';
import { MailFolder } from './MailingSidebar';
import { Staff } from '../../types';

interface MailListProps {
    mails: InternalMail[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
    activeFolder: MailFolder;
    selectedMailId?: string;
    onSelectMail: (mail: InternalMail) => void;
    currentStaff: Staff | null;
}

export const MailList: React.FC<MailListProps> = ({ mails, searchTerm, onSearchChange, activeFolder, selectedMailId, onSelectMail, currentStaff }) => {
    return (
        <div className="w-full md:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search in folder..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin">
                {mails.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 italic text-sm">Empty folder.</div>
                ) : (
                    mails.map(mail => {
                        const isUnread = activeFolder === 'inbox' && !mail.readBy.includes(currentStaff?.id || '');
                        return (
                            <div 
                                key={mail.id}
                                onClick={() => onSelectMail(mail)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700/50 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedMailId === mail.id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isUnread ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {activeFolder === 'sent' ? `To: ${mail.recipientIds.length} Recipient(s)` : mail.senderName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(mail.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className={`text-sm truncate ${isUnread ? 'font-black text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {mail.subject}
                                </div>
                                <div className="text-xs text-gray-400 truncate mt-1">{mail.body.substring(0, 50)}...</div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
