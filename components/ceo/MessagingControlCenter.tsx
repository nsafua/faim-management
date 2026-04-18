import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
    fetchMessagingStats 
} from '../../services/messagingDbService';
import { 
    ChatBubbleLeftEllipsisIcon, 
    ExclamationTriangleIcon, 
    ArrowTrendingUpIcon,
    ShieldCheckIcon
} from '../icons/DummyIcons';

export const MessagingControlCenter: React.FC = () => {
    const [stats, setStats] = useState({ sentToday: 0, failures: 0 });

    useEffect(() => {
        fetchMessagingStats().then(setStats);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase">Messaging Control Center</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Governance & Communication Oversight</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-600 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Messages Dispatched Today</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.sentToday}</h3>
                        <Badge variant="success">Online</Badge>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-red-600 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Failures</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-black text-red-600">{stats.failures}</h3>
                        <div className="text-[10px] font-bold text-red-400 uppercase">Attention Required</div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-indigo-600 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Category</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Payment Alerts</h3>
                        <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                </Card>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900 flex items-start gap-4">
                <ShieldCheckIcon className="w-6 h-6 text-amber-600 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Executive Privacy Protocols</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        All manual overrides of client opt-outs are logged and visible in the system audit trail. 
                        Mass messaging campaigns exceeding 100 recipients require explicit CEO approval.
                    </p>
                </div>
            </div>
        </div>
    );
};
