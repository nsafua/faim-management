
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './icons/DummyIcons';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className || ''}`}
            aria-label="Toggle Dark Mode"
        >
            {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white" />
            ) : (
                <SunIcon className="w-5 h-5 text-yellow-500 hover:text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggle;
