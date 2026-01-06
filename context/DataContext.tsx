
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as dbService from '../services/dbService';
import { RolePermission, AppModuleName } from '../types';
import { useAuth } from './AuthContext';

interface PermissionsContextType {
    rolePermissions: RolePermission[];
    updateRolePermission: (roleId: string, moduleId: AppModuleName, permission: string, value: boolean) => Promise<void>;
    initRolePermissions: (roleId: string) => Promise<void>;
}

const DataContext = createContext<PermissionsContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [rolePermissions, setRolePermissionsState] = useState<RolePermission[]>([]);

    useEffect(() => {
        let unsubscribe = () => {};
        
        if (isAuthenticated) {
            // Subscribe to real-time changes in role_permissions collection only when authenticated
            unsubscribe = dbService.listenToRolePermissions((perms) => {
                setRolePermissionsState(perms);
            });
        } else {
            setRolePermissionsState([]);
        }

        return () => unsubscribe();
    }, [isAuthenticated]);

    const updateRolePermission = async (roleId: string, moduleId: AppModuleName, permission: string, value: boolean) => {
        await dbService.updateRolePermissionInDb(roleId, moduleId, permission, value);
    };

    const initRolePermissions = async (roleId: string) => {
        await dbService.initRolePermissions(roleId);
    }

    return (
        <DataContext.Provider value={{
            rolePermissions,
            updateRolePermission,
            initRolePermissions,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a DataProvider (PermissionsProvider)');
    }
    return context;
};

/**
 * @deprecated Use specific hooks (useClients, useStaff, etc.) or usePermissions instead.
 */
export const useData = () => {
     return usePermissions(); 
};
