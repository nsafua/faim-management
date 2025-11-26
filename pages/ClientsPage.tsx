

import React, { useState, useMemo, useCallback, ChangeEvent, FormEvent, useEffect } from 'react';
import { 
    ChevronDownIcon, 
    DocumentPlusIcon, 
    MagnifyingGlassIcon, 
    UploadIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    DocumentTextIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon 
} from '../components/icons/DummyIcons';
import { XIcon } from '../components/icons/XIcon';
import ClientListItem from '../components/ClientListItem';
import { Client, Milestone, Property, Invoice, ActivityLog } from '../types';
import ClientForm, { FormData } from '../components/ClientForm';
import CSVImportWizard from '../components/CSVImportWizard';


interface ClientsPageProps {
    onClientSelect: (client: Client) => void;
    clients: Client[];
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
    if (!formData.filledFormPdf && !existingClient?.filledFormPdf) return false;
    return true;
};

const ClientsPage: React.FC<ClientsPageProps> = ({ onClientSelect, clients, onSaveClient, onDeleteClient, properties, milestones, setActivePage, setClientForInvoice, invoices, addActivityLog }) => {
    const [isClientFormOpen, setClientFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isImportWizardOpen, setImportWizardOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletedClientInfo, setDeletedClientInfo] = useState<{ name: string; timeoutId: ReturnType<typeof setTimeout> } | null>(null);


    useEffect(() => {
        return () => {
            if (deletedClientInfo) {
                clearTimeout(deletedClientInfo.timeoutId);
            }
        };
    }, [deletedClientInfo]);


    const handleDeleteClient = useCallback(async (clientId: number) => {
        const clientToDelete = clients.find(c => c.id === clientId);
        if (clientToDelete) {
             await onDeleteClient(clientId);
        }
    }, [clients, onDeleteClient]);


    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) {
            return clients;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return clients.filter(client =>
            (client.name && client.name.toLowerCase().includes(lowercasedFilter)) ||
            (client.email && client.email.toLowerCase().includes(lowercasedFilter)) ||
            (client.phone && client.phone.includes(searchTerm)) ||
            (client.plot && client.plot.toLowerCase().includes(lowercasedFilter))
        );
    }, [clients, searchTerm]);

    const createClientObject = (formData: FormData, existingClient?: Client | null): Client => {
        const newId = existingClient ? existingClient.id : (clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1);
        
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
            id: newId,
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
            id: newId,
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

    const handleSaveClient = async (formData: FormData) => {
        const newClient = createClientObject(formData);
        await onSaveClient(newClient);
        setClientFormOpen(false);
        addActivityLog('Create', `Created new client: ${newClient.name}.`);
         if (!newClient.isComplete) {
            alert('Client record saved with incomplete information. Please complete all required fields to validate record.');
        }
    };

    const handleUpdateClient = async (formData: FormData) => {
        if (!editingClient) return;
        const updatedClient = createClientObject(formData, editingClient);
        const savedClient = await onSaveClient(updatedClient);
        setEditingClient(null);
        alert('Client information updated successfully.');
        addActivityLog('Update', `Updated client details for ${savedClient.name}.`);
        setClientForInvoice(savedClient);
        setActivePage('Account Management');
    };

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setClientFormOpen(true);
    };

    const handleSaveAndPay = async (formData: FormData) => {
        const newClient = createClientObject(formData);
        const savedClient = await onSaveClient(newClient);
        setClientForInvoice(savedClient);
        setActivePage('Account Management');
        setClientFormOpen(false);
        addActivityLog('Create', `Created new client with payment info: ${newClient.name}.`);
         if (!newClient.isComplete) {
            alert('Client record saved with incomplete information. Please complete all required fields to validate record.');
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


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Clients ({filteredClients.length})</h1>
                </div>
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setImportWizardOpen(true)}
                        className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative md:col-span-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, phone, or plot number..."
                            className="bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative md:col-span-1">
                         <select className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
                            <option>All Status</option>
                            <option>Active Client</option>
                            <option>Refunded</option>
                            <option>Reallocated</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                           <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                     <div className="relative md:col-span-1">
                         <select className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
                            <option>All Locations</option>
                            {properties.map(p => <option key={p.id}>{p.location}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                           <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Client List Header */}
             <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-left text-sm font-semibold text-gray-500">
                <div className="col-span-4">Client</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Location & Plot</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2">Payment Info</div>
                <div className="col-span-1">Actions</div>
            </div>

            {/* Client List */}
            <div className="space-y-4">
                {filteredClients.map(client => (
                    <ClientListItem key={client.id} client={client} onViewDetails={onClientSelect} onEdit={handleEditClient} onDelete={handleDeleteClient} milestones={milestones} />
                ))}
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