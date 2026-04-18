import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './Sidebar';
import Header, { HeaderNotification } from './Header';
import { Staff, PermissionSet, CompanySettings } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ToastNotification } from './ui/ToastNotification';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { normalizeRole } from '../utils/roleUtils';

interface LayoutProps {
    children: React.ReactNode;
    activePage: string;
    setActivePage: (page: string, context?: any) => void;
    currentStaff: Staff;
    onLogout: () => void;
    staffPermissions: { [key: string]: PermissionSet };
    companySettings: CompanySettings;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, currentStaff, onLogout, staffPermissions, companySettings }) => {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
    
    const { internalMails } = useData();
    const { currentStaff: user } = useAuth();

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
                console.debug(`[Layout] Workflow Listener received ${alerts.length} ACTIVE alerts.`);
                setWorkflowAlerts(alerts);
            }, (err) => {
                console.warn("[Layout] Workflow listener blocked:", err.message);
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

        // Filter Unread Mails
        const myMails = internalMails.filter(m => 
            m.recipientIds.includes(currentStaff.id) && 
            !m.readBy.includes(currentStaff.id) && 
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

        return aggregated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [workflowAlerts, internalMails, currentStaff]);

    const unreadMailsCount = useMemo(() => {
        if (!currentStaff) return 0;
        return internalMails.filter(m => 
            m.recipientIds.includes(currentStaff.id) && 
            !m.readBy.includes(currentStaff.id) && 
            !m.isDeleted &&
            !m.isDraft
        ).length;
    }, [internalMails, currentStaff]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 transition-colors duration-200 no-transition">
            <Sidebar 
                isMobileOpen={isMobileSidebarOpen} 
                onMobileClose={() => setMobileSidebarOpen(false)}
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                activePage={activePage}
                setActivePage={setActivePage}
                staffPermissions={staffPermissions}
                companySettings={companySettings}
                onLogout={onLogout}
            />

            <div className="flex flex-col flex-1 overflow-hidden relative">
                <Header 
                    onMobileMenuToggle={() => setMobileSidebarOpen(true)}
                    onDesktopToggle={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                    isDesktopCollapsed={isDesktopSidebarCollapsed}
                    currentStaff={currentStaff}
                    onLogout={onLogout}
                    setActivePage={setActivePage}
                    notifications={headerNotifications}
                    unreadMailsCount={unreadMailsCount}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
                    <div className="max-w-7xl mx-auto animate-entry">
                        {children}
                    </div>
                </main>
            </div>
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #1e293b; }
            `}</style>
        </div>
    );
};

export default Layout;