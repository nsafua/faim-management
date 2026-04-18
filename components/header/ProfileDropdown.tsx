import React, { useRef, useEffect } from 'react';
import { ArrowRightOnRectangleIcon } from '../icons/DummyIcons';
import { Staff } from '../../types';

interface ProfileDropdownProps {
    currentStaff: Staff;
    staffRole: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setActivePage: (page: string, context?: any) => void;
    onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
    currentStaff, 
    staffRole, 
    isOpen, 
    setIsOpen, 
    setActivePage, 
    onLogout 
}) => {
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className="relative" ref={profileRef}>
             <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 cursor-pointer">
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
             {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { setActivePage('Settings'); setIsOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                       <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};
