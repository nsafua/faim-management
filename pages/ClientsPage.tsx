
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
    ChevronDownIcon, 
    DocumentPlusIcon, 
    MagnifyingGlassIcon, 
    UploadIcon 
} from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import ClientListItem from '../components/ClientListItem';
import { Client, Milestone, Property, Invoice, ActivityLog } from '../types';
import ClientForm, { FormData } from '../components/ClientForm';
import CSVImportWizard from '../components/CSVImportWizard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useClients } from '../hooks/useAppData';
import { uploadFile } from '../services/storageService';

interface ClientsPageProps {
    onClientSelect: (client: Client) => void;
    // clients prop is removed as we use hook internaly for search
    clients?: Client[]; 
    onSaveClient: (client: Client) => Promise<Client>;
    onDeleteClient: (clientId: number) => Promise<void>;
    properties: Property[];
    milestones: Milestone[];
    setActivePage: (page: string) => void;
    setClientForInvoice: (client: Client) => void;
    invoices: Invoice[];
    addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const isClientDataComplete = (formData: FormData, existingClient?: Client | null): boolean => {
    const requiredFields: (keyof FormData)[] = [ 'surname', 'otherNames', 'currentAddress', 'telephone', 'kinName', 'kinPhone', 'witnessName', 'witnessPhone', 'witnessAddress', 'location', 'plotNumber', 'indentureName', 'indentureAddress', 'salesRep', 'salesManager', 'accountsHead', 'clerk' ];
    for (const field of requiredFields) {
        if (!formData[field] || String(formData[field]).trim() === '') return false;
    }
    return true;
};

const ClientsPage: React.FC<ClientsPageProps> = ({ onClientSelect, onSaveClient, onDeleteClient, properties, milestones, setActivePage, setClientForInvoice, invoices, addActivityLog }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    // Fetch data via hook using debounced term
    const { clients, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useClients(debouncedSearchTerm);

    const [isClientFormOpen, setClientFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isImportWizardOpen, setImportWizardOpen] = useState(false);
    const [deletedClientInfo, setDeletedClientInfo] = useState<{ name: string; timeoutId: ReturnType<typeof setTimeout> } | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    
    // Virtualization State
    const listRef = useRef<List>(null);
    const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

    // Debounce Effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const toggleExpand = (id: number, index: number) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
        if (listRef.current) {
            listRef.current.resetAfterIndex(index);
        }
    };

    const getItemSize = (index: number) => {
        const client = clients[index];
        return expandedIds[client?.id] ? 140 : 100; // Expanded vs Collapsed height approx
    };

    useEffect(() => {
        return () => {
            if (deletedClientInfo) {
                clearTimeout(deletedClientInfo.timeoutId);
            }
        };
    }, [deletedClientInfo]);

    const handleDeleteClick = useCallback((clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setClientToDelete(client);
        }
    }, [clients]);

    const confirmDeleteClient = async () => {
        if (clientToDelete) {
            await onDeleteClient(clientToDelete.id);
            addActivityLog('Delete', `Deleted client: ${clientToDelete.name}`);
            
            // Show toast
            const timeoutId = setTimeout(() => setDeletedClientInfo(null), 3000);
            setDeletedClientInfo({ name: clientToDelete.name, timeoutId });
            
            setClientToDelete(null);
        }
    };

