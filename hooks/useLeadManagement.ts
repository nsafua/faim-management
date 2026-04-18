import { useState, useEffect, useMemo } from 'react';
import { Lead, Client, Milestone, ActivityLog, Staff, Role, LeadComment } from '../types';
import { useLeads } from './useAppData';

export const useLeadManagement = (
    onSaveLead: (lead: Lead) => Promise<void>,
    onDeleteLead: (leadId: number) => Promise<void>,
    clients: Client[],
    onSaveClient: (client: Client) => Promise<Client>,
    staffList: Staff[],
    roles: Role[],
    milestones: Milestone[],
    currentStaff: Staff,
    addActivityLog: (type: ActivityLog['type'], description: string) => void
) => {
    const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportWizardOpen, setImportWizardOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Fetch data via hook
    const { leads, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useLeads(debouncedSearchTerm);

    const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
    const [commentingLead, setCommentingLead] = useState<Lead | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const salesReps = useMemo(() => staffList.filter(u => ['Head of Sales', 'Sales Representative'].includes(roles.find(r => r.id === u.roleId)?.name || '')), [staffList, roles]);

    // Debounce Effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleOpenModal = (lead: Lead | null = null) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingLead(null);
        setIsModalOpen(false);
    };

    const handleSaveLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContactDate' | 'comments'>) => {
        const currentDate = new Date().toISOString();
        if (editingLead) {
            const leadToSave = { ...editingLead, ...leadData, lastContactDate: currentDate };
            onSaveLead(leadToSave);
            addActivityLog('Update', `Updated lead details for ${leadData.fullName}.`);
        } else {
            const newLead: Lead = {
                id: Date.now(),
                ...leadData,
                status: 'Contacted',
                createdAt: currentDate,
                lastContactDate: currentDate,
                comments: []
            };
            onSaveLead(newLead);
            addActivityLog('Create', `Created new lead: ${newLead.fullName}.`);
        }
        handleCloseModal();
    };
    
    const handleDeleteClick = (id: number) => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            setLeadToDelete(lead);
        }
    };

    const confirmDeleteLead = async () => {
        if (leadToDelete) {
            await onDeleteLead(leadToDelete.id);
            addActivityLog('Delete', `Deleted lead: ${leadToDelete.fullName}.`);
            setLeadToDelete(null);
        }
    };

    const handleConvertLead = (lead: Lead) => {
        if (window.confirm(`This lead will now be converted to a client. Continue?`)) {
            const nameParts = lead.fullName.split(' ');
            const surname = nameParts.pop() || '';
            const otherNames = nameParts.join(' ');
            const initials = ((otherNames[0] || '') + (surname[0] || '')).toUpperCase();
            
            const newClient: Client = {
                id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
                clientType: 'Individual',
                name: lead.fullName, surname, otherNames, initials,
                regDate: new Date().toISOString().split('T')[0],
                email: lead.email, phone: lead.phone,
                location: 'N/A', plot: 'N/A', status: 'Active Client', stage: milestones[0]?.acronym || 'REG',
                payment: { total: 0, paid: 0, balance: 0, dueDate: 'N/A', planType: 'N/A', paymentHistory: [], installments: [] },
                interactions: lead.comments.map((c, i) => ({ id: i + 1, type: 'Note', date: c.date, agent: staffList.find(u => u.id === c.authorId)?.fullName || 'System', notes: `From Lead Follow-up: ${c.text}` })),
                witness: { name: '', address: '', phone: '' },
                nextOfKin: { name: '', phone: '', relationship: '' },
                indenture: { name: '', address: '' },
                officeUse: { salesRep: staffList.find(u=>u.id === lead.assignedRepId)?.fullName || '', salesManager: '', accountsHead: '', clerk: '', commission: { type: 'Percentage', amount: 0, status: 'Pending' } },
                documentation: { status: 'Pending' },
                isComplete: false,
                filledFormPdf: null,
            };
            
            onSaveClient(newClient);
            onDeleteLead(lead.id);
            addActivityLog('Update', `Converted lead ${lead.fullName} to a client.`);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: number) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Lead['status']) => {
        e.preventDefault();
        if (draggedLeadId === null) return;

        const droppedLead = leads.find(l => l.id === draggedLeadId);
        if (!droppedLead || droppedLead.status === newStatus) return;

        if (newStatus === 'Converted to Client') {
            handleConvertLead(droppedLead);
        } else {
            const oldStatus = droppedLead.status;
            onSaveLead({ ...droppedLead, status: newStatus, lastContactDate: new Date().toISOString() });
            addActivityLog('Update', `Updated lead status for ${droppedLead.fullName} from "${oldStatus}" to "${newStatus}".`);
            setCommentingLead(leads.find(l => l.id === draggedLeadId)!);
        }
        setDraggedLeadId(null);
    };
    
    const handleAddComment = (leadId: number, text: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        
        const newComment: LeadComment = {
            id: Date.now(),
            text,
            authorId: currentStaff.id,
            date: new Date().toISOString()
        };
        onSaveLead({ ...lead, comments: [...lead.comments, newComment], lastContactDate: new Date().toISOString() });
        addActivityLog('Update', `Added a comment to lead: ${lead.fullName}.`);
    };
    
    const handleImportLeads = (importedData: any[]) => {
      const highestId = leads.length > 0 ? Math.max(...leads.map(c => c.id)) : 0;

      const newLeads: Lead[] = importedData.map((data, index) => {
          const currentDate = new Date().toISOString();
          return {
              id: highestId + 1 + index,
              fullName: data.fullName || 'Unnamed Lead',
              email: data.email || '',
              phone: data.phone || '',
              source: data.source || 'Other',
              status: 'Contacted',
              assignedRepId: salesReps[0]?.id || '',
              nextFollowUpDate: '',
              lastContactDate: currentDate,
              notes: 'Imported via CSV.',
              createdAt: currentDate,
              comments: [],
          };
      });

      Promise.all(newLeads.map(lead => onSaveLead(lead)));
      addActivityLog('Import', `Imported ${newLeads.length} new leads from a CSV file.`);
    };

    return {
        activeTab, setActiveTab,
        isModalOpen, setIsModalOpen,
        isImportWizardOpen, setImportWizardOpen,
        editingLead, setEditingLead,
        searchTerm, setSearchTerm,
        leads, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage,
        commentingLead, setCommentingLead,
        leadToDelete, setLeadToDelete,
        salesReps,
        handleOpenModal, handleCloseModal, handleSaveLead,
        handleDeleteClick, confirmDeleteLead, handleConvertLead,
        handleDragStart, handleDragOver, handleDrop, handleAddComment, handleImportLeads
    };
};
