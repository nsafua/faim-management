import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff } from '../types';
import { persistActivityLog } from '../services/dbService';
import { auth, db } from '../services/firebase';
// @ts-ignore
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { normalizeEmail } from '../services/authService';

interface AuthContextType {
    currentStaff: Staff | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    updateCurrentUser: (updates: Partial<Staff>) => void;
    isAuthenticated: boolean;
    loading: boolean;
    sessionStatus: 'idle' | 'authenticating' | 'resolving_profile' | 'bootstrapping' | 'ready' | 'error';
    authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<'idle' | 'authenticating' | 'resolving_profile' | 'bootstrapping' | 'ready' | 'error'>('idle');
    const [authError, setAuthError] = useState<string | null>(null);

    // Step 2: Profile Resolution (Soft Gate)
    const resolveUserProfile = async (firebaseUser: any) => {
        try {
            setSessionStatus('resolving_profile');
            const userRef = doc(db, "user", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data() as Staff;
                
                // SYNC FIX: Update lastLogin in Firestore to track activity
                const now = new Date().toISOString();
                try {
                    await updateDoc(userRef, { lastLogin: now });
                } catch (e) {
                    console.warn("Could not update lastLogin timestamp", e);
                }

                setCurrentStaff({ ...userData, lastLogin: now });
                setSessionStatus('ready');
            } else {
                // ENFORCEMENT: Self-creation (Bootstrap) is disabled.
                // Accounts must be pre-created by an Administrator/CEO.
                console.error("Profile Resolution Error: User document not found.");
                setAuthError("Access Denied: Your account profile is missing. Please contact the System Administrator.");
                setSessionStatus('error');
            }
        } catch (error: any) {
            console.error("Profile Resolution Error:", error);
            setAuthError(`Authorization Error: ${error.message}`);
            setSessionStatus('error');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
            if (firebaseUser) {
                await resolveUserProfile(firebaseUser);
            } else {
                setCurrentStaff(null);
                setSessionStatus('idle');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setAuthError(null);
        setSessionStatus('authenticating');
        try {
            const normalizedEmail = normalizeEmail(email);
            // Step 1: Authentication Phase (Hard Identity Gate)
            await signInWithEmailAndPassword(auth, normalizedEmail, password);
            return { success: true, message: 'Identity verified. Resolving session...' };
        } catch (error: any) {
            let message = 'Access denied. Please check your credentials.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Incorrect email or password.';
            } else if (error.code === 'auth/network-request-failed') {
                message = 'Connection error. Please check your internet.';
            }
            
            setAuthError(message);
            setSessionStatus('error');
            return { success: false, message };
        }
    };

    const logout = async () => {
        if (currentStaff) {
            try {
                // Sourced directly from dbService to avoid circular hook dependency
                await persistActivityLog({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    type: 'Logout',
                    description: `User ${currentStaff.fullName} ended session.`,
                    userId: currentStaff.id
                });
            } catch (e) {
                console.warn("Logout activity logging failed", e);
            }
        }
        setSessionStatus('idle');
        setAuthError(null);
        await signOut(auth);
        setCurrentStaff(null);
    };

    const updateCurrentUser = (updates: Partial<Staff>) => {
        if (currentStaff) {
            setCurrentStaff({ ...currentStaff, ...updates });
        }
    };

    return (
        <AuthContext.Provider value={{
            currentStaff,
            login,
            logout,
            updateCurrentUser,
            isAuthenticated: !!auth.currentUser,
            loading,
            sessionStatus,
            authError
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