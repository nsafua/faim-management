
import React from 'react';

interface DetailSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export const DetailSection: React.FC<DetailSectionProps> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            {icon}
            {title}
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            {children}
        </dl>
    </div>
);
