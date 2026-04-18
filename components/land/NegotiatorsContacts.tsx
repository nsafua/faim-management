
import React, { ChangeEvent } from 'react';
import { Card } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';

interface NegotiatorsContactsProps {
    formData: any;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handlePhoneChange: (index: number, value: string) => void;
}

export const NegotiatorsContacts: React.FC<NegotiatorsContactsProps> = ({ formData, handleChange, handlePhoneChange }) => {
    return (
        <Card title="Section 3: Family Contacts & Negotiators">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Textarea id="leadNegotiators" name="leadNegotiators" label="Lead Negotiators / Facilitators" value={formData.leadNegotiators} onChange={handleChange} placeholder="Enter names of primary brokers..." containerClassName="lg:col-span-3"/>
                <Input id="familyContactPerson" name="familyContactPerson" label="Family Liaison Person" value={formData.familyContactPerson} onChange={handleChange} />
                <Input id="phone1" name="phone1" label="Primary Phone" type="tel" value={formData.phoneNumbers[0]} onChange={(e) => handlePhoneChange(0, e.target.value)} />
                <Input id="phone2" name="phone2" label="Secondary Phone" type="tel" value={formData.phoneNumbers[1]} onChange={(e) => handlePhoneChange(1, e.target.value)} />
                <Textarea id="additionalNotes" name="additionalNotes" label="Acquisition Remarks" value={formData.additionalNotes} onChange={handleChange} containerClassName="lg:col-span-3" />
            </div>
        </Card>
    );
};
