
import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
    CalendarDaysIcon, 
    PlusCircleIcon, 
    XMarkIcon
} from '../../components/icons/DummyIcons';
import { useAuth } from '../../context/AuthContext';
import { useActivityLogs, useRoles } from '../../hooks/useAppData';

// Modular Imports
import { EventCard, InternalEvent } from '../../components/team/EventCard';

const EventsPage: React.FC = () => {
    const { currentStaff } = useAuth();
    const { roles } = useRoles();
    const { addActivityLog } = useActivityLogs();

    const [events, setEvents] = useState<InternalEvent[]>([
        {
            id: 'evt-1',
            title: 'Q4 Strategy Meeting',
            dateTime: '2024-12-01T10:00',
            location: 'Conference Room A',
            description: 'Discussing goals and budgets for the upcoming year.',
            createdBy: 'Araba CEO',
            rsvps: { '1': 'Yes' }
        }
    ]);

    const [isModalOpen, setModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const userRole = roles.find(r => r.id === currentStaff?.roleId)?.name;
    const canCreate = userRole === 'CEO' || userRole === 'Administrator';

    const { upcoming, past } = useMemo(() => {
        const now = new Date();
        const sorted = [...events].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        return {
            upcoming: sorted.filter(e => new Date(e.dateTime) >= now),
            past: sorted.filter(e => new Date(e.dateTime) < now).reverse()
        };
    }, [events]);

    const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        const newEvent: InternalEvent = {
            id: `EVT-${Date.now()}`,
            title: formData.get('title') as string,
            dateTime: formData.get('dateTime') as string,
            location: formData.get('location') as string,
            description: formData.get('description') as string,
            createdBy: currentStaff?.fullName || 'System',
            rsvps: {}
        };

        setEvents(prev => [...prev, newEvent]);
        if (currentStaff) {
            addActivityLog('Create', `Created internal event: ${newEvent.title}`, currentStaff.id);
        }
        // Save and Exit Workflow
        setModalOpen(false);
        setIsSaving(false);
    };

    const handleRSVP = (eventId: string, status: 'Yes' | 'No') => {
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                return { ...e, rsvps: { ...e.rsvps, [currentStaff?.id || '']: status } };
            }
            return e;
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Company Events</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Calendar coordination and team gatherings.</p>
                </div>
                {canCreate && (
                    <button 
                      onClick={() => setModalOpen(true)} 
                      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Create Event
                    </button>
                )}
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4" /> Upcoming Events
                    </h2>
                    {upcoming.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl opacity-40">
                            <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-bold text-gray-400">No upcoming events scheduled</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {upcoming.map(e => (
                                <EventCard 
                                    key={e.id} 
                                    event={e} 
                                    currentStaffId={currentStaff?.id}
                                    onRSVP={handleRSVP}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {past.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Past Events</h2>
                        <div className="grid gap-4 opacity-70">
                            {past.map(e => (
                                <EventCard 
                                    key={e.id} 
                                    event={e} 
                                    isPast 
                                    currentStaffId={currentStaff?.id}
                                    onRSVP={handleRSVP}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 z-[100] flex justify-center items-center p-4 backdrop-blur-md">
                    <Card className="w-full max-w-xl p-0 overflow-hidden shadow-2xl border border-blue-500/30 flex flex-col max-h-[90vh]">
                        <form id="new-event-form" onSubmit={handleCreateEvent} className="flex flex-col h-full overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">New Company Event</h3>
                                <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            
                            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-grow bg-white dark:bg-gray-800">
                                <Input label="Event Title*" name="title" required placeholder="e.g. End of Year Awards" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input label="Date & Time*" name="dateTime" type="datetime-local" required />
                                    <Input label="Location" name="location" placeholder="e.g. Accra Office Lounge" />
                                </div>
                                <Textarea label="Event Description" name="description" rows={6} placeholder="What should attendees know?" />
                                
                                <div className="pt-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visibility</p>
                                    <Badge variant="info">Internal Staff Only</Badge>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0">
                                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                                <Button type="submit" form="new-event-form" isLoading={isSaving}>Save and Exit</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};

export default EventsPage;