    const createClientObject = (formData: FormData, id: number, existingClient?: Client | null): Client => {
        const fullName = `${formData.surname} ${formData.otherNames}`;
        const nameParts = fullName.split(' ');
        const initials = (nameParts[0]?.[0] || '' + nameParts[nameParts.length - 1]?.[0] || '').toUpperCase();

        const selectedProperty = properties.find(p => p.location === formData.location);
        let propertyPrice = selectedProperty ? selectedProperty.price : 200000;
        
        const plotCount = formData.plotNumber.split(',').map(p => p.trim()).filter(Boolean).length || 1;
        let baseTotal = propertyPrice * plotCount;
    
        let promoDetails: string | undefined = undefined;
        if (selectedProperty && selectedProperty.discount && new Date(selectedProperty.discount.endDate) >= new Date()) {
            baseTotal *= (1 - selectedProperty.discount.percentage / 100);
            promoDetails = `${selectedProperty.discount.percentage}% discount applied (Ends ${selectedProperty.discount.endDate})`;
        }
        
        const isComplete = isClientDataComplete(formData, existingClient);
        
        const baseClient = existingClient || {
            id: id,
            status: 'Active Client',
            stage: milestones[0]?.acronym || 'N/A',
            payment: {
                total: baseTotal,
                paid: 0,
                balance: baseTotal,
                dueDate: 'N/A',
                planType: 'N/A',
                promoDetails: promoDetails,
                paymentHistory: [],
                installments: [],
            },
            interactions: [],
            documentation: { status: 'Pending' },
             officeUse: {
                commission: { type: 'Percentage', amount: 0, status: 'Pending' }
            }
        };

        return {
            ...baseClient,
            id: id,
            name: fullName,
            surname: formData.surname,
            otherNames: formData.otherNames,
            initials: initials,
            regDate: formData.paymentDate,
            email: formData.email,
            phone: formData.telephone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender as Client['gender'],
            location: formData.location,
            plot: formData.plotNumber,
            photo: formData.photo,
            propertyType: formData.propertyType,
            plannedDevelopmentYear: formData.plannedDevelopmentYear,
            professionalDetails: {
                placeOfWork: formData.placeOfWork,
                profession: formData.profession,
                position: formData.position,
            },
            witness: {
                name: formData.witnessName,
                address: formData.witnessAddress,
                phone: formData.witnessPhone,
            },
            nextOfKin: {
                name: formData.kinName,
                phone: formData.kinPhone,
                relationship: formData.kinRelationship,
                email: formData.kinEmail,
                address: formData.kinAddress,
            },
            indenture: {
                name: formData.indentureName,
                address: formData.indentureAddress,
            },
            officeUse: {
                ...baseClient.officeUse,
                salesRep: formData.salesRep,
                salesManager: formData.salesManager,
                accountsHead: formData.accountsHead,
                clerk: formData.clerk,
            },
            isComplete: isComplete,
            filledFormPdf: formData.filledFormPdf,
        };
    };

    const handleSaveClient = async (formData: FormData, files?: { photo?: File | null, pdf?: File | null }) => {
        try {
            // Determine ID for new client
            const newId = (clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1);
            
            // Upload Photo
            let photoUrl = formData.photo;
            if (files?.photo) {
                photoUrl = await uploadFile(files.photo, `clients/${newId}/photos/${files.photo.name}`);
            }

            // Upload PDF
            let pdfUrl = formData.filledFormPdf;
            if (files?.pdf) {
                pdfUrl = await uploadFile(files.pdf, `clients/${newId}/documents/${files.pdf.name}`);
            }

            const updatedFormData = { ...formData, photo: photoUrl, filledFormPdf: pdfUrl };
            const newClient = createClientObject(updatedFormData, newId);
            
            await onSaveClient(newClient);
            setClientFormOpen(false);
            addActivityLog('Create', `Created new client: ${newClient.name}.`);
            if (!newClient.isComplete) {
                alert('Client record saved with incomplete information. Please complete all required fields to validate record.');
            }
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Failed to save client. Please try again.");
        }
    };

