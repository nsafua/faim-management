
import React, { ChangeEvent } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { FileUploadField } from './FileUploadField';

interface LegalDocumentationProps {
    formData: any;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const LegalDocumentation: React.FC<LegalDocumentationProps> = ({ formData, handleChange, handleFileChange }) => {
    return (
        <Card title="Section 2: Official & Legal Documentation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="familyName" name="familyName" label="Official Name of Granting Family" value={formData.familyName} onChange={handleChange} />
                <Input id="nameOnSearch" name="nameOnSearch" label="Official Search Subject Name" value={formData.nameOnSearch} onChange={handleChange} />
                <FileUploadField id="officialSearchDoc" label="Official Search Result (Scan)" file={formData.officialSearchDoc} onChange={handleFileChange} accept=".pdf,image/*" />
                <FileUploadField id="sitePlanDoc" label="Certified Site Plan" file={formData.sitePlanDoc} onChange={handleFileChange} accept=".pdf,image/*" />
            </div>
        </Card>
    );
};
