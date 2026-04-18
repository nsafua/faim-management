
import React from 'react';
import { ArrowLeftIcon, TrashIcon, ClockIcon, PaperClipIcon, ArrowDownTrayIcon, UserGroupIcon } from '../icons/DummyIcons';
import { InternalMail } from '../../types';
import { MailFolder } from './MailingSidebar';
import { Button } from '../ui/Button';

interface MailDetailProps {
    mail: InternalMail | null;
    activeFolder: MailFolder;
    onBack: () => void;
    onAction: (id: string, action: 'delete' | 'restore' | 'permanent') => void;
    onReply: (type: 'reply' | 'replyAll') => void;
}

export const MailDetail: React.FC<MailDetailProps> = ({ mail, activeFolder, onBack, onAction, onReply }) => {
    if (!mail) return null;

    return (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"><ArrowLeftIcon className="w-5 h-5" /></button>
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase">{mail.senderName.substring(0,2)}</div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{mail.senderName}</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{new Date(mail.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {activeFolder !== 'trash' && (
                        <>
                            <Button onClick={() => onReply('reply')} variant="secondary" size="sm" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                                Reply
                            </Button>
                            <Button onClick={() => onReply('replyAll')} variant="secondary" size="sm" icon={<UserGroupIcon className="w-4 h-4" />}>
                                Reply to All
                            </Button>
                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        </>
                    )}
                    {activeFolder === 'trash' ? (
                        <>
                            <button onClick={() => onAction(mail.id, 'restore')} className="p-2 text-gray-400 hover:text-green-500" title="Restore"><ClockIcon className="w-5 h-5" /></button>
                            <button onClick={() => onAction(mail.id, 'permanent')} className="p-2 text-gray-400 hover:text-red-600" title="Delete Permanently"><TrashIcon className="w-5 h-5" /></button>
                        </>
                    ) : (
                        <button onClick={() => onAction(mail.id, 'delete')} className="p-2 text-gray-400 hover:text-red-500" title="Move to Trash"><TrashIcon className="w-5 h-5" /></button>
                    )}
                </div>
            </div>
            <div className="p-8 overflow-y-auto scrollbar-thin flex-grow">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter border-b border-gray-100 dark:border-gray-700 pb-4">{mail.subject}</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {mail.body}
                </div>
                {mail.attachments.length > 0 && (
                    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Internal Attachments</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mail.attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl group transition-all hover:border-blue-400">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <PaperClipIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                                            <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <a href={file.url} download className="p-2 text-gray-400 hover:text-blue-600"><ArrowDownTrayIcon className="w-4 h-4" /></a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
