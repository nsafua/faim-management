
import React, { useState } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { BellIcon, ChatBubbleLeftEllipsisIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons/DummyIcons';
import { Staff, Role } from '../types';
import { ROLES } from '../data/mockData';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onDesktopToggle: () => void;
  isDesktopCollapsed: boolean;
  currentStaff: Staff;
  onLogout: () => void;
  setActivePage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, onDesktopToggle, isDesktopCollapsed, currentStaff, onLogout, setActivePage }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const staffRole = ROLES.find(r => r.id === currentStaff.roleId)?.name || 'Staff';

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
        <ThemeToggle />
        <button className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
        </button>
         <button className="relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
        </button>
        <div className="relative">
             <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 cursor-pointer">
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
             {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 dark:ring-gray-700">
                    <button onClick={() => { setActivePage('Settings'); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
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
