
import React from 'react';
import { UploadIcon, DocumentPlusIcon } from '../icons/DummyIcons';

interface ClientListHeaderProps {
    clientCount: number;
    hasNextPage: boolean;
    onImportClick: () => void;
    onNewClientClick: () => void;
    headerOpacity: number;
    headerHeight: number;
}

export const ClientListHeader: React.FC<ClientListHeaderProps> = ({
    clientCount, hasNextPage, onImportClick, onNewClientClick, headerOpacity, headerHeight
}) => {
    return (
        <div style={{ opacity: headerOpacity, height: headerHeight, overflow: 'hidden' }} 
             className="flex flex-wrap items-center justify-between gap-4 px-1">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Clients ({clientCount}{hasNextPage && '+'})
            </h1>
            <div className="flex items-center gap-3">
                <button onClick={onImportClick} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm shadow-sm">
                    <UploadIcon className="w-4 h-4" /> Import
                </button>
                <button onClick={onNewClientClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm shadow-md">
                    <DocumentPlusIcon className="w-4 h-4" /> New Client
                </button>
            </div>
        </div>
    );
};
