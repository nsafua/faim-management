import React, { useState } from 'react';
import { AppNotification, RescheduleDetails } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { Badge } from './ui/Badge';
import { 
    BellIcon, 
    ClockIcon, 
    ExclamationTriangleIcon, 
    CalendarDaysIcon,
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ArrowTrendingUpIcon
} from './icons/DummyIcons';

interface NotificationCenterProps {
    notifications: AppNotification[];
    currentRole: string;
    onReschedule: (notificationId: string, details: RescheduleDetails) => void;
    onMarkRead: (notificationId: string) => void;
}

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

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
    notifications, 
    currentRole, 
    onReschedule, 
    onMarkRead 
}) => {
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);
    const [rescheduleForm, setRescheduleForm] = useState({ date: '', reason: '' });

    const filteredNotifications = notifications.filter(n => n.recipientRole === currentRole);

    const handleRescheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reschedulingId) {
            onReschedule(reschedulingId, {
                newDate: rescheduleForm.date,
                reason: rescheduleForm.reason,
                rescheduledBy: currentRole,
                timestamp: new Date().toISOString()
            });
            setReschedulingId(null);
            setRescheduleForm({ date: '', reason: '' });
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
                {filteredNotifications.map(notification => {
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

                                {/* RESCHEDULE AUDIT PANEL */}
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
                                        onClick={() => setReschedulingId(notification.id)}
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
                })}

                {filteredNotifications.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-800" />
                        <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No Alerts Flagged</p>
                    </div>
                )}
            </div>

            {/* Reschedule Modal - Immutable post-submission */}
            {reschedulingId && (
                <div className="fixed inset-0 bg-black/80 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-sm p-0 overflow-hidden shadow-2xl border border-indigo-500/30">
                        <form onSubmit={handleRescheduleSubmit}>
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Reschedule Protocol</h3>
                                <button type="button" onClick={() => setReschedulingId(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 rounded flex gap-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-[10px] text-amber-800 dark:text-amber-400 font-bold leading-relaxed uppercase">
                                        Alert: This action is permanent and will be logged in the system audit trail.
                                    </p>
                                </div>
                                <Input 
                                    label="New Follow-up Commitment Date" 
                                    type="date" 
                                    value={rescheduleForm.date}
                                    onChange={e => setRescheduleForm({...rescheduleForm, date: e.target.value})}
                                    required 
                                    className="font-bold"
                                />
                                <Textarea 
                                    label="Justification for Delay" 
                                    value={rescheduleForm.reason}
                                    onChange={e => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                                    placeholder="Provide business justification..."
                                    required 
                                    rows={4}
                                />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                <Button type="button" variant="secondary" className="flex-1 uppercase font-black text-[10px]" onClick={() => setReschedulingId(null)}>Abort</Button>
                                <Button type="submit" className="flex-1 uppercase font-black text-[10px]">Commit Change</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};