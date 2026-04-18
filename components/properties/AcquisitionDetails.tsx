
import React from 'react';
import { Card } from '../ui/Card';
import { Input, Select, Textarea } from '../ui/Input';
import { Property } from '../../types';

interface AcquisitionDetailsProps {
    property: Property;
    isEditMode: boolean;
    onChange: (updates: Partial<Property>) => void;
}

export const AcquisitionDetails: React.FC<AcquisitionDetailsProps> = ({ property, isEditMode, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Acquisition Metadata">
            <div className="space-y-4">
                <Input 
                    label="Official Property Location" 
                    value={property.location} 
                    readOnly={!isEditMode}
                    onChange={(e) => onChange({ location: e.target.value })}
                    className={!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : ""}
                />
                <Select 
                    label="Registration Status" 
                    value={property.registrationStatus} 
                    disabled={!isEditMode}
                    onChange={(e) => onChange({ registrationStatus: e.target.value as any })}
                    className={!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : ""}
                >
                    <option value="Titled">Titled</option>
                    <option value="Indenture">Indenture</option>
                    <option value="Plotted">Plotted</option>
                </Select>
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acreage Capacity</label>
                    <Input 
                        type="number" 
                        value={property.size} 
                        readOnly={!isEditMode}
                        onChange={(e) => onChange({ size: Number(e.target.value) })}
                        className={!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : ""}
                    />
                </div>
            </div>
        </Card>

        <Card title="Official Descriptions">
            <Textarea 
                label="Detailed Property Remarks" 
                value={property.description} 
                rows={6}
                readOnly={!isEditMode}
                onChange={(e) => onChange({ description: e.target.value })}
                className={!isEditMode ? "bg-gray-50 dark:bg-gray-900/50" : ""}
            />
        </Card>
    </div>
);
