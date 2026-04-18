
import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Property } from '../../types';

interface FinancialConfigurationProps {
    property: Property;
    isEditMode: boolean;
    onChange: (updates: Partial<Property>) => void;
}

export const FinancialConfiguration: React.FC<FinancialConfigurationProps> = ({ property, isEditMode, onChange }) => (
    <Card title="Financial Configuration">
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Acquisition Cost (Total)</label>
                    <Input 
                        type="number" 
                        value={property.costPrice || 0} 
                        readOnly={!isEditMode}
                        onChange={(e) => onChange({ costPrice: Number(e.target.value) })}
                        className={!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : ""}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Selling Price (Market)</label>
                    <Input 
                        type="number" 
                        value={property.price} 
                        readOnly={!isEditMode}
                        onChange={(e) => onChange({ price: Number(e.target.value) })}
                        className={`font-bold ${!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : "text-blue-600"}`}
                    />
                </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Yield Analysis</p>
                <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                    {property.costPrice ? (((property.price - property.costPrice) / property.costPrice) * 100).toFixed(1) : 0}% Margin
                </p>
            </div>
        </div>
    </Card>
);
