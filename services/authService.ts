
// @ts-ignore
import { createUserWithEmailAndPassword, deleteUser, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { secondaryAuth, db, auth, functions } from "./firebase";

/**
 * Normalizes email strings to prevent login mismatches (trailing spaces, casing)
 */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Authenticates a user with the primary Firebase instance.
 * Step 1 of Flow: Hard Identity Gate.
 * This function no longer validates Firestore profiles to prevent silent logouts.
 */
export const loginWithEmail = async (email: string, password: string) => {
    try {
        const normalized = normalizeEmail(email);
        const userCredential = await signInWithEmailAndPassword(auth, normalized, password);
        return userCredential.user;
    } catch (error: any) {
        console.error("Authentication Phase Failed:", error.code);
        // Map specific auth failure for clear UI feedback
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error("INVALID_CREDENTIALS");
        }
        throw error;
    }
};

/**
 * Registers a new staff member atomically.
 * Uses secondaryAuth to keep the current admin session active.
 */
export const registerStaffAccount = async (staffData: {
    email: string;
    password: string;
    fullName: string;
    roleId: string;
    phone?: string;
}) => {
    const email = normalizeEmail(staffData.email);
    let createdUser: any = null;

    try {
        // 1. Create Auth Identity
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, staffData.password);
        createdUser = userCredential.user;

        // 2. Prepare Firestore Profile (Deterministic Path: /user/{uid})
        const nameParts = staffData.fullName.split(' ');
        const initials = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

        const userProfile = {
            id: createdUser.uid,
            uid: createdUser.uid,
            fullName: staffData.fullName,
            initials,
            email: email,
            phone: staffData.phone || '',
            roleId: staffData.roleId,
            status: 'Active',
            createdAt: serverTimestamp(),
            lastLogin: 'Never'
        };

        // 3. Persist Profile
        await setDoc(doc(db, "user", createdUser.uid), userProfile);

        // 4. State Cleanup (Secondary app only)
        await signOut(secondaryAuth);

        return { success: true, user: createdUser };
    } catch (error: any) {
        console.error("Atomic Registration Failure:", error);
        if (createdUser) {
            try {
                await deleteUser(createdUser);
            } catch (cleanupError) {
                console.error("Integrity Error: Orphaned Auth account exists.", cleanupError);
            }
        }
        throw error;
    }
};

/**
 * Updates a staff member's password.
 * Requires a backend Cloud Function 'updateUserPassword' to be deployed.
 */
export const updateStaffPassword = async (uid: string, password: string) => {
    try {
        const updatePasswordFunc = httpsCallable(functions, 'updateUserPassword');
        await updatePasswordFunc({ uid, password });
        return { success: true };
    } catch (error: any) {
        console.error("Password Update Failed:", error);
        throw new Error(error.message || "Failed to update password via secure backend.");
    }
};
