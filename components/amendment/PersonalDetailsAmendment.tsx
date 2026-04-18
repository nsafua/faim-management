
import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { PhoneInput } from '../ui/PhoneInput';
import { EmailInput } from '../ui/EmailInput';
import { AmendmentTextArea } from './AmendmentTextArea';
import { AmendmentRequest } from '../../types';

interface PersonalDetailsAmendmentProps {
    data: NonNullable<AmendmentRequest['personalDetails']>;
    onChange: (field: string, value: string) => void;
}

export const PersonalDetailsAmendment: React.FC<PersonalDetailsAmendmentProps> = ({ data, onChange }) => {
    return (
        <Card title="1. Personal Details">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth"
                    label="Date of Birth" 
                    type="date" 
                    value={data.dateOfBirth} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <Input 
                    id="currentAddress" 
                    name="currentAddress"
                    label="Current Residential Address" 
                    value={data.currentAddress} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <PhoneInput 
                    id="phone" 
                    name="phone"
                    label="Phone Number" 
                    value={data.phone} 
                    onChange={(val) => onChange('phone', val)} 
                />
                <EmailInput 
                    id="email" 
                    name="email"
                    label="Email" 
                    value={data.email} 
                    onChange={(val) => onChange('email', val)} 
                />
                <div className="sm:col-span-2">
                    <AmendmentTextArea 
                        id="newDetailsToUpdate" 
                        name="newDetailsToUpdate"
                        label="Additional Notes / Summary of Changes" 
                        value={data.newDetailsToUpdate} 
                        onChange={(e) => onChange(e.target.name, e.target.value)} 
                    />
                </div>
            </div>
        </Card>
    );
};
