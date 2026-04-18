import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dbService from '../../services/dbService';
import { auth } from '../../services/firebase';
import { Property } from '../../types';

// --- Properties ---
export const useProperties = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: allProperties = [] } = useQuery({
        queryKey: ['properties'],
        queryFn: dbService.fetchProperties,
        staleTime: 1000 * 60 * 10,
        enabled: isAuthenticated,
    });

    // BUSINESS RULE: Exclude archived properties from standard results
    const properties = allProperties.filter(p => !p.isArchived);
    const archivedProperties = allProperties.filter(p => p.isArchived);

    const savePropertyMutation = useMutation({
        mutationFn: dbService.persistProperty,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] })
    });

    const archivePropertyMutation = useMutation({
        mutationFn: (variables: { id: number; userId: string }) => 
            dbService.persistProperty({ 
                ...allProperties.find(p => p.id === variables.id)!, 
                isArchived: true,
                archivedAt: new Date().toISOString(),
                archivedBy: variables.userId
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] })
    });

    const restorePropertyMutation = useMutation({
        mutationFn: (id: number) => 
            dbService.persistProperty({ 
                ...allProperties.find(p => p.id === id)!, 
                isArchived: false,
                archivedAt: undefined,
                archivedBy: undefined
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] })
    });

    const deletePropertyMutation = useMutation({
        mutationFn: dbService.removeProperty,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] })
    });

    return {
        properties,
        archivedProperties,
        saveProperty: (property: Property) => savePropertyMutation.mutateAsync(property),
        archiveProperty: (id: number, userId: string) => archivePropertyMutation.mutateAsync({ id, userId }),
        restoreProperty: (id: number) => restorePropertyMutation.mutateAsync(id),
        deleteProperty: (id: number) => deletePropertyMutation.mutateAsync(id)
    };
};