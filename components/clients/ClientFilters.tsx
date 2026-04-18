
import React, { useState, useEffect } from 'react';
import { LoaderIcon } from '../icons/LoaderIcon';
import { MagnifyingGlassIcon, ChevronDownIcon, FunnelIcon } from '../icons/DummyIcons';
import { Property } from '../../types';

interface ClientFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isLoading: boolean;
    properties: Property[];
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({
    searchTerm, onSearchChange, isLoading, properties
}) => {
    // Persistence Logic
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('faim_clients_filter_collapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('faim_clients_filter_collapsed', String(isCollapsed));
    }, [isCollapsed]);

    return (
        <div className={`mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mx-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'py-2 px-4' : 'p-3'}`}>
            {/* Header / Toggle Row */}
            <div className="flex items-center justify-between">
                {isCollapsed && (
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 animate-in fade-in duration-300">
                        <FunnelIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {searchTerm ? `Results for: "${searchTerm}"` : 'Search & Filters Reclined'}
                        </span>
                    </div>
                )}
                
                <div className={`${isCollapsed ? '' : 'ml-auto'} flex items-center`}>
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group flex items-center gap-1.5"
                        title={isCollapsed ? "Expand Search Bar" : "Collapse Search Bar"}
                    >
                        {!isCollapsed && <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Minimize</span>}
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                </div>
            </div>

            {/* Collapsible Grid Content */}
            {!isCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mt-2 animate-in slide-in-from-top-1 duration-200">
                    <div className="md:col-span-4 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : <MagnifyingGlassIcon />}
                        </div>
                        <input
                            type="text"
                            placeholder="Search name, phone, or company..."
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white font-medium"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                            <option>All Client Types</option>
                            <option>Individual</option>
                            <option>Corporate/Group</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                            <option>Status</option>
                            <option>Active Client</option>
                            <option>Refunded</option>
                            <option>Reallocated</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                            <option>All Locations</option>
                            {properties.map(p => <option key={p.id}>{p.location}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
