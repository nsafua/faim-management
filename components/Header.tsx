
import React, { useState } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { MagnifyingGlassIcon, EnvelopeIcon } from './icons/DummyIcons';
import { Staff } from '../types';
import { ROLES } from '../data/mockData';
import ThemeSelector from './ThemeSelector';
import { NotificationDropdown } from './header/NotificationDropdown';
import { ProfileDropdown } from './header/ProfileDropdown';

export interface HeaderNotification {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'mail' | 'alert';
    targetPage: string;
    targetContext?: any;
}

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onDesktopToggle: () => void;
  isDesktopCollapsed: boolean;
  currentStaff: Staff;
  onLogout: () => void;
  setActivePage: (page: string, context?: any) => void;
  notifications?: HeaderNotification[];
  unreadMailsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ 
    onMobileMenuToggle, 
    onDesktopToggle, 
    isDesktopCollapsed, 
    currentStaff, 
    onLogout, 
    setActivePage,
    notifications = [],
    unreadMailsCount = 0
}) => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);

  const staffRole = ROLES.find(r => r.id === currentStaff.roleId)?.name || 'Staff';

  const handleNotificationClick = (n: HeaderNotification) => {
      setActivePage(n.targetPage, n.targetContext);
      setNotifOpen(false);
  };

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-200">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <button
          onClick={onDesktopToggle}
          className="hidden md:block text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
          aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="hidden md:block relative">
           <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
        </div>
      </div>

      {/* Right side icons and profile */}
      <div className="flex items-center gap-4">
        {/* Compact Utility Cluster */}
        <div className="flex items-center gap-1">
            {/* Multi-Theme Selector Dropdown */}
            <ThemeSelector />
            
            {/* Internal Mail Icon */}
            <button 
                onClick={() => setActivePage('Mailing')}
                title="Mail"
                className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group ${unreadMailsCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
                <EnvelopeIcon className="w-6 h-6" />
                {unreadMailsCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-[9px] text-white items-center justify-center font-bold">
                            {unreadMailsCount > 99 ? '99+' : unreadMailsCount}
                        </span>
                    </span>
                )}
            </button>
            
            <NotificationDropdown 
                notifications={notifications} 
                isOpen={isNotifOpen} 
                setIsOpen={setNotifOpen} 
                handleNotificationClick={handleNotificationClick} 
                setActivePage={setActivePage} 
            />
        </div>

        <ProfileDropdown 
            currentStaff={currentStaff} 
            staffRole={staffRole} 
            isOpen={isProfileOpen} 
            setIsOpen={setProfileOpen} 
            setActivePage={setActivePage} 
            onLogout={onLogout} 
        />
      </div>
    </header>
  );
};

export default Header;
