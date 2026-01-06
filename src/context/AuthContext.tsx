
import React, { createContext, useContext, useState } from 'react';
import { Staff } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
    currentStaff: Staff | null;
    login: (email: string, password: string) => { success: boolean; message: string };
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { staff, addActivityLog } = useData();
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

    const login = (email: string, password: string) => {
        const user = staff.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentStaff(user);
            addActivityLog('Login', `User ${user.fullName} logged in.`, user.id);
            return { success: true, message: 'Login successful' };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const logout = () => {
        if (currentStaff) {
            addActivityLog('Logout', `User ${currentStaff.fullName} logged out.`, currentStaff.id);
        }
        setCurrentStaff(null);
    };

    return (
        <AuthContext.Provider value={{
            currentStaff,
            login,
            logout,
            isAuthenticated: !!currentStaff
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
