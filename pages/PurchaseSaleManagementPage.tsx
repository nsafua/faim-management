import React, { useState } from 'react';
import { Property, Staff } from '../types';
import { 
    ArrowLeftIcon, 
    ArchiveBoxIcon, 
} from '../components/icons/DummyIcons';
import { useProperties } from '../hooks/useAppData';
import { useModal } from '../context/ModalContext';
import { MODAL_TYPES } from '../components/ModalManager';
import { ActivePortfolio } from '../components/purchase/ActivePortfolio';
import { ArchiveVault } from '../components/purchase/ArchiveVault';

interface PurchaseSaleManagementPageProps {
    onBack: () => void;
    properties: Property[];
    onSaveProperty: (property: Property) => Promise<void>;
    currentStaff: Staff;
    setActivePage: (page: string, context?: any) => void;
}

const PurchaseSaleManagementPage: React.FC<PurchaseSaleManagementPageProps> = ({ onBack, properties, onSaveProperty, currentStaff, setActivePage }) => {
    const { archiveProperty, restoreProperty, archivedProperties } = useProperties();
    const { openModal, closeModal } = useModal();
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

    const isCEO = currentStaff.roleId === 'CEO';

    const handleArchiveClick = (prop: Property) => {
        openModal(MODAL_TYPES.ARCHIVE_PROPERTY, {
            propertyName: prop.location,
            onConfirm: async () => {
                try {
                    await archiveProperty(prop.id, currentStaff.id);
                    closeModal(); // FIX: Explicitly close the modal on success
                } catch (error) {
                    alert("Failed to archive property. Please try again.");
                }
            }
        });
    };

    const handleRestoreClick = async (prop: Property) => {
        if (confirm(`Restore ${prop.location} to active listings?`)) {
            await restoreProperty(prop.id);
            alert(`${prop.location} restored successfully.`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2 tracking-tight uppercase">Purchase & Sale Management</h1>
                </div>
                
                {isCEO && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'active' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Active Portfolio
                        </button>
                        <button 
                            onClick={() => setViewMode('archived')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewMode === 'archived' ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ArchiveBoxIcon className="w-4 h-4" />
                            Archive Vault
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'active' ? (
                <ActivePortfolio 
                    properties={properties}
                    isCEO={isCEO}
                    setActivePage={setActivePage}
                    handleArchiveClick={handleArchiveClick}
                    onSaveProperty={onSaveProperty}
                />
            ) : (
                <ArchiveVault 
                    archivedProperties={archivedProperties}
                    handleRestoreClick={handleRestoreClick}
                />
            )}
            
            <div className="text-gray-500 italic text-sm border-t pt-4 border-gray-100 dark:border-gray-800">
                Authority prices and listing status published here are synchronized across all modules.
            </div>
        </div>
    );
};

export default PurchaseSaleManagementPage;