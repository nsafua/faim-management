import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as dbService from '../../services/dbService';
import { atomicSaveClient } from '../../services/clientDbService';
import { dispatchWorkflowNotifications } from '../../services/notificationService';
import { auth } from '../../services/firebase';
import { Client, MilestoneRecord, AmendmentRequest, RefundRecord, RefundTransaction } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const useClients = (searchTerm: string = '') => {
    const queryClient = useQueryClient();
    const { currentStaff } = useAuth();
    const isAuthenticated = !!auth.currentUser;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['clients', searchTerm],
        queryFn: ({ pageParam }) => 
            searchTerm 
                ? dbService.searchClients(searchTerm).then(data => ({ data, lastDoc: null }))
                : dbService.fetchClientsPaginated(pageParam as any),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.lastDoc,
        enabled: isAuthenticated,
    });

    const clients = data?.pages.flatMap(page => page.data) || [];

    const saveClientMutation = useMutation({
        mutationFn: async (clientData: Client) => {
            const userRole = currentStaff?.roleId || '';
            const isCEO = userRole === 'CEO';
            const isChiefAccountant = userRole === 'Chief Accountant';
            
            const existingClient = clients.find(c => c.id === clientData.id);

            if (existingClient && !isCEO) {
                const diff: any = {};
                Object.keys(clientData).forEach(key => {
                    const k = key as keyof Client;
                    if (JSON.stringify(clientData[k]) !== JSON.stringify(existingClient[k])) {
                        diff[k] = true;
                    }
                });

                if (Object.keys(diff).length > 0) {
                    const hasRestrictedDiffs = !!(
                        diff.name || diff.surname || diff.phone || diff.email || 
                        diff.dateOfBirth || diff.nextOfKin || diff.location || 
                        diff.plot || diff.indenture
                    );

                    if (isChiefAccountant && !hasRestrictedDiffs) {
                        // Authorized
                    } else {
                        const amendmentId = `CRQ-${Date.now()}`;
                        const changeRequest: AmendmentRequest = {
                            id: amendmentId,
                            clientId: clientData.id,
                            clientFullName: clientData.name,
                            clientPurchaseRef: `${clientData.initials}-${clientData.id}`,
                            requestDate: new Date().toISOString().split('T')[0],
                            requestingStaffId: currentStaff!.id,
                            scannedForm: null,
                            amendmentTypes: {
                                personalDetails: !!(diff.name || diff.surname || diff.phone || diff.email || diff.dateOfBirth),
                                nextOfKin: !!diff.nextOfKin,
                                propertyReallocation: !!(diff.location || diff.plot),
                                paymentPlan: !!diff.payment,
                                indenture: !!diff.indenture
                            },
                            //@ts-ignore
                            pendingData: clientData,
                            officeUse: {
                                receivedBy: currentStaff!.fullName,
                                dateReceived: new Date().toISOString().split('T')[0],
                                status: 'Pending',
                                remarks: isChiefAccountant 
                                    ? `Chief Accountant requested restricted changes. CEO approval required.`
                                    : `Redirected to CEO Approval per system governance.`
                            }
                        };
                        await dbService.persistAmendment(changeRequest);
                        throw new Error("APPROVAL_REQUIRED: Change submitted for CEO review.");
                    }
                }
            }

            const total = clientData.payment.total || 0;
            const paid = clientData.payment.paid || 0;
            const isQualified = total > 0 && (paid / total) >= 0.7;

            const { client, event } = await atomicSaveClient(clientData);

            if (event === 'CLIENT_CREATED') {
                dispatchWorkflowNotifications({ event: 'CLIENT_CREATED', client });
            }

            // Standardized Trigger Event used here
            if (isQualified && (!existingClient || (existingClient.payment.paid / existingClient.payment.total) < 0.7)) {
                dispatchWorkflowNotifications({ event: 'CLIENT_QUALIFIED_70', client });
            }

            return client;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
    });

    const deleteClientMutation = useMutation({
        mutationFn: dbService.removeClient,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
    });

    return {
        clients,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        saveClient: (client: Client) => saveClientMutation.mutateAsync(client),
        deleteClient: (id: number) => deleteClientMutation.mutateAsync(id)
    };
};

export const useMilestones = (clientId?: number) => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: milestones = [] } = useQuery({
        queryKey: ['milestones', clientId],
        queryFn: () => dbService.fetchMilestones(clientId),
        enabled: isAuthenticated,
    });

    const saveMilestoneMutation = useMutation({
        mutationFn: (milestone: MilestoneRecord) => dbService.persistMilestone(milestone),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones'] })
    });

    return {
        milestones,
        saveMilestone: (milestone: MilestoneRecord) => saveMilestoneMutation.mutateAsync(milestone)
    };
};

export const useRefunds = (clientId: number) => {
    const queryClient = useQueryClient();
    const isAuthenticated = !!auth.currentUser;

    const { data: refundRecord = null } = useQuery({
        queryKey: ['refund_record', clientId],
        queryFn: () => dbService.fetchRefundRecord(clientId),
        enabled: isAuthenticated && !!clientId,
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['refund_transactions', clientId],
        queryFn: () => dbService.fetchRefundTransactions(clientId),
        enabled: isAuthenticated && !!clientId,
    });

    const requestRefundMutation = useMutation({
        mutationFn: async (data: RefundRecord) => {
            await dbService.persistRefundRequest(data);
            await dbService.updateClientRefundStatusInDb(data.clientId, 'Refund Requested');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refund_record', clientId] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
    });

    const postRefundTransactionMutation = useMutation({
        mutationFn: async (txn: RefundTransaction) => {
            await dbService.persistRefundTransaction(txn);
            if (refundRecord) {
                const newBalance = refundRecord.outstandingRefundBalance - txn.amount;
                const newStatus = newBalance <= 0 ? 'Refund Completed' : 'Refund Ongoing';
                await dbService.persistRefundRequest({
                    ...refundRecord,
                    outstandingRefundBalance: newBalance,
                    status: newStatus
                });
                await dbService.updateClientRefundStatusInDb(txn.clientId, newStatus);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refund_record', clientId] });
            queryClient.invalidateQueries({ queryKey: ['refund_transactions', clientId] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
    });

    return {
        refundRecord,
        transactions,
        requestRefund: (data: RefundRecord) => requestRefundMutation.mutateAsync(data),
        postTransaction: (data: RefundTransaction) => postRefundTransactionMutation.mutateAsync(data)
    };
};