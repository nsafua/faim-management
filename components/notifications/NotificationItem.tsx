import React from 'react';
import { AppNotification } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
    ClockIcon, 
    ExclamationTriangleIcon, 
    CalendarDaysIcon,
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ArrowTrendingUpIcon
} from '../icons/DummyIcons';

const getVisualClassification = (type: AppNotification['type']) => {
    switch (type) {
        case 'Escalation':
            return {
                label: 'Escalated',
                variant: 'danger' as const,
                icon: <ExclamationTriangleIcon className="w-4 h-4" />
            };
        case 'Default':
            return {
                label: 'Critical',
                variant: 'danger' as const,
                icon: <XMarkIcon className="w-4 h-4" />
            };
        case 'Reminder':
            return {
                label: 'Reminder',
                variant: 'warning' as const,
                icon: <ClockIcon className="w-4 h-4" />
            };
        case 'Qualification':
        default:
            return {
                label: 'Informational',
                variant: 'info' as const,
                icon: <InformationCircleIcon className="w-4 h-4" />
            };
    }
};

interface NotificationItemProps {
    notification: AppNotification;
    onReschedule: (id: string) => void;
    onMarkRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onReschedule, onMarkRead }) => {
    const classification = getVisualClassification(notification.type);
    const isRescheduled = notification.metadata?.rescheduleHistory && notification.metadata.rescheduleHistory.length > 0;
    
    return (
        <Card key={notification.id} className={`border-l-4 ${
            notification.type === 'Escalation' || notification.type === 'Default' 
            ? 'border-l-red-600' : notification.type === 'Reminder' ? 'border-l-amber-500' : 'border-l-blue-500'
        } p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={classification.variant} className="flex items-center gap-1.5 px-3 py-1 uppercase tracking-widest text-[10px] font-black">
                            {classification.icon}
                            {classification.label}
                        </Badge>
                        <Badge variant="neutral" className="px-3 py-1 uppercase tracking-widest text-[10px] font-black">
                            Target: {notification.recipientRole}
                        </Badge>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Generated On</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                            {new Date(notification.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                        {notification.metadata?.clientName ? `${notification.metadata.clientName}: ` : ''}{notification.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Trigger Reason: <span className="font-normal italic">{notification.message}</span>
                    </p>
                </div>

                {isRescheduled && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 space-y-3">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                            Audit Trail: Action Rescheduled
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-black">Original Date</p>
                                <p className="text-xs font-bold line-through text-gray-500">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-indigo-400 uppercase font-black">New Follow-Up Date</p>
                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                    <CalendarDaysIcon className="w-3 h-3" />
                                    {notification.metadata!.rescheduleHistory![0].newDate}
                                </p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Reschedule Rationale</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                "{notification.metadata!.rescheduleHistory![0].reason}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {!notification.isRead && (
                <div className="flex gap-px bg-gray-200 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        disabled={isRescheduled}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                            isRescheduled 
                            ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        onClick={() => onReschedule(notification.id)}
                    >
                        <CalendarDaysIcon className="w-4 h-4" />
                        {isRescheduled ? 'Read-Only (Rescheduled)' : 'Reschedule Action'}
                    </button>
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-xs font-black uppercase tracking-widest"
                        onClick={() => onMarkRead(notification.id)}
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        Acknowledge
                    </button>
                </div>
            )}
        </Card>
    );
};
