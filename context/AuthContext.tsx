
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff } from '../types';
import { useActivityLogs } from '../hooks/useAppData';
import { auth, db } from '../services/firebase';
// @ts-ignore
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, limit, setDoc, doc } from 'firebase/firestore';
import { signup } from '../services/authService';

interface AuthContextType {
    currentStaff: Staff | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    updateCurrentUser: (updates: Partial<Staff>) => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_ID_MAP: Record<number, string> = {
    1: 'CEO',
    2: 'Administrator',
    3: 'Front Desk Executive',
    4: 'Chief Accountant',
    5: 'Head of Sales',
    6: 'Sales Representative'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { addActivityLog } = useActivityLogs();
    
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
            if (firebaseUser && firebaseUser.email) {
                try {
                    // Query Firestore 'user' collection directly
                    const q = query(collection(db, "user"), where("email", "==", firebaseUser.email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const userData = userDoc.data();

                        let roleId = userData.roleId || 'Staff';
                        if (typeof roleId === 'number' && ROLE_ID_MAP[roleId]) {
                            roleId = ROLE_ID_MAP[roleId];
                        }

                        const matchedStaff: Staff = {
                            id: String(userData.id || firebaseUser.uid),
                            fullName: userData.fullName || userData.name || 'User',
                            initials: userData.initials || 'U',
                            email: userData.email,
                            phone: userData.phone,
                            roleId: roleId, 
                            status: userData.status || 'Active',
                            lastLogin: new Date().toISOString(),
                            photo: userData.photo,
                        };

                        setCurrentStaff(matchedStaff);
                    } else {
                        // Bootstrap Logic
                        const allUsersQuery = query(collection(db, "user"), limit(1));
                        const allUsersSnapshot = await getDocs(allUsersQuery);

                        if (allUsersSnapshot.empty) {
                            console.log("No users found. Bootstrapping first user as CEO.");
                            const newStaffId = firebaseUser.uid;
                            const newStaff: Staff = {
                                id: newStaffId,
                                fullName: firebaseUser.displayName || 'Admin User',
                                initials: (firebaseUser.displayName || 'AD').substring(0, 2).toUpperCase() || 'AD',
                                email: firebaseUser.email,
                                phone: '',
                                roleId: 'CEO',
                                status: 'Active',
                                lastLogin: new Date().toISOString(),
                                ...(firebaseUser.photoURL ? { photo: firebaseUser.photoURL } : {})
                            };

                            await setDoc(doc(db, "user", newStaffId), newStaff);
                            setCurrentStaff(newStaff);
                            addActivityLog('Create', `Bootstrapped first user ${newStaff.fullName} in Firestore.`, newStaffId);
                        } else {
                            console.warn("User logged in via Firebase but no matching record found.");
                            await signOut(auth);
                            setCurrentStaff(null);
                        }
                    }
                } catch (error) {
                    console.error("Error verifying user against Firestore:", error);
                    setCurrentStaff(null);
                }
            } else {
                setCurrentStaff(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true, message: 'Login successful' };
        } catch (error: any) {
            console.error("Firebase login error:", error);
            let message = 'Invalid credentials';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') message = 'Invalid email or password';
            return { success: false, message };
        }
    };

    const register = async (email: string, password: string) => {
        try {
            await signup(email, password);
            return { success: true, message: 'Registration successful' };
        } catch (error: any) {
            console.error("Firebase registration error:", error);
            let message = 'Registration failed';
            if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
            if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
            return { success: false, message };
        }
    };

    const logout = async () => {
        if (currentStaff) {
            addActivityLog('Logout', `User ${currentStaff.fullName} logged out.`, currentStaff.id);
        }
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
            register,
            logout,
            updateCurrentUser,
            isAuthenticated: !!currentStaff,
            loading
        }}>
            {!loading && children}
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