    const handleUpdateClient = async (formData: FormData, files?: { photo?: File | null, pdf?: File | null }) => {
        if (!editingClient) return;
        try {
            // Upload Photo
            let photoUrl = formData.photo;
            if (files?.photo) {
                photoUrl = await uploadFile(files.photo, `clients/${editingClient.id}/photos/${files.photo.name}`);
            }

            // Upload PDF
            let pdfUrl = formData.filledFormPdf;
            if (files?.pdf) {
                pdfUrl = await uploadFile(files.pdf, `clients/${editingClient.id}/documents/${files.pdf.name}`);
            }

            const updatedFormData = { ...formData, photo: photoUrl, filledFormPdf: pdfUrl };
            const updatedClient = createClientObject(updatedFormData, editingClient.id, editingClient);
            const savedClient = await onSaveClient(updatedClient);
            setEditingClient(null);
            alert('Client information updated successfully.');
            addActivityLog('Update', `Updated client details for ${savedClient.name}.`);
            setClientForInvoice(savedClient);
            setActivePage('Account Management');
        } catch (error) {
            console.error("Error updating client:", error);
            alert("Failed to update client. Please try again.");
        }
    };

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setClientFormOpen(true);
    };

    const handleSaveAndPay = async (formData: FormData, files?: { photo?: File | null, pdf?: File | null }) => {
        try {
            const newId = (clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1);
            
            let photoUrl = formData.photo;
            if (files?.photo) {
                photoUrl = await uploadFile(files.photo, `clients/${newId}/photos/${files.photo.name}`);
            }

            let pdfUrl = formData.filledFormPdf;
            if (files?.pdf) {
                pdfUrl = await uploadFile(files.pdf, `clients/${newId}/documents/${files.pdf.name}`);
            }

            const updatedFormData = { ...formData, photo: photoUrl, filledFormPdf: pdfUrl };
            const newClient = createClientObject(updatedFormData, newId);
            
            const savedClient = await onSaveClient(newClient);
            setClientForInvoice(savedClient);
            setActivePage('Account Management');
            setClientFormOpen(false);
            addActivityLog('Create', `Created new client with payment info: ${newClient.name}.`);
            if (!newClient.isComplete) {
                alert('Client record saved with incomplete information. Please complete all required fields to validate record.');
            }
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Failed to save client. Please try again.");
        }
    };

    const handleImportClients = (importedData: any[]) => {
      const highestId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;

      const newClients: Client[] = importedData.map((data, index) => {
          const fullName = `${data.surname || ''} ${data.otherNames || ''}`.trim();
          const nameParts = fullName.split(' ');
          const initials = (nameParts[0]?.[0] || '' + (nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] : '') || '').toUpperCase();
          const selectedProperty = properties.find(p => p.location.toLowerCase() === (data.location || '').toLowerCase());
          let propertyPrice = selectedProperty ? selectedProperty.price : 200000;
          const plotCount = (data.plotNumber || '').split(',').map(p => p.trim()).filter(Boolean).length || 1;
          let baseTotal = propertyPrice * plotCount;

          let promoDetails: string | undefined = undefined;
          if (selectedProperty && selectedProperty.discount && new Date(selectedProperty.discount.endDate) >= new Date()) {
              baseTotal *= (1 - selectedProperty.discount.percentage / 100);
              promoDetails = `${selectedProperty.discount.percentage}% discount applied (Ends ${selectedProperty.discount.endDate})`;
          }
          
          const requiredCsvFields = [ 'surname', 'otherNames', 'currentAddress', 'telephone', 'kinName', 'kinPhone', 'witnessName', 'witnessPhone', 'witnessAddress', 'location', 'plotNumber', 'indentureName', 'indentureAddress', 'salesRep', 'salesManager', 'accountsHead', 'clerk' ];
          const isRecordComplete = requiredCsvFields.every(field => data[field] && data[field].trim() !== '');

          return {
              id: highestId + 1 + index,
              name: fullName,
              surname: data.surname || '',
              otherNames: data.otherNames || '',
              initials: initials,
              regDate: data.paymentDate || new Date().toISOString().split('T')[0],
              email: data.email || '',
              phone: data.telephone || '',
              dateOfBirth: data.dateOfBirth || '',
              gender: (data.gender as Client['gender']) || undefined,
              location: data.location || '',
              plot: data.plotNumber || '',
              photo: undefined,
              propertyType: (data.propertyType as Client['propertyType']) || undefined,
              plannedDevelopmentYear: data.plannedDevelopmentYear || undefined,
              professionalDetails: {
                  placeOfWork: data.placeOfWork || '',
                  profession: data.profession || '',
                  position: data.position || '',
              },
              status: 'Active Client',
              stage: milestones[0]?.acronym || 'N/A',
              payment: {
                  total: baseTotal,
                  paid: 0,
                  balance: baseTotal,
                  dueDate: 'N/A',
                  planType: 'N/A',
                  paymentHistory: [],
                  installments: [],
                  promoDetails: promoDetails,
              },
              interactions: [],
              witness: { name: data.witnessName || '', address: data.witnessAddress || '', phone: data.witnessPhone || '' },
              nextOfKin: { 
                  name: data.kinName || '', 
                  phone: data.kinPhone || '', 
                  relationship: data.kinRelationship || '',
                  email: data.kinEmail || '',
                  address: data.kinAddress || '',
                },
              indenture: { name: data.indentureName || '', address: data.indentureAddress || '' },
              officeUse: { 
                  salesRep: data.salesRep || 'Imported', 
                  salesManager: data.salesManager || 'N/A', 
                  accountsHead: data.accountsHead || 'N/A', 
                  clerk: data.clerk || 'N/A', 
                  commission: { type: 'Percentage', amount: 0, status: 'Pending' } 
                },
              documentation: { status: 'Pending' },
              isComplete: isRecordComplete, // Based on CSV fields only
              filledFormPdf: null, // PDF cannot be imported
          };
      });

      Promise.all(newClients.map(c => onSaveClient(c))).then(() => {
          addActivityLog('Import', `Imported ${newClients.length} new clients from a CSV file.`);
      });
    };

    const handleCloseForm = () => {
        setClientFormOpen(false);
        setEditingClient(null);
    }
    
    const requiredCsvHeaders = [ 'surname', 'otherNames', 'dateOfBirth', 'currentAddress', 'telephone', 'email', 'gender', 'placeOfWork', 'profession', 'position', 'kinName', 'kinAddress', 'kinPhone', 'kinRelationship', 'kinEmail', 'witnessName', 'witnessAddress', 'witnessPhone', 'paymentDate', 'paymentMethod', 'location', 'plotNumber', 'propertyType', 'plannedDevelopmentYear', 'indentureName', 'indentureAddress', 'salesRep', 'salesManager', 'accountsHead', 'clerk' ];
    const sampleHeaders = requiredCsvHeaders.join(',');
    const sampleData = `"Doe","John","1990-01-15","123 Main St, Accra","0241234567","john.doe@example.com","Male","Tech Corp","Engineer","Senior","Doe,Jane","123 Main St, Accra","0247654321","Spouse","jane.doe@example.com","Smith,Adam","456 Oak Ave, Accra","0559876543","2024-08-01","Bank Transfer","East Legon Hills","ELH-205","Residential","2025","John K. Doe","P.O. Box 123, Accra","Sales Rep A","Manager B","Accountant C","Clerk D"`;

    // Render Row for Virtual List
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const client = clients[index];
        if (!client) return null;
        return (
            <ClientListItem 
                key={client.id} 
                client={client} 
                onViewDetails={onClientSelect} 
                onEdit={handleEditClient} 
                onDelete={handleDeleteClick} 
                milestones={milestones}
                style={style}
                isExpanded={!!expandedIds[client.id]}
                onToggleExpand={() => toggleExpand(client.id, index)}
            />
        );
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Clients ({clients.length}{hasNextPage && '+'})</h1>
                </div>
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setImportWizardOpen(true)}
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <UploadIcon className="w-5 h-5" />
                        Import
                    </button>
                    <button 
                        onClick={() => { setEditingClient(null); setClientFormOpen(true); }}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <DocumentPlusIcon className="w-5 h-5" />
                        Add New Client
                    </button>
                 </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative md:col-span-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : <MagnifyingGlassIcon />}
                        </div>
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Simplified Filters for now as they require server side implementation too */}
                    <div className="relative md:col-span-1">
                         <select className="appearance-none w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500">
                            <option>All Status</option>
                            <option>Active Client</option>
                            <option>Refunded</option>
                            <option>Reallocated</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                           <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                     <div className="relative md:col-span-1">
                         <select className="appearance-none w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500">
                            <option>All Locations</option>
                            {properties.map(p => <option key={p.id}>{p.location}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                           <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Client List Header */}
             <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                <div className="col-span-4">Client</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Location & Plot</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2">Payment Info</div>
                <div className="col-span-1">Actions</div>
            </div>

            {/* Virtualized List */}
            <div className="flex-grow flex flex-col">
                <div className="flex-grow">
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                ref={listRef}
                                height={height}
                                itemCount={clients.length}
                                itemSize={getItemSize}
                                width={width}
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                </div>
                
                {/* Pagination Controls */}
                <div className="py-2 text-center border-t border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Loading data...</span>
                    ) : hasNextPage ? (
                        <button 
                            onClick={() => fetchNextPage()} 
                            disabled={isFetchingNextPage}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                            {isFetchingNextPage ? 'Loading more...' : 'Load More Clients'}
                        </button>
                    ) : clients.length > 0 ? (
                        <span className="text-gray-400 text-sm">All clients loaded</span>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">No clients found matching your criteria.</span>
                    )}
                </div>
            </div>
            
            {deletedClientInfo && (
                <div className="fixed bottom-5 right-5 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in">
                    <span>Client "{deletedClientInfo.name}" deleted.</span>
                </div>
            )}

            <ClientForm
                isOpen={isClientFormOpen}
                onClose={handleCloseForm}
                onSave={editingClient ? handleUpdateClient : handleSaveClient}
                onSaveAndPay={handleSaveAndPay}
                properties={properties}
                editingClient={editingClient}
            />
            
            <CSVImportWizard
                isOpen={isImportWizardOpen}
                onClose={() => setImportWizardOpen(false)}
                onImport={handleImportClients}
                requiredHeaders={requiredCsvHeaders.filter(h => !['dateOfBirth', 'email', 'gender', 'placeOfWork', 'profession', 'position', 'kinAddress', 'kinEmail', 'propertyType', 'plannedDevelopmentYear', 'paymentMethod'].includes(h))}
                sampleHeaders={sampleHeaders}
                sampleData={sampleData}
                wizardTitle="Import Clients from CSV"
            />
            
            <DeleteConfirmationModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={confirmDeleteClient}
                itemName={clientToDelete?.name || ''}
                itemType="Client"
            />

            <style>
                {`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default ClientsPage;
