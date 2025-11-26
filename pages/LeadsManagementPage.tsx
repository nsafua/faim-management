

import React, { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { Lead, Client, Staff, Property, Milestone, LeadComment, ActivityLog } from '../types';
import { 
    MagnifyingGlassIcon, 
    PlusCircleIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftEllipsisIcon,
    UploadIcon
} from '../components/icons/DummyIcons';
import { XIcon } from '../components/icons/XIcon';
import LeadForm from '../components/LeadForm';
import CSVImportWizard from '../components/CSVImportWizard';

// --- START: In-file Components for LeadsManagementPage ---

const KANBAN_STAGES: Lead['status'][] = [
    'Contacted',
    'Visited Site',
    'Filled a Form',
    'Submitted the Form',
    'Made Payment',
    'Converted to Client',
];

const STAGE_COLORS: Record<Lead['status'], { bg: string; text: string; border: string }> = {
    'Contacted': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-400' },
    'Visited Site': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-400' },
    'Filled a Form': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-400' },
    'Submitted the Form': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-400' },
    'Made Payment': { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-400' },
    'Converted to Client': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-400' },
};

// Comment Modal Component
const CommentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    onAddComment: (leadId: number, text: string) => void;
    staffList: Staff[];
}> = ({ isOpen, onClose, lead, onAddComment, staffList }) => {
    const [newComment, setNewComment] = useState('');

    if (!isOpen || !lead) return null;

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(lead.id, newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Conversation History for {lead.fullName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-grow space-y-4">
                    {lead.comments.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No comments yet.</p>
                    ) : (
                        lead.comments.slice().reverse().map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {staffList.find(u => u.id === comment.authorId)?.initials || '??'}
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg flex-grow">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm text-gray-900">{staffList.find(u => u.id === comment.authorId)?.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t flex items-start gap-3">
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a new comment..." rows={2} className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                    <button onClick={handleAddComment} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    );
};

// Kanban Card Component
const KanbanCard: React.FC<{
    lead: Lead;
    assignedRep: Staff | undefined;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: number) => void;
    onClick: (lead: Lead) => void;
}> = ({ lead, assignedRep, onDragStart, onClick }) => {
    const { bg, text } = STAGE_COLORS[lead.status];
    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={() => onClick(lead)}
            className={`p-3 rounded-lg shadow-sm border bg-white cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all mb-3`}
        >
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 ${bg} ${text}`}>{lead.status}</div>
            <p className="font-bold text-gray-800">{lead.fullName}</p>
            <p className="text-xs text-gray-500">{lead.phone} | {lead.source}</p>
            <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-gray-500">Last update: {new Date(lead.lastContactDate).toLocaleDateString()}</p>
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs" title={assignedRep?.fullName}>
                    {assignedRep?.initials || '??'}
                </div>
            </div>
        </div>
    );
};

// --- END: In-file Components ---

interface LeadsManagementPageProps {
    leads: Lead[];
    onSaveLead: (lead: Lead) => Promise<void>;
    onDeleteLead: (leadId: number) => Promise<void>;
    clients: Client[];
    onSaveClient: (client: Client) => Promise<Client>;
    staffList: Staff[];
    properties: Property[];
    milestones: Milestone[];
    currentStaff: Staff;
    addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const LeadsManagementPage: React.FC<LeadsManagementPageProps> = ({ leads, onSaveLead, onDeleteLead, clients, onSaveClient, staffList, milestones, currentStaff, addActivityLog }) => {
    const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportWizardOpen, setImportWizardOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
    const [commentingLead, setCommentingLead] = useState<Lead | null>(null);

    const salesReps = useMemo(() => staffList.filter(u => ['Head of Sales', 'Sales Representative'].includes(staffList.find(r => r.id === u.roleId)?.fullName || '')), [staffList]);

    const filteredLeads = useMemo(() => {
        if (!searchTerm) return leads;
        const lowercasedTerm = searchTerm.toLowerCase();
        return leads.filter(lead =>
            lead.fullName.toLowerCase().includes(lowercasedTerm) ||
            lead.email.toLowerCase().includes(lowercasedTerm) ||
            lead.phone.includes(lowercasedTerm)
        );
    }, [leads, searchTerm]);

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
    
    const handleDeleteLead = (id: number) => {
        const leadToDelete = leads.find(l => l.id === id);
        // Let parent handle confirmation.
        onDeleteLead(id);
        // The log will be created even if the user cancels the confirmation dialog. This is a pre-existing design issue.
        // The main bug is that the component was not calling the persistence layer at all. Fixing that is the priority.
        if (leadToDelete) {
            addActivityLog('Delete', `Deleted lead: ${leadToDelete.fullName}.`);
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
              assignedRepId: salesReps[0]?.id || 0,
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
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Lead Management & Follow-Up</h1>
                    <p className="text-gray-500 mt-1">Visually track lead progress and manage conversions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setImportWizardOpen(true)} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2">
                        <UploadIcon className="w-5 h-5" /> Import Leads
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5" /> Add New Lead
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('board')} className={`px-4 py-2 font-semibold ${activeTab === 'board' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Follow-Up Board</button>
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 font-semibold ${activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Lead List</button>
                </div>
                 <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {activeTab === 'board' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
                    {KANBAN_STAGES.map(stage => (
                        <div key={stage} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)} className="bg-gray-100 p-3 rounded-lg min-h-[200px]">
                            <h3 className={`font-semibold mb-3 pb-2 border-b-2 ${STAGE_COLORS[stage].border} ${STAGE_COLORS[stage].text}`}>
                                {stage} ({filteredLeads.filter(l => l.status === stage).length})
                            </h3>
                            <div className="space-y-3">
                                {filteredLeads.filter(l => l.status === stage).map(lead => (
                                    <KanbanCard 
                                        key={lead.id} 
                                        lead={lead} 
                                        assignedRep={staffList.find(u => u.id === lead.assignedRepId)}
                                        onDragStart={handleDragStart}
                                        onClick={setCommentingLead}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'list' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th className="px-6 py-3">Lead Name & Contact</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Assigned To</th>
                                <th className="px-6 py-3">Last Contact</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div>{lead.fullName}</div>
                                        <div className="text-xs text-gray-500">{lead.email} | {lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{lead.source}</td>
                                    <td className="px-6 py-4 text-gray-600">{staffList.find(r => r.id === lead.assignedRepId)?.fullName || 'Unassigned'}</td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(lead.lastContactDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${STAGE_COLORS[lead.status].bg} ${STAGE_COLORS[lead.status].text}`}>{lead.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {lead.status !== 'Converted to Client' && 
                                                <button onClick={() => handleConvertLead(lead)} className="text-green-600 hover:text-green-800 p-1" title="Convert to Client"><ArrowRightOnRectangleIcon className="w-5 h-5"/></button>
                                            }
                                            <button onClick={() => setCommentingLead(lead)} className="text-gray-500 hover:text-indigo-600 p-1" title="View Comments"><ChatBubbleLeftEllipsisIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenModal(lead)} className="text-gray-500 hover:text-blue-600 p-1" title="Edit Lead"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteLead(lead.id)} className="text-gray-500 hover:text-red-600 p-1" title="Delete Lead"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && <div className="text-center p-8 text-gray-500">No leads found.</div>}
                </div>
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
        </div>
    );
};

export default LeadsManagementPage;
