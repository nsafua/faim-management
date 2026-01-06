
// @ts-ignore
import { createUserWithEmailAndPassword } from "firebase/auth";
import { secondaryAuth, auth } from "./firebase";

/**
 * Registers a new user in Firebase Authentication using a secondary app instance.
 * This ensures the current admin user is not signed out when creating a new account.
 * 
 * @param email - The email for the new user
 * @param password - The password for the new user
 * @returns The created User object
 */
export const registerUser = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error("Error registering user in Firebase Auth:", error);
        throw error;
    }
};

/**
 * Signs up a user using the main auth instance. Used for self-registration on the login page.
 * 
 * @param email 
 * @param password 
 * @returns 
 */
export const signup = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error("Error signing up:", error);
        throw error;
    }
};
