import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbService from '../../services/dbService';
import { auth } from '../../services/firebase';
import { Staff, Role, ActivityLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/DataContext';

// --- Staff ---
export const useStaff = () => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const { rolePermissions } = usePermissions();
    const isAuthenticated = !!auth.currentUser;

    const canView = useMemo(() => {
        if (!currentStaff) return false;
        if (currentStaff.roleId === 'CEO') return true;
        const perms = rolePermissions.find(rp => rp.roleId === currentStaff.roleId && rp.moduleId === 'Settings');
        return !!perms?.permissions?.view;
    }, [currentStaff, rolePermissions]);

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: dbService.fetchStaff,
        enabled: isAuthenticated && canView,
    });

    const saveStaffMutation = useMutation({
        mutationFn: dbService.persistStaff,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
    });

    const updateStaffMutation = useMutation({
        mutationFn: (variables: { id: string, details: Partial<Staff> }) => 
            dbService.persistStaff({ ...staff.find(s => s.id === variables.id)!, ...variables.details }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
    });

    const deleteStaffMutation = useMutation({
        mutationFn: dbService.removeStaff,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
    });

    return {
        staff,
        isLoading,
        saveStaff: (member: Staff) => saveStaffMutation.mutateAsync(member),
        updateStaff: (id: string, details: Partial<Staff>) => updateStaffMutation.mutateAsync({ id, details }),
        deleteStaff: (id: string) => deleteStaffMutation.mutateAsync(id)
    };
};

// --- Roles ---
export const useRoles = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: dbService.fetchRoles,
        enabled: isAuthenticated,
    });

    const setRolesMutation = useMutation({
        mutationFn: async (updatedRoles: Role[]) => {
            for (const role of updatedRoles) {
                await dbService.persistRole(role);
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
    });

    return {
        roles,
        setRoles: (roles: React.SetStateAction<Role[]>) => {
            if (typeof roles === 'function') {
                const next = roles(queryClient.getQueryData(['roles']) || []);
                setRolesMutation.mutate(next);
            } else {
                setRolesMutation.mutate(roles);
            }
        }
    };
};

// --- Activity Logs ---
export const useActivityLogs = () => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const { rolePermissions } = usePermissions();
    const isAuthenticated = !!auth.currentUser;

    const canView = useMemo(() => {
        if (!currentStaff) return false;
        if (currentStaff.roleId === 'CEO') return true;
        const perms = rolePermissions.find(rp => rp.roleId === currentStaff.roleId && rp.moduleId === 'Settings');
        return !!perms?.permissions?.view;
    }, [currentStaff, rolePermissions]);

    const { data: activityLogs = [] } = useQuery({
        queryKey: ['activity_logs'],
        queryFn: dbService.fetchActivityLogs,
        enabled: isAuthenticated && canView,
    });

    const addActivityLogMutation = useMutation({
        mutationFn: (variables: { type: any, description: string, userId: string }) => 
            dbService.persistActivityLog({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...variables
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
    });

    return {
        activityLogs,
        addActivityLog: (type: any, description: string, userId: string) => 
            addActivityLogMutation.mutateAsync({ type, description, userId })
    };
};