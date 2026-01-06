
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Staff, PermissionSet, CompanySettings } from '../types';

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

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
            <Sidebar 
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                activePage={activePage}
                setActivePage={setActivePage}
                staffPermissions={staffPermissions}
                companySettings={companySettings}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onMobileMenuToggle={() => setMobileSidebarOpen(true)}
                    onDesktopToggle={() => setDesktopSidebarCollapsed(prev => !prev)}
                    isDesktopCollapsed={isDesktopSidebarCollapsed}
                    currentStaff={currentStaff}
                    onLogout={onLogout}
                    setActivePage={setActivePage}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-950 transition-colors duration-200 flex flex-col">
                    <div className="container mx-auto px-6 py-8 flex-grow">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
