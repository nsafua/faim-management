
import React, { ChangeEvent } from 'react';
import { FormData } from './types';
import { SmartInputField } from './ClientFormFields';
import { FormSection } from './FormSection';

interface Step3OfficeDetailsProps {
    formData: FormData;
    touched: Partial<Record<keyof FormData, boolean>>;
    errors: Partial<Record<keyof FormData, string>>;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const Step3OfficeDetails: React.FC<Step3OfficeDetailsProps> = ({
    formData, touched, errors, handleChange, handleBlur
}) => {
    return (
        <div className="animate-in fade-in duration-300">
             <FormSection title="Internal Office Review">
                <SmartInputField id="salesRep" label="Intermediary Sales Rep" value={formData.salesRep} onChange={handleChange} onBlur={handleBlur} required error={touched.salesRep ? errors.salesRep : undefined} isTouched={touched.salesRep}/>
                <SmartInputField id="salesManager" label="Approving Manager" value={formData.salesManager} onChange={handleChange} onBlur={handleBlur} required error={touched.salesManager ? errors.salesManager : undefined} isTouched={touched.salesManager}/>
                <SmartInputField id="accountsHead" label="Accounts Approval" value={formData.accountsHead} onChange={handleChange} onBlur={handleBlur} required error={touched.accountsHead ? errors.accountsHead : undefined} isTouched={touched.accountsHead}/>
                <SmartInputField id="clerk" label="Receiving Clerk" value={formData.clerk} onChange={handleChange} onBlur={handleBlur} required error={touched.clerk ? errors.clerk : undefined} isTouched={touched.clerk}/>
            </FormSection>
        </div>
    );
};
