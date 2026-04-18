
import React, { useState, useRef, useEffect } from 'react';
import { useTheme, AppTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, CheckCircleIcon } from './icons/DummyIcons';

interface ThemeSelectorProps {
    className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Swatch Icon for Theme Trigger
    const SwatchIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.85 2.85 0 114.03 4.03l-9.37 9.37a2.85 2.85 0 01-4.03 0l-9.37-9.37a2.85 2.85 0 014.03-4.03l9.37 9.37zm0 0l4.03-4.03m-4.03 4.03l4.03 4.03" />
        </svg>
    );

    const BlueThemeIcon = () => (
        <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400" />
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const themes: { id: AppTheme, label: string, icon: React.ReactNode }[] = [
        { id: 'white', label: 'White (Default)', icon: <SunIcon className="w-5 h-5 text-amber-500" /> },
        { id: 'blue', label: 'Blue Theme', icon: <BlueThemeIcon /> },
        { id: 'dark', label: 'Dark / Black', icon: <MoonIcon className="w-5 h-5 text-indigo-400" /> },
    ];

    const handleSelect = (id: AppTheme) => {
        setTheme(id);
        setIsOpen(false);
        // Dispatch custom event for a simple toast notification if needed or just use alert
        console.log(`Theme changed to ${id}`);
    };

    return (
        <div className={`relative ${className || ''}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Change Theme"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors focus:outline-none"
            >
                <SwatchIcon />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-[60] border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Appearance</p>
                    </div>
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleSelect(t.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${theme === t.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                {t.icon}
                                <span className={`text-sm font-bold ${theme === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {t.label}
                                </span>
                            </div>
                            {theme === t.id && (
                                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
