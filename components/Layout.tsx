import React, { useState, useRef, useMemo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Staff, PermissionSet, CompanySettings } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ToastNotification } from './ui/ToastNotification';
import { useSystemNotifications } from '../hooks/useSystemNotifications';

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

    const { headerNotifications, unreadMailsCount } = useSystemNotifications(user, internalMails);

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