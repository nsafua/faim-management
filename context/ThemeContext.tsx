
import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'white' | 'blue' | 'dark';

interface ThemeContextType {
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<AppTheme>(() => {
        const stored = localStorage.getItem('faim_app_theme') as AppTheme;
        return (stored === 'white' || stored === 'blue' || stored === 'dark') ? stored : 'white';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove all theme classes first
        root.classList.remove('dark', 'theme-white', 'theme-blue', 'theme-dark');
        
        // Apply specific theme class
        root.classList.add(`theme-${theme}`);
        
        // Dark mode compatibility for tailwind dark: utility
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        
        localStorage.setItem('faim_app_theme', theme);

        // Inject dynamic styles for the "Blue" theme to override defaults without refactoring components
        let styleTag = document.getElementById('theme-blue-overrides');
        if (theme === 'blue') {
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'theme-blue-overrides';
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = `
                .theme-blue body { background-color: #f0f7ff !important; }
                .theme-blue aside { background-color: #1e3a8a !important; }
                .theme-blue header { background-color: #ffffff !important; border-bottom-color: #dbeafe !important; }
                .theme-blue .bg-white { background-color: #ffffff !important; }
                .theme-blue .bg-gray-100 { background-color: #f0f7ff !important; }
                .theme-blue .text-blue-600 { color: #1d4ed8 !important; }
                .theme-blue .border-gray-200 { border-color: #e0e7ff !important; }
            `;
        } else if (styleTag) {
            styleTag.remove();
        }

    }, [theme]);

    const setTheme = (newTheme: AppTheme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
