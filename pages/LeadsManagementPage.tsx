
import React, { useState, useMemo, useEffect } from 'react';
import { Lead, Client, Staff, Property, Milestone, LeadComment, ActivityLog, Role } from '../types';
import { 
    MagnifyingGlassIcon, 
    PlusCircleIcon, 
    UploadIcon
} from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import LeadForm from '../components/LeadForm';
import CSVImportWizard from '../components/CSVImportWizard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useLeads } from '../hooks/useAppData';

// Modular Imports
import { LeadsBoard } from '../components/leads/LeadsBoard';
import { LeadsList } from '../components/leads/LeadsList';
import { CommentModal } from '../components/leads/CommentModal';

interface LeadsManagementPageProps {
    onSaveLead: (lead: Lead) => Promise<void>;
    onDeleteLead: (leadId: number) => Promise<void>;
    clients: Client[];
    onSaveClient: (client: Client) => Promise<Client>;
    staffList: Staff[];
    roles: Role[];
    properties: Property[];
    milestones: Milestone[];
    currentStaff: Staff;
    addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const LeadsManagementPage: React.FC<LeadsManagementPageProps> = ({ onSaveLead, onDeleteLead, clients, onSaveClient, staffList, roles, milestones, currentStaff, addActivityLog }) => {
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
                // FIX: Added required clientType property to the new Client object
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

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Lead Management & Follow-Up</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Visually track lead progress and manage conversions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setImportWizardOpen(true)} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                        <UploadIcon className="w-5 h-5" /> Import Leads
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                        <PlusCircleIcon className="w-5 h-5" /> Add New Lead
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 justify-between items-center transition-colors flex-shrink-0">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('board')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'board' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Follow-Up Board</button>
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Lead List</button>
                </div>
                 <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500">
                        {isLoading ? <LoaderIcon className="animate-spin" /> : <MagnifyingGlassIcon />}
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search leads..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                    />
                </div>
            </div>

            {activeTab === 'board' && (
                <LeadsBoard 
                    leads={leads}
                    staffList={staffList}
                    searchTerm={searchTerm}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onCardClick={setCommentingLead}
                />
            )}

            {activeTab === 'list' && (
                <LeadsList 
                    leads={leads}
                    staffList={staffList}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    onConvert={handleConvertLead}
                    onComment={setCommentingLead}
                    onEdit={handleOpenModal}
                    onDelete={handleDeleteClick}
                />
            )}

            <LeadForm isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveLead} salesReps={salesReps} editingLead={editingLead} />
            <CommentModal isOpen={!!commentingLead} onClose={() => setCommentingLead(null)} lead={commentingLead} onAddComment={handleAddComment} staffList={staffList} />
            <CSVImportWizard
                isOpen={isImportWizardOpen}
                onClose={() => setImportWizardOpen(false)}
                onImport={handleImportLeads}
                requiredHeaders={['fullName', 'phone']}
                sampleHeaders="fullName,email,phone,source"
                sampleData="John Doe,john.doe@example.com,0241234567,Referral\nJane Smith,jane.smith@example.com,0559876543,Facebook"
                wizardTitle="Import Leads from CSV"
            />
            
            <DeleteConfirmationModal 
                isOpen={!!leadToDelete}
                onClose={() => setLeadToDelete(null)}
                onConfirm={confirmDeleteLead}
                itemName={leadToDelete?.fullName || ''}
                itemType="Lead"
            />
        </div>
    );
};

export default LeadsManagementPage;
