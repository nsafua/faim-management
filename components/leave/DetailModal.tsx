
import React from 'react';
import { LeaveRequest, LeaveStatus } from '../../types';
import { 
    XMarkIcon,
    CalendarDaysIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    ClockIcon,
    CheckCircleIcon
} from '../icons/DummyIcons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DetailModalProps {
    request: LeaveRequest | null;
    onClose: () => void;
    isAdmin: boolean;
    onAction: (id: string, status: LeaveStatus) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ request, onClose, isAdmin, onAction }) => {
    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">Leave Request Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-6 bg-white dark:bg-gray-800 overflow-y-auto scrollbar-thin max-h-[70vh]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                            {request.employeeName.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-black text-gray-900 dark:text-white leading-tight">{request.employeeName}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Application {request.id}</p>
                        </div>
                        <div className="ml-auto">
                            <Badge variant={request.status === 'Approved' ? 'success' : request.status === 'Rejected' ? 'danger' : 'warning'}>
                                {request.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Leave Type</p>
                            <p className="text-sm font-semibold">{request.type}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                            <p className="text-sm font-semibold">{request.days} Working Days</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Period</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                                <CalendarDaysIcon className="w-4 h-4" /> {request.startDate} <span className="text-gray-300">→</span> {request.endDate}
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reason Statement</p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md italic">
                            "{request.reason}"
                        </div>
                    </div>

                    {request.attachmentUrl && (
                        <a 
                            href={request.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <PaperClipIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Supporting Attachment</span>
                            </div>
                            <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
                        </a>
                    )}

                    {request.processedDate && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <ClockIcon className="w-3 h-3" /> Processed on {request.processedDate} by {request.processedBy}
                        </div>
                    )}
                </div>

                {isAdmin && request.status === 'Pending' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                        <Button 
                            variant="danger" 
                            className="flex-1" 
                            icon={<XMarkIcon className="w-4 h-4" />}
                            onClick={() => onAction(request.id, 'Rejected')}
                        >
                            Reject
                        </Button>
                        <Button 
                            variant="success" 
                            className="flex-1" 
                            icon={<CheckCircleIcon className="w-4 h-4" />}
                            onClick={() => onAction(request.id, 'Approved')}
                        >
                            Approve
                        </Button>
                    </div>
                )}
            </Card>
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};
