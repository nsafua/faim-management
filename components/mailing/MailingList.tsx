import React from 'react';
import { MagnifyingGlassIcon, PaperClipIcon } from '../icons/DummyIcons';
import { InternalMail, Staff } from '../../types';

interface MailingListProps {
    filteredMessages: InternalMail[];
    searchTerm: string;
    setSearchTerm: (t: string) => void;
    activeTab: 'inbox' | 'sent' | 'compose';
    selectedMessage: InternalMail | null;
    currentStaff: Staff | null;
    handleSelectMessage: (msg: InternalMail) => void;
}

export const MailingList: React.FC<MailingListProps> = ({
    filteredMessages,
    searchTerm,
    setSearchTerm,
    activeTab,
    selectedMessage,
    currentStaff,
    handleSelectMessage
}) => {
    return (
        <div className={`w-full md:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search mailing list..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                </div>
            </div>
            <div className="overflow-y-auto scrollbar-thin flex-grow">
                {filteredMessages.map(msg => {
                    const isUnread = activeTab === 'inbox' && !msg.readBy.includes(currentStaff?.id || '');
                    return (
                        <div 
                            key={msg.id}
                            onClick={() => handleSelectMessage(msg)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700/50 cursor-pointer transition-colors hover:bg-white dark:hover:bg-gray-800/50 ${selectedMessage?.id === msg.id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600 shadow-sm' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-black truncate ${isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                    {activeTab === 'inbox' ? msg.senderName : `To: ${msg.recipientIds.length} recipient(s)`}
                                </span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(msg.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className={`text-sm truncate ${isUnread ? 'font-black text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {msg.subject}
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">{msg.body.substring(0, 50)}...</div>
                            <div className="flex items-center gap-2 mt-2">
                                {msg.attachments.length > 0 && <PaperClipIcon className="w-3 h-3 text-gray-400" />}
                                {isUnread && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                            </div>
                        </div>
                    );
                })}
                {filteredMessages.length === 0 && <div className="p-10 text-center text-gray-400 italic text-sm">No messages found in this view.</div>}
            </div>
        </div>
    );
};
