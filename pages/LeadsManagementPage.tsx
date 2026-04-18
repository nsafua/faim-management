
import React from 'react';
import { Lead, Client, Staff, Property, Milestone, ActivityLog, Role } from '../types';
import { 
    MagnifyingGlassIcon, 
    PlusCircleIcon, 
    UploadIcon
} from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import LeadForm from '../components/LeadForm';
import CSVImportWizard from '../components/CSVImportWizard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Modular Imports
import { LeadsBoard } from '../components/leads/LeadsBoard';
import { LeadsList } from '../components/leads/LeadsList';
import { CommentModal } from '../components/leads/CommentModal';
import { useLeadManagement } from '../hooks/useLeadManagement';

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
    const {
        activeTab, setActiveTab,
        isModalOpen,
        isImportWizardOpen, setImportWizardOpen,
        editingLead,
        searchTerm, setSearchTerm,
        leads, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage,
        commentingLead, setCommentingLead,
        leadToDelete, setLeadToDelete,
        salesReps,
        handleOpenModal, handleCloseModal, handleSaveLead,
        handleDeleteClick, confirmDeleteLead, handleConvertLead,
        handleDragStart, handleDragOver, handleDrop, handleAddComment, handleImportLeads
    } = useLeadManagement(onSaveLead, onDeleteLead, clients, onSaveClient, staffList, roles, milestones, currentStaff, addActivityLog);

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
