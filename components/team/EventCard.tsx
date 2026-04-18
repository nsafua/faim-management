
import React from 'react';
import { Card } from '../ui/Card';
import { 
    MapPinIcon, 
    ClockIcon, 
    XMarkIcon,
    CheckCircleIcon,
    UserCircleIcon
} from '../icons/DummyIcons';

export interface InternalEvent {
    id: string;
    title: string;
    dateTime: string;
    location: string;
    description: string;
    createdBy: string;
    rsvps: Record<string, 'Yes' | 'No'>;
}

interface EventCardProps {
    event: InternalEvent;
    isPast?: boolean;
    currentStaffId?: string;
    onRSVP: (eventId: string, status: 'Yes' | 'No') => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isPast, currentStaffId, onRSVP }) => (
    <Card className={`overflow-hidden border-l-4 ${isPast ? 'border-l-gray-400 grayscale' : 'border-l-blue-600 shadow-md'}`}>
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-3">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{event.title}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4 text-blue-500" /> {new Date(event.dateTime).toLocaleString()}</span>
                    <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4 text-blue-500" /> {event.location}</span>
                    <span className="flex items-center gap-1.5"><UserCircleIcon className="w-4 h-4 text-blue-500" /> Host: {event.createdBy}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{event.description}</p>
            </div>
            {!isPast && (
                <div className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 min-w-[120px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Going?</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onRSVP(event.id, 'Yes')}
                            className={`p-2 rounded-lg transition-all ${event.rsvps[currentStaffId || ''] === 'Yes' ? 'bg-green-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 hover:border-green-500'}`}
                        >
                            <CheckCircleIcon className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => onRSVP(event.id, 'No')}
                            className={`p-2 rounded-lg transition-all ${event.rsvps[currentStaffId || ''] === 'No' ? 'bg-red-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 hover:border-red-500'}`}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </Card>
);
