
import React from 'react';

export const ClientTableHead: React.FC = () => {
    return (
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-widest bg-transparent border-b border-gray-200 dark:border-gray-800">
            <div className="col-span-4">Client & Contact</div>
            <div className="col-span-4">Location</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2">Outstanding</div>
            <div className="col-span-1 text-right pr-2">Manage</div>
        </div>
    );
};
