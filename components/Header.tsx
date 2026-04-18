
import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { BellIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon, EnvelopeIcon, CheckCircleIcon } from './icons/DummyIcons';
import { Staff } from '../types';
import { ROLES } from '../data/mockData';
import ThemeSelector from './ThemeSelector';

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
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const staffRole = ROLES.find(r => r.id === currentStaff.roleId)?.name || 'Staff';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setNotifOpen(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setProfileOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setNotifOpen(!isNotifOpen)}
                    title="Notifications"
                    className="relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <BellIcon className="w-6 h-6" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center font-bold">
                                {notifications.length > 9 ? '9+' : notifications.length}
                            </span>
                        </span>
                    )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                                {notifications.length} Pending
                            </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto scrollbar-thin">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center">
                                    <CheckCircleIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">All caught up!</p>
                                </div>
                            ) : (
                                notifications.slice(0, 5).map((n) => (
                                    <button 
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700 last:border-0 flex gap-3 transition-colors group"
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate w-60">
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                                                {n.description}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                                {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
                                <button 
                                    onClick={() => { setActivePage('Account Management'); setNotifOpen(false); }}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 uppercase tracking-widest"
                                >
                                    View All Alerts
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
             <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer">
                 {currentStaff.photo ? (
                    <img src={currentStaff.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border-2 border-transparent">
                        {currentStaff.initials}
                    </div>
                 )}
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{currentStaff.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{staffRole}</p>
                </div>
            </button>
             {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { setActivePage('Settings'); setProfileOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                       <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
