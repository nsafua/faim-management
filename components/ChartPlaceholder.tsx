
import React from 'react';

interface ChartPlaceholderProps {
    title: string;
    change?: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, change }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-1 transition-colors duration-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                {change && <span className="text-sm font-semibold text-green-500">{change}</span>}
            </div>
            <div className="h-60 bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Chart will be displayed here</p>
            </div>
        </div>
    );
};

export default ChartPlaceholder;
