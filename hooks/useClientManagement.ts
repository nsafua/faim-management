import { useState, useCallback, useEffect, useRef } from 'react';
import { Client, Milestone, Property, Invoice, ActivityLog, Staff, AllocationStatus } from '../types';
import { VariableSizeList as List } from 'react-window';
import { useClients, useStaff } from './useAppData';
import { uploadFile } from '../services/storageService';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FormData } from '../components/ClientForm';

export const isClientDataComplete = (formData: FormData): boolean => {
    const requiredFields: (keyof FormData)[] = [ 'surname', 'otherNames', 'currentAddress', 'telephone', 'kinName', 'kinPhone', 'witnessName', 'witnessPhone', 'witnessAddress', 'location', 'plotNumber', 'indentureName', 'indentureAddress', 'salesRep', 'salesManager', 'accountsHead', 'clerk' ];
    for (const field of requiredFields) {
        if (!formData[field] || String(formData[field]).trim() === '') return false;
    }
    return true;
};

export const useClientManagement = (
    onClientSelect: (client: Client) => void,
    onSaveClient: (client: Client) => Promise<Client>,
    onDeleteClient: (clientId: number) => Promise<void>,
    properties: Property[],
    milestones: Milestone[],
    addActivityLog: (type: ActivityLog['type'], description: string) => void
) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const { clients, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useClients(debouncedSearchTerm);
    const { sendMail } = useData();
    const { staff } = useStaff();
    const { currentStaff } = useAuth();

    const [isClientFormOpen, setClientFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isImportWizardOpen, setImportWizardOpen] = useState(false);
    const [deletedClientInfo, setDeletedClientInfo] = useState<{ name: string; timeoutId: ReturnType<typeof setTimeout> } | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    
    // Virtualization State
    const listRef = useRef<List>(null);
    const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

    // --- SCROLL ANIMATION LOGIC ---
    const [scrollOffset, setScrollOffset] = useState(0);
    const MAX_SCROLL = 80;

    const handleScroll = ({ scrollOffset: offset }: { scrollOffset: number }) => {
        setScrollOffset(Math.min(offset, MAX_SCROLL));
    };

    const headerOpacity = Math.max(0, 1 - scrollOffset / (MAX_SCROLL * 0.8));
    const headerHeight = Math.max(0, 48 - (scrollOffset / MAX_SCROLL) * 48);
    const controlsTranslate = (scrollOffset / MAX_SCROLL) * -52;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const toggleExpand = (id: number, index: number) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
        if (listRef.current) {
            listRef.current.resetAfterIndex(index);
        }
    };

    const handleDeleteClick = useCallback((clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        if (client) setClientToDelete(client);
    }, [clients]);

    const confirmDeleteClient = async () => {
        if (clientToDelete) {
            await onDeleteClient(clientToDelete.id);
            addActivityLog('Delete', `Deleted client: ${clientToDelete.name}`);
            const timeoutId = setTimeout(() => setDeletedClientInfo(null), 3000);
            setDeletedClientInfo({ name: clientToDelete.name, timeoutId });
            setClientToDelete(null);
        }
    };

    const createClientObject = (formData: FormData, id: number, existingClient?: Client | null): Client => {
        const fullName = `${formData.surname} ${formData.otherNames}`;
        const nameParts = fullName.split(' ');
        const initials = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();
        const selectedProperty = properties.find(p => p.location === formData.location);
        let propertyPrice = selectedProperty ? selectedProperty.price : 200000;
        const plotCount = formData.plotNumber.split(',').map(p => p.trim()).filter(Boolean).length || 1;
        let baseTotal = propertyPrice * plotCount;
        let promoDetails: string | undefined = undefined;
        if (selectedProperty && selectedProperty.discount && new Date(selectedProperty.discount.endDate) >= new Date()) {
            baseTotal *= (1 - selectedProperty.discount.percentage / 100);
            promoDetails = `${selectedProperty.discount.percentage}% discount applied (Ends ${selectedProperty.discount.endDate})`;
        }
        const isComplete = isClientDataComplete(formData);
        
        const clientType = (formData as any).clientType || 'Individual';

        const baseClient = existingClient || {
            id: id, 
            clientType,
            status: 'Active Client' as const, 
            allocationStatus: 'RESERVED_NOT_ALLOCATED' as AllocationStatus, 
            paidPercent: 0, 
            stage: milestones[0]?.acronym || 'N/A',
            payment: { total: baseTotal, paid: 0, balance: baseTotal, dueDate: 'N/A', planType: 'N/A', promoDetails: promoDetails, paymentHistory: [], installments: [] },
            interactions: [], documentation: { status: 'Pending' },
            officeUse: { commission: { type: 'Percentage', amount: 0, status: 'Pending' } }
        };
        return {
            ...baseClient, id, 
            clientType, 
            name: fullName, surname: formData.surname, otherNames: formData.otherNames, initials,
            regDate: formData.paymentDate, email: formData.email, phone: formData.telephone, dateOfBirth: formData.dateOfBirth,
            gender: formData.gender as Client['gender'], location: formData.location, plot: formData.plotNumber, photo: formData.photo,
            propertyType: formData.propertyType, plannedDevelopmentYear: formData.plannedDevelopmentYear,
            professionalDetails: { placeOfWork: formData.placeOfWork, profession: formData.profession, position: formData.position },
            witness: { name: formData.witnessName, address: formData.witnessAddress, phone: formData.witnessPhone },
            nextOfKin: { name: formData.kinName, phone: formData.kinPhone, relationship: formData.kinRelationship, email: formData.kinEmail, address: formData.kinAddress },
            indenture: { name: formData.indentureName, address: formData.indentureAddress },
            officeUse: { ...baseClient.officeUse, salesRep: formData.salesRep, salesManager: formData.salesManager, accountsHead: formData.accountsHead, clerk: formData.clerk },
            isComplete, filledFormPdf: formData.filledFormPdf,
        };
    };

    const handleSaveClientAndRedirect = async (formData: FormData, files?: { photo?: File | null, pdf?: File | null }) => {
        try {
            const isNewClient = !editingClient;
            const newId = editingClient ? editingClient.id : (clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1);
            
            if (!newId) {
                alert("Error: Client ID could not be generated. Please retry.");
                return;
            }

            let photoUrl = formData.photo;
            if (files?.photo) photoUrl = await uploadFile(files.photo, `clients/${newId}/photos/${files.photo.name}`);
            let pdfUrl = formData.filledFormPdf;
            if (files?.pdf) pdfUrl = await uploadFile(files.pdf, `clients/${newId}/documents/${files.pdf.name}`);
            
            const updatedFormData = { ...formData, photo: photoUrl, filledFormPdf: pdfUrl };
            const newClient = createClientObject(updatedFormData, newId, editingClient);
            
            const savedClient = await onSaveClient(newClient);
            
            if (!savedClient) {
                alert("Error: Client data not saved correctly.");
                return;
            }

            if (isNewClient && currentStaff?.roleId === 'Front Desk Executive') {
                const chiefAccountants = staff.filter(s => s.roleId === 'Chief Accountant');
                
                if (chiefAccountants.length > 0) {
                    await sendMail({
                        senderId: currentStaff.id,
                        senderName: currentStaff.fullName,
                        recipientIds: chiefAccountants.map(s => s.id),
                        groupIds: [], 
                        subject: 'ACTION REQUIRED: New Client Ledger Initialization',
                        body: `A new client record has been created and requires financial setup.\n\nClient: ${savedClient.name}\nReference: ${savedClient.initials}-${savedClient.id}\nProperty: ${savedClient.location}\n\nPlease proceed to Account Management to initialize the financial commitment and payment plan for this account.\n\nDate Registered: ${new Date().toLocaleString()}`,
                        attachments: [],
                        timestamp: new Date().toISOString(),
                        readBy: [currentStaff.id],
                        isDraft: false,
                        isDeleted: false,
                        targetPage: 'Account Management',
                        targetContext: savedClient
                    });
                } else {
                    addActivityLog('Update', `System Warning: No Chief Accountant found to receive onboarding notification for client ${savedClient.name}.`);
                }
            }

            setClientFormOpen(false);
            addActivityLog(editingClient ? 'Update' : 'Create', `Processed client: ${savedClient.name}`);
            
            onClientSelect(savedClient);

        } catch (error) { 
            console.error("Save failed:", error);
            alert("Failed to save client."); 
        }
    };

    return {
        searchTerm, setSearchTerm,
        debouncedSearchTerm,
        clients, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage,
        isClientFormOpen, setClientFormOpen,
        editingClient, setEditingClient,
        isImportWizardOpen, setImportWizardOpen,
        deletedClientInfo, setDeletedClientInfo,
        clientToDelete, setClientToDelete,
        listRef, expandedIds, setExpandedIds,
        scrollOffset, setScrollOffset,
        headerOpacity, headerHeight, controlsTranslate,
        handleScroll, toggleExpand, handleDeleteClick, confirmDeleteClient, handleSaveClientAndRedirect
    };
};
