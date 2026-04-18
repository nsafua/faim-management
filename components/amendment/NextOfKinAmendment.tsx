
import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { PhoneInput } from '../ui/PhoneInput';
import { EmailInput } from '../ui/EmailInput';
import { AmendmentRequest } from '../../types';

interface NextOfKinAmendmentProps {
    data: NonNullable<AmendmentRequest['nextOfKinDetails']>;
    onChange: (field: string, value: string) => void;
}

export const NextOfKinAmendment: React.FC<NextOfKinAmendmentProps> = ({ data, onChange }) => {
    return (
        <Card title="2. Next of Kin Details">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input 
                    id="kinName" 
                    name="name"
                    label="Next of Kin Name" 
                    value={data.name} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <Input 
                    id="kinAddress" 
                    name="address"
                    label="Address" 
                    value={data.address} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <PhoneInput 
                    id="kinPhone" 
                    name="phone"
                    label="Phone Number" 
                    value={data.phone} 
                    onChange={(val) => onChange('phone', val)} 
                />
                <Input 
                    id="kinRelationship" 
                    name="relationship"
                    label="Relationship" 
                    value={data.relationship} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <EmailInput 
                    id="kinEmail" 
                    name="email"
                    label="Email" 
                    value={data.email} 
                    onChange={(val) => onChange('email', val)} 
                />
            </div>
        </Card>
    );
};
