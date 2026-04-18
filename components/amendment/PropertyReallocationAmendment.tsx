
import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { AmendmentRequest } from '../../types';

interface PropertyReallocationAmendmentProps {
    data: NonNullable<AmendmentRequest['propertyReallocation']>;
    onChange: (field: string, value: string) => void;
}

export const PropertyReallocationAmendment: React.FC<PropertyReallocationAmendmentProps> = ({ data, onChange }) => {
    return (
        <Card title="3. Property Reallocation">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Current Allocation</label>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">{data.currentLocation}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Plot: {data.currentPlot}</div>
                </div>
                <div></div> {/* Spacer */}
                <Input 
                    id="newLocation" 
                    name="newLocation"
                    label="New Location" 
                    value={data.newLocation} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <Input 
                    id="newPlot" 
                    name="newPlot"
                    label="New Plot Number" 
                    value={data.newPlot} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
            </div>
        </Card>
    );
};
