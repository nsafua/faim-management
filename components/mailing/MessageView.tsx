import React from 'react';
import { InternalMail, Staff } from '../../types';
import { ArrowLeftIcon, TrashIcon, PaperClipIcon, ArrowDownTrayIcon, EnvelopeIcon } from '../icons/DummyIcons';

interface MessageViewProps {
    selectedMessage: InternalMail | null;
    setSelectedMessage: (msg: InternalMail | null) => void;
    handleDeleteMessage: (id: string) => void;
    staff: Staff[];
}

export const MessageView: React.FC<MessageViewProps> = ({
    selectedMessage,
    setSelectedMessage,
    handleDeleteMessage,
    staff
}) => {
    return (
        <div className={`flex-grow flex-col bg-white dark:bg-gray-800 ${selectedMessage ? 'flex' : 'hidden md:flex'}`}>
            {selectedMessage ? (
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 text-gray-500"><ArrowLeftIcon className="w-5 h-5" /></button>
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                {selectedMessage.senderName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{selectedMessage.senderName}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleDeleteMessage(selectedMessage.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="p-8 flex-grow overflow-y-auto">
                        <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-3">{selectedMessage.subject}</h2>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-gray-400 uppercase w-8">To:</span> 
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold">{selectedMessage.recipientIds.map(id => staff.find(s => s.id === id)?.fullName).join(', ')}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="prose prose-sm max-w-none dark:prose-invert text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.body}
                        </div>

                        {selectedMessage.attachments.length > 0 && (
                            <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                                    <PaperClipIcon className="w-4 h-4" /> Attached Files ({selectedMessage.attachments.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {selectedMessage.attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 flex items-center justify-center text-blue-600 font-black text-[10px]">
                                                    {file.type.split('/')[1]?.toUpperCase() || 'FIL'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                                                    <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <a href={file.url} download className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 text-center opacity-30">
                    <EnvelopeIcon className="w-24 h-24 mb-4" />
                    <p className="text-xl font-bold">Secure Mail Workspace</p>
                    <p className="text-sm max-w-xs">Select a conversation from the left to read its contents or create a new message.</p>
                </div>
            )}
        </div>
    );
};
