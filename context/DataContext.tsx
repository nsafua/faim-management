
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as dbService from '../services/dbService';
import { RolePermission, AppModuleName, InternalMail } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
    rolePermissions: RolePermission[];
    updateRolePermission: (roleId: string, moduleId: AppModuleName, permission: string, value: boolean) => Promise<void>;
    initRolePermissions: (roleId: string) => Promise<void>;
    // Mailing
    internalMails: InternalMail[];
    sendMail: (mail: Omit<InternalMail, 'id' | 'participants'>) => Promise<void>;
    markMailAsRead: (mailId: string) => Promise<void>;
    deleteMail: (mailId: string) => Promise<void>;
    restoreMail: (mailId: string) => Promise<void>;
    permanentDeleteMail: (mailId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, currentStaff } = useAuth();
    const [rolePermissions, setRolePermissionsState] = useState<RolePermission[]>([]);
    const [internalMails, setInternalMails] = useState<InternalMail[]>([]);

    useEffect(() => {
        let unsubscribePerms = () => {};
        let unsubscribeMails = () => {};
        
        if (isAuthenticated) {
            // Subscribe to Permissions
            unsubscribePerms = dbService.listenToRolePermissions((perms) => {
                setRolePermissionsState(perms);
            });

            // Subscribe to Mails (if user is loaded)
            if (currentStaff) {
                unsubscribeMails = dbService.listenToInbox(currentStaff.id, (mails) => {
                    setInternalMails(mails);
                });
            }
        } else {
            setRolePermissionsState([]);
            setInternalMails([]);
        }

        return () => {
            unsubscribePerms();
            unsubscribeMails();
        };
    }, [isAuthenticated, currentStaff]);

    const updateRolePermission = async (roleId: string, moduleId: AppModuleName, permission: string, value: boolean) => {
        await dbService.updateRolePermissionInDb(roleId, moduleId, permission, value);
    };

    const initRolePermissions = async (roleId: string) => {
        await dbService.initRolePermissions(roleId);
    }

    // Mailing Actions
    const sendMail = async (mailData: Omit<InternalMail, 'id' | 'participants'>) => {
        if (!currentStaff) return;
        // Construct full object for DB
        await dbService.sendInternalMail({
            ...mailData,
            senderId: currentStaff.id,
            senderName: currentStaff.fullName,
            readBy: [currentStaff.id], // Sender has read it
            isDeleted: false,
            participants: [] // handled in service
        });
    };

    const markMailAsRead = async (mailId: string) => {
        if (!currentStaff) return;
        await dbService.markMailRead(mailId, currentStaff.id);
    };

    const deleteMail = async (mailId: string) => {
        await dbService.toggleMailDeleteStatus(mailId, true);
    };

    const restoreMail = async (mailId: string) => {
        await dbService.toggleMailDeleteStatus(mailId, false);
    };

    const permanentDeleteMail = async (mailId: string) => {
        await dbService.permanentlyDeleteMail(mailId);
    };

    return (
        <DataContext.Provider value={{
            rolePermissions,
            updateRolePermission,
            initRolePermissions,
            internalMails,
            sendMail,
            markMailAsRead,
            deleteMail,
            restoreMail,
            permanentDeleteMail
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a DataProvider');
    }
    return context;
};

// Alias for generic data access
export const useData = usePermissions;
