
import React from 'react';
import { Client, Milestone, Property, Invoice, ActivityLog } from '../types';
import ClientForm from '../components/ClientForm';
import CSVImportWizard from '../components/CSVImportWizard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Modular Imports
import { ClientListHeader } from '../components/clients/ClientListHeader';
import { ClientFilters } from '../components/clients/ClientFilters';
import { ClientTableHead } from '../components/clients/ClientTableHead';
import { ClientsList } from '../components/clients/ClientsList';
import { useClientManagement } from '../hooks/useClientManagement';

interface ClientsPageProps {
    onClientSelect: (client: Client) => void;
    clients?: Client[]; 
    onSaveClient: (client: Client) => Promise<Client>;
    onDeleteClient: (clientId: number) => Promise<void>;
    properties: Property[];
    milestones: Milestone[];
    setActivePage: (page: string, context?: any) => void;
    setClientForInvoice: (client: Client | null) => void;
    invoices: Invoice[];
    addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ onClientSelect, onSaveClient, onDeleteClient, properties, milestones, setActivePage, setClientForInvoice, invoices, addActivityLog }) => {
    
    const {
        searchTerm, setSearchTerm,
        debouncedSearchTerm,
        clients, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage,
        isClientFormOpen, setClientFormOpen,
        editingClient, setEditingClient,
        isImportWizardOpen, setImportWizardOpen,
        clientToDelete, setClientToDelete,
        listRef, expandedIds,
        headerOpacity, headerHeight, controlsTranslate,
        handleScroll, toggleExpand, handleDeleteClick, confirmDeleteClient, handleSaveClientAndRedirect
    } = useClientManagement(onClientSelect, onSaveClient, onDeleteClient, properties, milestones, addActivityLog);

    const requiredCsvHeaders = [ 'surname', 'otherNames', 'dateOfBirth', 'currentAddress', 'telephone', 'email', 'gender', 'placeOfWork', 'profession', 'position', 'kinName', 'kinAddress', 'kinPhone', 'kinRelationship', 'kinEmail', 'witnessName', 'witnessAddress', 'witnessPhone', 'paymentDate', 'paymentMethod', 'location', 'plotNumber', 'propertyType', 'plannedDevelopmentYear', 'indentureName', 'indentureAddress', 'salesRep', 'salesManager', 'accountsHead', 'clerk' ];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
            {/* STICKY HEADER WRAPPER */}
            <div className="sticky top-0 z-30 bg-gray-100 dark:bg-gray-950 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 pb-1">
                <div className="transition-all duration-300 ease-out"
                     style={{ transform: `translateY(${controlsTranslate}px)` }}>
                    
                    <ClientListHeader 
                        clientCount={clients.length} 
                        hasNextPage={hasNextPage} 
                        onImportClick={() => setImportWizardOpen(true)}
                        onNewClientClick={() => { setEditingClient(null); setClientFormOpen(true); }}
                        headerOpacity={headerOpacity}
                        headerHeight={headerHeight}
                    />

                    <ClientFilters 
                        searchTerm={searchTerm} 
                        onSearchChange={setSearchTerm} 
                        isLoading={isLoading} 
                        properties={properties} 
                    />

                    <ClientTableHead />
                </div>
            </div>

            <ClientsList 
                clients={clients}
                onViewDetails={onClientSelect}
                onEdit={(c) => { setEditingClient(c); setClientFormOpen(true); }}
                onDelete={handleDeleteClick}
                milestones={milestones}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                onScroll={handleScroll}
                listRef={listRef}
            />
            
            {hasNextPage && !debouncedSearchTerm && (
                <div className="py-3 text-center border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <button 
                        onClick={() => fetchNextPage()} 
                        disabled={isFetchingNextPage}
                        className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest hover:underline disabled:opacity-50"
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Load More Results'}
                    </button>
                </div>
            )}

            <ClientForm
                isOpen={isClientFormOpen}
                onClose={() => { setClientFormOpen(false); setEditingClient(null); }}
                onSave={handleSaveClientAndRedirect}
                onSaveAndPay={handleSaveClientAndRedirect}
                properties={properties}
                editingClient={editingClient}
                clients={clients}
            />
            
            <CSVImportWizard
                isOpen={isImportWizardOpen}
                onClose={() => setImportWizardOpen(false)}
                onImport={() => {}}
                requiredHeaders={requiredCsvHeaders}
                sampleHeaders=""
                sampleData=""
                wizardTitle="Import Client Data"
            />
            
            <DeleteConfirmationModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={confirmDeleteClient}
                itemName={clientToDelete?.name || ''}
                itemType="Client"
            />
        </div>
    );
};

export default ClientsPage;
