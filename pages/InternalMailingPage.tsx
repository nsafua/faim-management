import React, { useState } from 'react';
import { 
    EnvelopeIcon,
    InboxArrowDownIcon, 
    PaperAirplaneIcon, 
    PencilSquareIcon,
    PlusCircleIcon
} from '../components/icons/DummyIcons';
import { Button } from '../components/ui/Button';
import { useStaff, useActivityLogs } from '../hooks/useAppData';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { uploadFile } from '../services/storageService';
import { InternalMail } from '../types';
import { useMailingFilters } from '../hooks/useMailingFilters';
import { MailingList } from '../components/mailing/MailingList';
import { MessageView } from '../components/mailing/MessageView';
import { ComposeModal } from '../components/mailing/ComposeModal';

interface InternalMailingPageProps {}

const InternalMailingPage: React.FC<InternalMailingPageProps> = () => {
    const { staff } = useStaff();
    const { currentStaff } = useAuth();
    const { addActivityLog } = useActivityLogs();
    const { internalMails, sendMail, markMailAsRead, deleteMail } = useData();

    // State
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<InternalMail | null>(null);
    const [isSending, setIsSending] = useState(false);

    const { filteredMessages, unreadCount } = useMailingFilters(internalMails, currentStaff, activeTab, searchTerm);

    const handleSelectMessage = (msg: InternalMail) => {
        setSelectedMessage(msg);
        if (currentStaff && !msg.readBy.includes(currentStaff.id)) {
            markMailAsRead(msg.id);
        }
    };

    const handleSendMessage = async (composeData: any, pendingFiles: File[]) => {
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
                    <MailingList 
                        filteredMessages={filteredMessages}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        activeTab={activeTab}
                        selectedMessage={selectedMessage}
                        currentStaff={currentStaff}
                        handleSelectMessage={handleSelectMessage}
                    />
                )}

                {/* CONTENT VIEW (Inbox & Sent) */}
                {activeTab !== 'compose' && (
                    <MessageView 
                        selectedMessage={selectedMessage}
                        setSelectedMessage={setSelectedMessage}
                        handleDeleteMessage={handleDeleteMessage}
                        staff={staff}
                    />
                )}

                {/* COMPOSE VIEW */}
                {activeTab === 'compose' && (
                    <ComposeModal 
                        staff={staff}
                        isSending={isSending}
                        setActiveTab={setActiveTab}
                        handleSendMessage={handleSendMessage}
                    />
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