import React, { useState, useMemo } from 'react';
import { 
    MagnifyingGlassIcon, 
    TrashIcon, 
    InboxArrowDownIcon, 
    PaperAirplaneIcon, 
    EnvelopeIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    PlusCircleIcon,
    XMarkIcon
} from '../components/icons/DummyIcons';
import { Button } from '../components/ui/Button';
import { useStaff, useActivityLogs } from '../hooks/useAppData';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { uploadFile } from '../services/storageService';
import { InternalMail } from '../types';

interface InternalMailingPageProps {}

const InternalMailingPage: React.FC<InternalMailingPageProps> = () => {
    const { staff } = useStaff();
    const { currentStaff } = useAuth();
    const { addActivityLog } = useActivityLogs();
    const { internalMails, sendMail, markMailAsRead, deleteMail, restoreMail, permanentDeleteMail } = useData();

    // State
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<InternalMail | null>(null);
    const [isSending, setIsSending] = useState(false);

    // Form State (Compose)
    const [composeData, setComposeData] = useState({ toIds: [] as string[], ccIds: [] as string[], subject: '', body: '' });
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const filteredMessages = useMemo(() => {
        if (!currentStaff) return [];
        return internalMails.filter(m => {
            const isRelated = activeTab === 'inbox' 
                ? (m.recipientIds.includes(currentStaff.id) && !m.isDeleted)
                : (m.senderId === currentStaff.id && !m.isDeleted);
            
            // Note: Trash handling logic could be added here if 'trash' tab existed
            // Currently using 'isDeleted' to hide from main views.

            if (!isRelated) return false;

            const search = searchTerm.toLowerCase();
            return m.subject.toLowerCase().includes(search) || 
                   m.senderName.toLowerCase().includes(search) ||
                   m.body.toLowerCase().includes(search);
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [internalMails, activeTab, currentStaff, searchTerm]);

    const unreadCount = useMemo(() => {
        if (!currentStaff) return 0;
        return internalMails.filter(m => 
            m.recipientIds.includes(currentStaff.id) && !m.readBy.includes(currentStaff.id) && !m.isDeleted
        ).length;
    }, [internalMails, currentStaff]);

    const handleSelectMessage = (msg: InternalMail) => {
        setSelectedMessage(msg);
        if (currentStaff && !msg.readBy.includes(currentStaff.id)) {
            markMailAsRead(msg.id);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (composeData.toIds.length === 0 || !composeData.subject.trim() || !currentStaff) return;

        setIsSending(true);
        try {
            // Process Attachments
            const attachmentData = await Promise.all(
                pendingFiles.map(async (file) => {
                    const url = await uploadFile(file, `internal_mail/att/${Date.now()}_${file.name}`);
                    return { name: file.name, url, type: file.type, size: file.size };
                })
            );

            await sendMail({
                senderId: currentStaff.id,
                senderName: currentStaff.fullName,
                recipientIds: composeData.toIds,
                groupIds: [], // Group expansion happens in UI before send in this simplified version
                subject: composeData.subject,
                body: composeData.body,
                attachments: attachmentData,
                timestamp: new Date().toISOString(),
                readBy: [currentStaff.id],
                isDraft: false,
                isDeleted: false
            });

            addActivityLog('Create', `Sent internal message: "${composeData.subject}"`, currentStaff.id);
            
            // Reset
            setComposeData({ toIds: [], ccIds: [], subject: '', body: '' });
            setPendingFiles([]);
            setActiveTab('sent');
        } catch (error) {
            console.error("Failed to send mail", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (window.confirm("Move this message to trash?")) {
            await deleteMail(id);
            setSelectedMessage(null);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <EnvelopeIcon className="w-8 h-8 text-blue-600" /> Mailing
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Professional Internal Communication System</p>
                </div>
                {activeTab !== 'compose' && (
                    <Button onClick={() => { setActiveTab('compose'); setSelectedMessage(null); }} icon={<PlusCircleIcon className="w-5 h-5" />}>
                        Compose New
                    </Button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-800 p-1 rounded-t-lg">
                <button 
                    onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
                    className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'inbox' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <InboxArrowDownIcon className="w-5 h-5" /> Inbox 
                    {unreadCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{unreadCount}</span>}
                </button>
                <button 
                    onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
                    className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'sent' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" /> Sent Items
                </button>
                <button 
                    onClick={() => { setActiveTab('compose'); setSelectedMessage(null); }}
                    className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'compose' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <PencilSquareIcon className="w-5 h-5" /> Compose
                </button>
            </div>

            <div className="flex-grow flex bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                
                {/* LIST VIEW (Inbox & Sent) */}
                {activeTab !== 'compose' && (
                    <div className={`w-full md:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search mailing list..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto scrollbar-thin flex-grow">
                            {filteredMessages.map(msg => {
                                const isUnread = activeTab === 'inbox' && !msg.readBy.includes(currentStaff?.id || '');
                                return (
                                    <div 
                                        key={msg.id}
                                        onClick={() => handleSelectMessage(msg)}
                                        className={`p-4 border-b border-gray-100 dark:border-gray-700/50 cursor-pointer transition-colors hover:bg-white dark:hover:bg-gray-800/50 ${selectedMessage?.id === msg.id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600 shadow-sm' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-black truncate ${isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                                {activeTab === 'inbox' ? msg.senderName : `To: ${msg.recipientIds.length} recipient(s)`}
                                            </span>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`text-sm truncate ${isUnread ? 'font-black text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {msg.subject}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate mt-1">{msg.body.substring(0, 50)}...</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {msg.attachments.length > 0 && <PaperClipIcon className="w-3 h-3 text-gray-400" />}
                                            {isUnread && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredMessages.length === 0 && <div className="p-10 text-center text-gray-400 italic text-sm">No messages found in this view.</div>}
                        </div>
                    </div>
                )}

                {/* CONTENT VIEW (Inbox & Sent) */}
                {activeTab !== 'compose' && (
                    <div className={`flex-grow flex-col bg-white dark:bg-gray-800 ${selectedMessage ? 'flex' : 'hidden md:flex'}`}>
                        {selectedMessage ? (
                            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 text-gray-500"><ArrowLeftIcon className="w-5 h-5" /></button>
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                            {selectedMessage.senderName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{selectedMessage.senderName}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteMessage(selectedMessage.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                <div className="p-8 flex-grow overflow-y-auto">
                                    <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-3">{selectedMessage.subject}</h2>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-bold text-gray-400 uppercase w-8">To:</span> 
                                                <span className="text-gray-700 dark:text-gray-300 font-semibold">{selectedMessage.recipientIds.map(id => staff.find(s => s.id === id)?.fullName).join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="prose prose-sm max-w-none dark:prose-invert text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.body}
                                    </div>

                                    {selectedMessage.attachments.length > 0 && (
                                        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <h4 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                                                <PaperClipIcon className="w-4 h-4" /> Attached Files ({selectedMessage.attachments.length})
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {selectedMessage.attachments.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 transition-colors group">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 flex items-center justify-center text-blue-600 font-black text-[10px]">
                                                                {file.type.split('/')[1]?.toUpperCase() || 'FIL'}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                                                                <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                            </div>
                                                        </div>
                                                        <a href={file.url} download className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 text-center opacity-30">
                                <EnvelopeIcon className="w-24 h-24 mb-4" />
                                <p className="text-xl font-bold">Secure Mail Workspace</p>
                                <p className="text-sm max-w-xs">Select a conversation from the left to read its contents or create a new message.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* COMPOSE VIEW */}
                {activeTab === 'compose' && (
                    <div className="w-full flex flex-col h-full bg-white dark:bg-gray-800 overflow-y-auto p-6 scrollbar-thin">
                        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-gray-800 dark:text-white">Draft Message</h3>
                                <div className="flex gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setActiveTab('inbox')}>Discard</Button>
                                    <Button type="submit" isLoading={isSending} icon={<PaperAirplaneIcon className="w-5 h-5 -rotate-45" />}>Send Message</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1.5">Recipients (To)*</label>
                                    <select 
                                        multiple 
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white min-h-[120px] focus:ring-2 focus:ring-blue-500"
                                        value={composeData.toIds}
                                        onChange={(e) => setComposeData(p => ({ ...p, toIds: Array.from(e.target.selectedOptions).map(o => (o as HTMLOptionElement).value) }))}
                                        required
                                    >
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Hold Ctrl/Cmd to select multiple staff members.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1.5">Subject Line*</label>
                                <input 
                                    type="text" 
                                    value={composeData.subject} 
                                    onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))} 
                                    placeholder="What is this regarding?" 
                                    className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500"
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1.5">Message Body*</label>
                                <textarea 
                                    value={composeData.body} 
                                    onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))} 
                                    rows={10} 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type your internal message here..."
                                    required 
                                />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                <label className="block text-xs font-black text-gray-400 uppercase mb-3">Supporting Documentation</label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {pendingFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black border border-blue-100 dark:border-blue-800">
                                            <span className="truncate max-w-[150px]">{f.name}</span>
                                            <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors"><XMarkIcon className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-100 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <PaperClipIcon className="w-5 h-5 text-indigo-500" />
                                    Attach Files
                                    <input type="file" multiple className="sr-only" onChange={e => e.target.files && setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                                </label>
                                <p className="text-[10px] text-gray-500 mt-2">Maximum file size: 10MB per file.</p>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 5px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </div>
    );
};

export default InternalMailingPage;