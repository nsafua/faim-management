import React, { useState } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { BellIcon, ChatBubbleLeftEllipsisIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons/DummyIcons';
import { Staff, Role } from '../types';
import { ROLES } from '../data/mockData';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  currentStaff: Staff;
  onLogout: () => void;
  setActivePage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, currentStaff, onLogout, setActivePage }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const staffRole = ROLES.find(r => r.id === currentStaff.roleId)?.name || 'Staff';

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-gray-500 hover:text-gray-800"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="hidden md:block relative">
           <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 border border-transparent rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
        </div>
      </div>

      {/* Right side icons and profile */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
        </button>
         <button className="relative text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="relative">
             <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 cursor-pointer">
                 {currentStaff.photo ? (
                    <img src={currentStaff.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {currentStaff.initials}
                    </div>
                 )}
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{currentStaff.fullName}</p>
                    <p className="text-xs text-gray-500">{staffRole}</p>
                </div>
            </button>
             {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <button onClick={() => { setActivePage('Settings'); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
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