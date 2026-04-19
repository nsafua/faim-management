import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { Role, RolePermission, AppModuleName, PermissionSet } from '../types';
import { APP_MODULES } from '../data/mockData';
import { sanitizeData } from './dbUtils';

const ROLES_COL = 'roles';
const PERMISSIONS_COL = 'role_permissions';

// --- Roles ---
export const fetchRoles = async (): Promise<Role[]> => {
    try {
        const snapshot = await getDocs(collection(db, ROLES_COL));
        return snapshot.docs.map(doc => doc.data() as Role);
    } catch (error) {
        console.error(`Error fetching roles:`, error);
        return [];
    }
};

export const persistRole = async (role: Role) => {
    await setDoc(doc(db, ROLES_COL, String(role.id)), sanitizeData(role));
};

export const removeRole = async (id: string) => {
    await deleteDoc(doc(db, ROLES_COL, id));
};

// --- Role Permissions ---
export const listenToRolePermissions = (onUpdate: (perms: RolePermission[]) => void) => {
    return onSnapshot(collection(db, PERMISSIONS_COL), (snapshot) => {
        const allPerms: RolePermission[] = [];
        snapshot.docs.forEach(doc => {
            const roleId = doc.id;
            const data = doc.data();
            
            if (data.modules) {
                Object.entries(data.modules).forEach(([moduleId, permissions]) => {
                    allPerms.push({
                        roleId,
                        moduleId: moduleId as AppModuleName,
                        permissions: permissions as PermissionSet
                    });
                });
            }
        });
        onUpdate(allPerms);
    }, (error) => {
        console.error("Error listening to role permissions:", error);
        onUpdate([]);
    });
};

export const updateRolePermissionInDb = async (roleId: string, moduleId: string, permission: string, value: boolean) => {
    const roleDocRef = doc(db, PERMISSIONS_COL, roleId);
    await updateDoc(roleDocRef, {
        [`modules.${moduleId}.${permission}`]: value
    });
};

export const initRolePermissions = async (roleId: string) => {
    const roleDocRef = doc(db, PERMISSIONS_COL, roleId);
    const defaultPermissions: Record<string, PermissionSet> = {};
    
    APP_MODULES.forEach(module => {
        defaultPermissions[module.id] = { view: false, create: false, edit: false, delete: false, approve: false };
    });

    await setDoc(roleDocRef, { modules: defaultPermissions }, { merge: true });
};

export const fetchRolePermissions = async () => {
    const snapshot = await getDocs(collection(db, PERMISSIONS_COL));
    const allPerms: RolePermission[] = [];
    snapshot.docs.forEach(doc => {
        const roleId = doc.id;
        const data = doc.data();
        if (data.modules) {
            Object.entries(data.modules).forEach(([moduleId, permissions]) => {
                allPerms.push({
                    roleId,
                    moduleId: moduleId as AppModuleName,
                    permissions: permissions as PermissionSet
                });
            });
        }
    });
    return allPerms;
};

export const persistRolePermission = async (permission: RolePermission) => {
    const roleDocRef = doc(db, PERMISSIONS_COL, permission.roleId);
    await setDoc(roleDocRef, {
        modules: {
            [permission.moduleId]: permission.permissions
        }
    }, { merge: true });
};

export const removeRolePermission = async (roleId: string, moduleId: string) => {
    console.warn("Deleting individual module permissions is not fully supported in this schema version.");
};
