
import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { AmendmentRequest } from '../../types';

interface IndentureAmendmentProps {
    data: NonNullable<AmendmentRequest['indentureDetails']>;
    onChange: (field: string, value: string) => void;
}

export const IndentureAmendment: React.FC<IndentureAmendmentProps> = ({ data, onChange }) => {
    return (
        <Card title="5. Indenture Details">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-2">Current Indenture Name: <strong>{data.currentName}</strong></p>
                </div>
                <Input 
                    id="newName" 
                    name="newName"
                    label="Name to Appear on Indenture" 
                    value={data.newName} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <Input 
                    id="newAddress" 
                    name="newAddress"
                    label="Address to Appear on Indenture" 
                    value={data.newAddress} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
            </div>
        </Card>
    );
};
