import React from 'react';

interface ChartPlaceholderProps {
    title: string;
    change?: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, change }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {change && <span className="text-sm font-semibold text-green-500">{change}</span>}
            </div>
            <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-400 text-sm">Chart will be displayed here</p>
            </div>
        </div>
    );
};

export default ChartPlaceholder;