import React, { useState } from 'react';
import { AppNotification, RescheduleDetails } from '../types';
import { BellIcon, CheckCircleIcon } from './icons/DummyIcons';
import { NotificationItem } from './notifications/NotificationItem';
import { RescheduleModal } from './notifications/RescheduleModal';

interface NotificationCenterProps {
    notifications: AppNotification[];
    currentRole: string;
    onReschedule: (notificationId: string, details: RescheduleDetails) => void;
    onMarkRead: (notificationId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
    notifications, 
    currentRole, 
    onReschedule, 
    onMarkRead 
}) => {
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);

    const filteredNotifications = notifications.filter(n => n.recipientRole === currentRole);

    const handleRescheduleSubmit = (date: string, reason: string) => {
        if (reschedulingId) {
            onReschedule(reschedulingId, {
                newDate: date,
                reason: reason,
                rescheduledBy: currentRole,
                timestamp: new Date().toISOString()
            });
            setReschedulingId(null);
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                    <BellIcon className="w-6 h-6 text-blue-600" />
                    Notification Audit Trail
                </h3>
            </div>

            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin">
                {filteredNotifications.map(notification => (
                    <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        onMarkRead={onMarkRead} 
                        onReschedule={setReschedulingId} 
                    />
                ))}

                {filteredNotifications.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-800" />
                        <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No Alerts Flagged</p>
                    </div>
                )}
            </div>

            {reschedulingId && (
                <RescheduleModal 
                    onSubmit={handleRescheduleSubmit} 
                    onCancel={() => setReschedulingId(null)} 
                />
            )}

            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};