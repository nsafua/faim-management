
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, writeBatch, onSnapshot, updateDoc } from 'firebase/firestore';
import { Staff, ActivityLog, Role, CompanySettings, RolePermission, AppModuleName, PermissionSet } from '../types';
import { 
    PROPERTIES, INVOICES, PROMOTIONS, COMPANY_SETTINGS, 
    AMENDMENT_REQUESTS, ROLES, ROLE_PERMISSIONS, APP_MODULES 
} from '../data/mockData';

const USERS_COL = 'user';
const LOGS_COL = 'activity_logs';
const ROLES_COL = 'roles';
const PERMISSIONS_COL = 'role_permissions';
const SETTINGS_COL = 'settings';
// Needed for seeding
const PROPERTIES_COL = 'properties'; 
const INVOICES_COL = 'invoices'; 
const PROMOTIONS_COL = 'promotions'; 
const AMENDMENTS_COL = 'amendments';

const sanitizeData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

const fetchCollection = async <T>(colName: string): Promise<T[]> => {
    try {
        const snapshot = await getDocs(collection(db, colName));
        return snapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
        console.error(`Error fetching ${colName}:`, error);
        return [];
    }
};

// --- Staff ---
export const fetchStaff = () => fetchCollection<Staff>(USERS_COL);
export const persistStaff = async (staff: Staff) => {
    const { password, ...staffDataWithoutPassword } = staff;
    await setDoc(doc(db, USERS_COL, String(staff.id)), sanitizeData(staffDataWithoutPassword));
};
export const removeStaff = async (id: string) => {
    await deleteDoc(doc(db, USERS_COL, id));
};

// --- Activity Logs ---
export const fetchActivityLogs = () => fetchCollection<ActivityLog>(LOGS_COL);
export const persistActivityLog = async (log: ActivityLog) => {
    await setDoc(doc(db, LOGS_COL, String(log.id)), sanitizeData(log));
};

// --- Roles ---
export const fetchRoles = () => fetchCollection<Role>(ROLES_COL);
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

// --- Company Settings ---
export const fetchCompanySettings = async (): Promise<CompanySettings> => {
    try {
        const docRef = doc(db, SETTINGS_COL, 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Ensure defaults are merged in case fields are missing in DB
            return { ...COMPANY_SETTINGS, ...docSnap.data() } as CompanySettings;
        } else {
            return COMPANY_SETTINGS;
        }
    } catch (error) {
        console.error("Error fetching company settings:", error);
        return COMPANY_SETTINGS;
    }
};
export const persistCompanySettings = async (settings: CompanySettings) => {
    await setDoc(doc(db, SETTINGS_COL, 'main'), sanitizeData(settings));
};

// --- Seeding ---
export const seedDatabase = async () => {
    const batch = writeBatch(db);
    
    const propertiesSnap = await getDocs(collection(db, PROPERTIES_COL));
    const shouldSeedData = propertiesSnap.empty;

    if (shouldSeedData) {
        console.log("Seeding main app data...");
        PROPERTIES.forEach(p => batch.set(doc(db, PROPERTIES_COL, String(p.id)), sanitizeData(p)));
        INVOICES.forEach(i => batch.set(doc(db, INVOICES_COL, String(i.id)), sanitizeData(i)));
        PROMOTIONS.forEach(p => batch.set(doc(db, PROMOTIONS_COL, String(p.id)), sanitizeData(p)));
        ROLES.forEach(r => batch.set(doc(db, ROLES_COL, String(r.id)), sanitizeData(r)));
        AMENDMENT_REQUESTS.forEach(a => batch.set(doc(db, AMENDMENTS_COL, String(a.id)), sanitizeData(a)));
        batch.set(doc(db, SETTINGS_COL, 'main'), sanitizeData(COMPANY_SETTINGS));
    }

    const ceoPermissionsRef = doc(db, PERMISSIONS_COL, 'CEO');
    try {
        const ceoPermissionsSnap = await getDoc(ceoPermissionsRef);
        const shouldSeedPermissions = !ceoPermissionsSnap.exists();

        if (shouldSeedPermissions) {
            console.log("Seeding permissions...");
            const permissionsByRole: Record<string, any> = {};
            ROLE_PERMISSIONS.forEach(rp => {
                if (!permissionsByRole[rp.roleId]) permissionsByRole[rp.roleId] = {};
                permissionsByRole[rp.roleId][rp.moduleId] = rp.permissions;
            });

            Object.entries(permissionsByRole).forEach(([roleId, modules]) => {
                batch.set(doc(db, PERMISSIONS_COL, roleId), { modules });
            });
        }

        if (shouldSeedData || shouldSeedPermissions) {
            await batch.commit();
            console.log("Database seeding complete.");
        } else {
            console.log("Database already seeded and up-to-date.");
        }
    } catch (e) {
        console.error("Seeding check failed (possibly permission issue):", e);
    }
};
