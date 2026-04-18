import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
    MegaphoneIcon, 
    PlusCircleIcon, 
    ClockIcon, 
    UserCircleIcon,
    XMarkIcon,
    PaperClipIcon,
    ArrowDownTrayIcon
} from '../../components/icons/DummyIcons';
import { useAuth } from '../../context/AuthContext';
import { useActivityLogs, useRoles } from '../../hooks/useAppData';
import { uploadFile } from '../../services/storageService';

interface Announcement {
    id: string;
    title: string;
    body: string;
    author: string;
    date: string;
    attachmentUrl?: string;
    readBy: string[];
}

const AnnouncementsPage: React.FC = () => {
    const { currentStaff } = useAuth();
    const { roles } = useRoles();
    const { addActivityLog } = useActivityLogs();

    const [announcements, setAnnouncements] = useState<Announcement[]>([
        {
            id: 'ann-1',
            title: 'New Client Referral Bonus Program',
            body: 'Effective immediately, staff members are entitled to a 5% bonus on all successful land sale referrals. Documentation is attached.',
            author: 'Araba CEO',
            date: new Date(Date.now() - 86400000).toISOString(),
            attachmentUrl: '#',
            readBy: []
        }
    ]);

    const [isModalOpen, setModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const userRole = roles.find(r => r.id === currentStaff?.roleId)?.name;
    const canPost = userRole === 'CEO' || userRole === 'Administrator';

    const sortedAnnouncements = useMemo(() => 
        [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    , [announcements]);

    const handleMarkAsRead = (id: string) => {
        if (!currentStaff) return;
        setAnnouncements(prev => prev.map(a => {
            if (a.id === id && !a.readBy.includes(currentStaff.id)) {
                return { ...a, readBy: [...a.readBy, currentStaff.id] };
            }
            return a;
        }));
    };

    const handleCreateAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            let fileUrl = '';
            if (pendingFile) {
                fileUrl = await uploadFile(pendingFile, `announcements/${Date.now()}_${pendingFile.name}`);
            }

            const newAnn: Announcement = {
                id: `ANN-${Date.now()}`,
                title: formData.get('title') as string,
                body: formData.get('body') as string,
                author: currentStaff?.fullName || 'Management',
                date: new Date().toISOString(),
                attachmentUrl: fileUrl,
                readBy: [currentStaff?.id || '']
            };

            setAnnouncements(prev => [newAnn, ...prev]);
            if (currentStaff) {
                addActivityLog('Create', `Posted announcement: ${newAnn.title}`, currentStaff.id);
            }
            setModalOpen(false);
            setPendingFile(null);
        } catch (error) {
            alert('Failed to post announcement.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Internal Announcements</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Official company notices and team updates.</p>
                </div>
                {canPost && (
                    <button 
                      onClick={() => setModalOpen(true)} 
                      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Post Announcement
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {sortedAnnouncements.length === 0 ? (
                    <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 opacity-40">
                        <MegaphoneIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                        <p className="text-xl font-bold text-gray-400">No active announcements</p>
                    </div>
                ) : (
                    sortedAnnouncements.map(ann => {
                        const isUnread = !ann.readBy.includes(currentStaff?.id || '');
                        return (
                            <Card 
                                key={ann.id} 
                                onMouseEnter={() => isUnread && handleMarkAsRead(ann.id)}
                                className={`transition-all ${isUnread ? 'ring-2 ring-blue-600/50 shadow-lg' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {isUnread && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />}
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tighter">{ann.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><UserCircleIcon className="w-3 h-3 text-blue-500" /> {ann.author}</span>
                                            <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-blue-500" /> {new Date(ann.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Badge variant={isUnread ? 'info' : 'neutral'}>{isUnread ? 'NEW' : 'READ'}</Badge>
                                </div>
                                <div className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6 leading-relaxed">
                                    {ann.body}
                                </div>
                                {ann.attachmentUrl && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <a 
                                            href={ann.attachmentUrl} 
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <PaperClipIcon className="w-4 h-4" /> View Attachment <ArrowDownTrayIcon className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 z-[100] flex justify-center items-center p-4 backdrop-blur-md">
                    {/* MODIFIED OUTER CONTAINER: Constrained height relative to viewport to enable scroll */}
                    <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl border border-indigo-500/30 flex flex-col max-h-[90vh]">
                        <form onSubmit={handleCreateAnnouncement} className="flex flex-col h-full overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center shrink-0">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">New Company Notice</h3>
                                <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            
                            {/* MODIFIED INNER CONTAINER: Enable vertical scroll while keeping header/footer static */}
                            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-grow bg-white dark:bg-gray-800">
                                <Input label="Announcement Title*" name="title" required placeholder="e.g. Policy Update regarding Plot Allocations" />
                                <Textarea label="Message Body*" name="body" required rows={10} placeholder="Type your announcement content here..." />
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Optional Attachment</label>
                                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors">
                                        <PaperClipIcon className="w-6 h-6 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-500">{pendingFile ? pendingFile.name : 'Select file (PDF/IMG)'}</span>
                                        <input type="file" className="sr-only" onChange={e => setPendingFile(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                                <Button type="submit" isLoading={isSaving} icon={<MegaphoneIcon className="w-5 h-5" />}>Post to Board</Button>
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

export default AnnouncementsPage;