
import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Property } from '../../types';

interface PlotIdentifierConfigProps {
    property: Property;
    isEditMode: boolean;
    onChange: (updates: Partial<Property>) => void;
}

export const PlotIdentifierConfig: React.FC<PlotIdentifierConfigProps> = ({ property, isEditMode, onChange }) => {
    const prefix = (property as any).plotPrefix || '';

    return (
        <Card title="Plot Identifier Configuration">
            <div className="space-y-4">
                <Input 
                    label="Plot Number Prefix" 
                    value={prefix} 
                    readOnly={!isEditMode}
                    onChange={(e) => onChange({ plotPrefix: e.target.value.toUpperCase() } as any)}
                    className={!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : "font-mono font-bold uppercase"}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="neutral">{prefix || 'REF'}-101</Badge>
                    <Badge variant="neutral">{prefix || 'REF'}-102</Badge>
                </div>
            </div>
        </Card>
    );
};
