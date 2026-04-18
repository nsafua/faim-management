
import React, { useState, useMemo, useEffect } from 'react';
import { Client } from '../types';
import { ArrowLeftIcon, FolderIcon, InformationCircleIcon } from '../components/icons/DummyIcons';
import { useMilestones } from '../hooks/useAppData';

// Modular Imports
import { ClientSelector } from '../components/documentation/ClientSelector';
import { MilestoneTimeline } from '../components/documentation/MilestoneTimeline';
import { DossierHealthCard } from '../components/documentation/DossierHealthCard';
import { QuickAuditCard } from '../components/documentation/QuickAuditCard';

interface ClientDocumentationPageProps {
    onBack?: () => void;
    clients: Client[];
    onSaveClient: (client: Client) => Promise<Client>;
    fixedClientId?: number; // Added to allow context-aware usage
}

const ClientDocumentationPage: React.FC<ClientDocumentationPageProps> = ({ onBack, clients, fixedClientId }) => {
    const [selectedClientId, setSelectedClientId] = useState<number | ''>(fixedClientId || '');
    
    // Sync if fixedClientId changes
    useEffect(() => {
        if (fixedClientId) setSelectedClientId(fixedClientId);
    }, [fixedClientId]);

    const { milestones, saveMilestone } = useMilestones(selectedClientId ? Number(selectedClientId) : undefined);

    const selectedClient = useMemo(() => 
        clients.find(c => c.id === Number(selectedClientId))
    , [clients, selectedClientId]);

    // Handle 3MP and IR automatic generation logic when viewing
    useEffect(() => {
        const autoTrigger = async () => {
            if (!selectedClient) return;
            const pfi = milestones.find(m => m.milestoneCode === 'PFI');
            if (pfi) {
                const pfiDate = new Date(pfi.dateCompleted);
                const threeMonthsLater = new Date(pfiDate);
                threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
                
                const now = new Date();
                
                // If 3 months passed since PFI, log 3MP and IR
                if (now >= threeMonthsLater) {
                    if (!milestones.some(m => m.milestoneCode === '3MP')) {
                        await saveMilestone({
                            clientId: selectedClient.id,
                            milestoneCode: '3MP',
                            dateCompleted: threeMonthsLater.toISOString().split('T')[0],
                            notes: 'System auto-generated milestone.'
                        });
                    }
                    if (!milestones.some(m => m.milestoneCode === 'IR')) {
                        await saveMilestone({
                            clientId: selectedClient.id,
                            milestoneCode: 'IR',
                            dateCompleted: now.toISOString().split('T')[0],
                            notes: 'Processing period completed.'
                        });
                    }
                }
            }
        };
        autoTrigger();
    }, [selectedClient, milestones, saveMilestone]);

    const isEmbedded = !!fixedClientId;

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${isEmbedded ? '' : 'p-2'}`}>
            {!isEmbedded && (
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                    </button>
                    <div className="flex items-center gap-4">
                        <FolderIcon className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Milestones Tracking</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Unified documentation lifecycle and fulfillment audit.</p>
                        </div>
                    </div>
                </div>
            )}

            {!isEmbedded && (
                <ClientSelector 
                    clients={clients} 
                    selectedClientId={selectedClientId} 
                    onSelect={setSelectedClientId} 
                />
            )}

            {selectedClient ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <MilestoneTimeline milestones={milestones} />

                    <div className="space-y-6">
                        <DossierHealthCard 
                            client={selectedClient} 
                            milestones={milestones} 
                        />

                        <QuickAuditCard 
                            onExport={() => window.print()} 
                        />
                    </div>
                </div>
            ) : (
                <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 opacity-50">
                    <InformationCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-black text-gray-400 uppercase tracking-widest">Select a client account to begin audit</p>
                </div>
            )}
        </div>
    );
};

export default ClientDocumentationPage;
