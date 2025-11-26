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
        <div className="flex h-screen bg-gray-100">
            <Sidebar 
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
// FIX: Renamed prop to 'isDesktopCollapsed' to match the Sidebar component's props interface.
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                onDesktopToggle={() => setDesktopSidebarCollapsed(prev => !prev)}
                activePage={activePage}
                setActivePage={setActivePage}
                staffPermissions={staffPermissions}
                companySettings={companySettings}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onMobileMenuToggle={() => setMobileSidebarOpen(true)}
                    currentStaff={currentStaff}
                    onLogout={onLogout}
                    setActivePage={setActivePage}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;