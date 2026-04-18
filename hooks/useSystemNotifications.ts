import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { normalizeRole } from '../utils/roleUtils';
import { Staff } from '../types';
import { HeaderNotification } from '../components/Header';

export const useSystemNotifications = (user: Staff | null, internalMails: any[]) => {
    const [workflowAlerts, setWorkflowAlerts] = useState<any[]>([]);

    // Subscribe to Workflow Triggers based on Role
    useEffect(() => {
        if (!user) return;

        const role = normalizeRole(user.roleId);
        
        // Use normalized role identity for listener authorization
        if (role === 'CEO' || role === 'ADMIN' || role === 'CHIEF_ACCOUNTANT') {
            const q = query(collection(db, 'workflow_triggers'), where('status', '==', 'ACTIVE'));
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.debug(`[useSystemNotifications] Workflow Listener received ${alerts.length} ACTIVE alerts.`);
                setWorkflowAlerts(alerts);
            }, (err) => {
                console.warn("[useSystemNotifications] Workflow listener blocked:", err.message);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const headerNotifications = useMemo(() => {
        const aggregated: HeaderNotification[] = [];

        // Map Workflow Triggers to Header Alerts with Schema Fallbacks
        workflowAlerts.forEach(alert => {
            const event = alert.event ?? alert.type ?? 'UNKNOWN_EVENT';
            const clientRef = alert.clientRef ?? '';
            
            // Hardened Timestamp Conversion
            let timestampStr: string;
            if (alert.timestamp?.toDate) {
                timestampStr = alert.timestamp.toDate().toISOString();
            } else if (typeof alert.timestamp === 'string') {
                timestampStr = alert.timestamp;
            } else if (alert.createdAt?.toDate) {
                timestampStr = alert.createdAt.toDate().toISOString();
            } else {
                // Return start of epoch to indicate it's not resolved yet (avoid masking bugs with 'now')
                timestampStr = new Date(0).toISOString();
            }

            aggregated.push({
                id: alert.id,
                title: event === 'CLIENT_CREATED' ? 'New Client Created' : 'Threshold Met (70%)',
                description: `${alert.clientName} (${clientRef}) requires your attention.`,
                timestamp: timestampStr,
                type: 'alert',
                targetPage: event === 'CLIENT_CREATED' ? 'Account Management' : 'Allocate Plot',
                targetContext: { id: Number(alert.clientId) }
            });
        });

        if (user) {
            // Filter Unread Mails
            const myMails = internalMails.filter(m => 
                m.recipientIds.includes(user.id) && 
                !m.readBy.includes(user.id) && 
                !m.isDeleted
            );
            myMails.forEach(mail => {
                aggregated.push({
                    id: mail.id,
                    title: mail.subject,
                    description: mail.body.length > 80 ? `${mail.body.substring(0, 80)}...` : mail.body,
                    timestamp: mail.timestamp,
                    type: 'mail',
                    targetPage: 'Mailing',
                    targetContext: mail
                });
            });
        }

        return aggregated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [workflowAlerts, internalMails, user]);

    const unreadMailsCount = useMemo(() => {
        if (!user) return 0;
        return internalMails.filter(m => 
            m.recipientIds.includes(user.id) && 
            !m.readBy.includes(user.id) && 
            !m.isDeleted &&
            !m.isDraft
        ).length;
    }, [internalMails, user]);

    return { headerNotifications, unreadMailsCount };
};
