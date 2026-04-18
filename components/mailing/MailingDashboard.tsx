
import React from 'react';
import { Card } from '../ui/Card';
import { InternalMail } from '../../types';
import { Staff } from '../../types';

interface MailingDashboardProps {
    stats: {
        unread: number;
        sent: number;
        drafts: number;
        trash: number;
    };
    recentMails: InternalMail[];
    currentStaff: Staff | null;
    onOpenMail: (mail: InternalMail) => void;
}

export const MailingDashboard: React.FC<MailingDashboardProps> = ({ stats, recentMails, currentStaff, onOpenMail }) => {
    return (
        <div className="flex-grow p-8 overflow-y-auto scrollbar-thin space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-4 border-l-4 border-blue-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unread Mails</p>
                    <p className="text-3xl font-black text-blue-600">{stats.unread}</p>
                </Card>
                <Card className="p-4 border-l-4 border-green-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sent</p>
                    <p className="text-3xl font-black text-green-600">{stats.sent}</p>
                </Card>
                <Card className="p-4 border-l-4 border-amber-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Drafts</p>
                    <p className="text-3xl font-black text-amber-600">{stats.drafts}</p>
                </Card>
                <Card className="p-4 border-l-4 border-red-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trash Size</p>
                    <p className="text-3xl font-black text-red-600">{stats.trash}</p>
                </Card>
            </div>

            <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Recent Correspondence</h3>
                <div className="space-y-3">
                    {recentMails.map(m => (
                        <div key={m.id} onClick={() => onOpenMail(m)} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-300 transition-all">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{m.senderName.substring(0,2)}</div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{m.subject}</p>
                                <p className="text-xs text-gray-500">From: {m.senderName} • {new Date(m.timestamp).toLocaleDateString()}</p>
                            </div>
                            {!m.readBy.includes(currentStaff?.id || '') && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
