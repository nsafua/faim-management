import { useMemo } from 'react';
import { InternalMail, Staff } from '../types';

export const useMailingFilters = (
    internalMails: InternalMail[],
    currentStaff: Staff | null,
    activeTab: 'inbox' | 'sent' | 'compose',
    searchTerm: string
) => {
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

    return { filteredMessages, unreadCount };
};
