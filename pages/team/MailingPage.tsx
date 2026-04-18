import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { PlusCircleIcon, EnvelopeIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons/DummyIcons';
import { useStaff, useActivityLogs, useRoles } from '../../hooks/useAppData';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { InternalMail } from '../../types';

// Modular components
import { MailingSidebar, MailFolder } from '../../components/mailing/MailingSidebar';
import { MailingDashboard } from '../../components/mailing/MailingDashboard';
import { MailList } from '../../components/mailing/MailList';
import { MailDetail } from '../../components/mailing/MailDetail';
import { ComposeModal, ComposeInitialData } from '../../components/mailing/ComposeModal';

interface MailingPageProps {
    initialCompose?: ComposeInitialData;
}

const MailingPage: React.FC<MailingPageProps> = ({ initialCompose }) => {
    const { staff } = useStaff();
    const { roles } = useRoles();
    const { currentStaff } = useAuth();
    const { addActivityLog } = useActivityLogs();
    const { internalMails, sendMail, markMailAsRead, deleteMail, restoreMail, permanentDeleteMail } = useData();

    // UI State
    const [activeFolder, setActiveFolder] = useState<MailFolder>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMail, setSelectedMail] = useState<InternalMail | null>(null);
    const [isComposeOpen, setComposeOpen] = useState(false);
    const [isMobileListOpen, setMobileListOpen] = useState(true);
    const [composeInitialData, setComposeInitialData] = useState<ComposeInitialData | undefined>(initialCompose);

    // Effect to handle initial compose data on mount
    useEffect(() => {
        if (initialCompose) {
            setComposeInitialData(initialCompose);
            setComposeOpen(true);
        }
    }, [initialCompose]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFolder, searchTerm]);

    // Filter Mails based on active folder and current user
    const allFilteredMails = useMemo(() => {
        if (!currentStaff) return [];
        return internalMails.filter(m => {
            // Basic relation check
            const isSender = m.senderId === currentStaff.id;
            const isRecipient = m.recipientIds.includes(currentStaff.id);
            const isParticipant = isSender || isRecipient;

            if (!isParticipant) return false;

            // Search filter
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                if (!m.subject.toLowerCase().includes(search) && !m.senderName.toLowerCase().includes(search)) {
                    return false;
                }
            }

            // Folder Logic
            if (activeFolder === 'trash') {
                return m.isDeleted;
            }

            if (m.isDeleted) return false;

            switch (activeFolder) {
                case 'inbox': return isRecipient;
                case 'sent': return isSender;
                case 'drafts': return isSender && m.isDraft;
                default: return true;
            }
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [internalMails, activeFolder, currentStaff, searchTerm]);

    // Apply Pagination
    const paginatedMails = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allFilteredMails.slice(startIndex, startIndex + itemsPerPage);
    }, [allFilteredMails, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(allFilteredMails.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    const stats = useMemo(() => {
        if (!currentStaff) return { unread: 0, sent: 0, drafts: 0, trash: 0 };
        return {
            unread: internalMails.filter(m => m.recipientIds.includes(currentStaff.id) && !m.readBy.includes(currentStaff.id) && !m.isDeleted && !m.isDraft).length,
            sent: internalMails.filter(m => m.senderId === currentStaff.id && !m.isDraft && !m.isDeleted).length,
            drafts: internalMails.filter(m => m.senderId === currentStaff.id && m.isDraft && !m.isDeleted).length,
            trash: internalMails.filter(m => m.isDeleted && (m.senderId === currentStaff.id || m.recipientIds.includes(currentStaff.id))).length
        };
    }, [internalMails, currentStaff]);

    // Actions
    const handleOpenMail = (mail: InternalMail) => {
        setSelectedMail(mail);
        setMobileListOpen(false);
        if (currentStaff && !mail.readBy.includes(currentStaff.id)) {
            markMailAsRead(mail.id);
        }
    };

    const handleSend = async (mailData: any) => {
        if (!currentStaff) return;
        
        try {
            await sendMail({
                senderId: currentStaff.id,
                senderName: currentStaff.fullName,
                recipientIds: mailData.recipientIds,
                groupIds: mailData.groupIds,
                subject: mailData.subject,
                body: mailData.body,
                attachments: mailData.attachments,
                timestamp: new Date().toISOString(),
                readBy: [currentStaff.id],
                isDraft: false,
                isDeleted: false
            });

            addActivityLog('Create', `Sent internal mail: ${mailData.subject}`, currentStaff.id);
            setComposeOpen(false);
            setComposeInitialData(undefined);
            setActiveFolder('sent');
        } catch (error) {
            console.error("Failed to send mail:", error);
            alert("Failed to send message. Please try again.");
        }
    };

    const handleReply = (type: 'reply' | 'replyAll') => {
        if (!selectedMail || !currentStaff) return;

        let recipients = [selectedMail.senderId];
        if (type === 'replyAll') {
            // Add original recipients, exclude self
            const others = selectedMail.recipientIds.filter(id => id !== currentStaff.id);
            recipients = [...recipients, ...others];
            // Remove duplicates
            recipients = Array.from(new Set(recipients));
        }

        const quote = `\n\n\n--------------------------------\nOn ${new Date(selectedMail.timestamp).toLocaleString()}, ${selectedMail.senderName} wrote:\n\n${selectedMail.body}`;

        setComposeInitialData({
            recipientIds: recipients,
            subject: selectedMail.subject.startsWith('Re:') ? selectedMail.subject : `Re: ${selectedMail.subject}`,
            body: quote
        });
        setComposeOpen(true);
    };

    const handleAction = async (id: string, action: 'delete' | 'restore' | 'permanent') => {
        try {
            if (action === 'delete') {
                await deleteMail(id);
                if (selectedMail?.id === id) setSelectedMail(null);
            } else if (action === 'restore') {
                await restoreMail(id);
                if (selectedMail?.id === id) setSelectedMail(null);
            } else if (action === 'permanent') {
                if (window.confirm('Delete permanently? This cannot be undone.')) {
                    await permanentDeleteMail(id);
                    if (selectedMail?.id === id) setSelectedMail(null);
                }
            }
        } catch (error) {
            console.error("Mail action failed:", error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Internal Mailing</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Secure communication within the organization.</p>
                </div>
                <Button onClick={() => { setComposeInitialData(undefined); setComposeOpen(true); }} icon={<PlusCircleIcon className="w-5 h-5" />}>
                    Compose Mail
                </Button>
            </div>

            <div className="flex-grow flex bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <MailingSidebar 
                    activeFolder={activeFolder} 
                    onFolderSelect={(folder) => { setActiveFolder(folder); setSelectedMail(null); setMobileListOpen(true); }} 
                    stats={stats}
                />

                {activeFolder === 'dashboard' ? (
                    <MailingDashboard 
                        stats={stats} 
                        recentMails={internalMails.filter(m => m.recipientIds.includes(currentStaff?.id || '') && !m.isDeleted).slice(0, 5)} 
                        currentStaff={currentStaff} 
                        onOpenMail={(m) => { setActiveFolder('inbox'); handleOpenMail(m); }}
                    />
                ) : (
                    <>
                        <div className={`w-full md:w-96 flex flex-col ${!isMobileListOpen ? 'hidden md:flex' : 'flex'} border-r border-gray-200 dark:border-gray-700`}>
                            <MailList 
                                mails={paginatedMails}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                activeFolder={activeFolder}
                                selectedMailId={selectedMail?.id}
                                onSelectMail={handleOpenMail}
                                currentStaff={currentStaff}
                            />
                            {/* Pagination Controls */}
                            {allFilteredMails.length > 0 && (
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span>Rows:</span>
                                        <select 
                                            value={itemsPerPage} 
                                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={30}>30</option>
                                            <option value={40}>40</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, allFilteredMails.length)} of {allFilteredMails.length}</span>
                                        <button 
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 transition-colors"
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 transition-colors"
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`flex-grow flex flex-col bg-white dark:bg-gray-800 ${isMobileListOpen ? 'hidden md:flex' : 'flex'}`}>
                            {selectedMail ? (
                                <MailDetail 
                                    mail={selectedMail}
                                    activeFolder={activeFolder}
                                    onBack={() => setMobileListOpen(true)}
                                    onAction={handleAction}
                                    onReply={handleReply}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 p-10 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
                                        <EnvelopeIcon className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="text-lg font-black uppercase tracking-tighter">Workspace Idle</p>
                                    <p className="text-xs max-w-xs mt-1">Select a message from the list to begin reading or manage your folder.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ComposeModal 
                isOpen={isComposeOpen}
                onClose={() => { setComposeOpen(false); setComposeInitialData(undefined); }}
                staff={staff}
                roles={roles}
                onSend={handleSend}
                initialData={composeInitialData}
            />

            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </div>
    );
};

export default MailingPage;
