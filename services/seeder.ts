import { db } from './firebase';
import { collection, getDocs, doc, writeBatch, getDoc } from 'firebase/firestore';
import { 
    PROPERTIES, INVOICES, PROMOTIONS, COMPANY_SETTINGS, 
    AMENDMENT_REQUESTS, ROLES, ROLE_PERMISSIONS 
} from '../data/mockData';
import { sanitizeData } from './dbUtils';

const SETTINGS_COL = 'settings';
const PROPERTIES_COL = 'properties'; 
const INVOICES_COL = 'invoices'; 
const PROMOTIONS_COL = 'promotions'; 
const AMENDMENTS_COL = 'amendments';
const ROLES_COL = 'roles';
const PERMISSIONS_COL = 'role_permissions';

export const seedDatabase = async () => {
    const batch = writeBatch(db);
    
    const propertiesSnap = await getDocs(collection(db, PROPERTIES_COL));
    const shouldSeedData = propertiesSnap.empty;

    if (shouldSeedData) {
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
        }
    } catch (e) {
        console.error("Seeding check failed:", e);
    }
};
