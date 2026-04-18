
import React from 'react';
import { Card } from '../ui/Card';
import { AmendmentRequest } from '../../types';

interface AmendmentTypeSelectorProps {
    amendmentTypes: AmendmentRequest['amendmentTypes'];
    onToggle: (type: keyof AmendmentRequest['amendmentTypes']) => void;
}

export const AmendmentTypeSelector: React.FC<AmendmentTypeSelectorProps> = ({ amendmentTypes, onToggle }) => {
    return (
        <Card title="Amendment Request Type">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please tick relevant sections and edit the current records.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.keys(amendmentTypes).map(key => {
                    const typeKey = key as keyof typeof amendmentTypes;
                    return (
                        <label key={key} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md transition-colors border ${amendmentTypes[typeKey] ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                            <input 
                                type="checkbox" 
                                checked={amendmentTypes[typeKey]} 
                                onChange={() => onToggle(typeKey)} 
                                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        </label>
                    );
                })}
            </div>
        </Card>
    );
};
