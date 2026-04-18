
import React from 'react';
import { Client, Staff, AmendmentRequest } from '../types';
import { ArrowLeftIcon } from '../components/icons/DummyIcons';
import { Button } from '../components/ui/Button';

// Import sub-components
import { AmendmentTypeSelector } from '../components/amendment/AmendmentTypeSelector';
import { PersonalDetailsAmendment } from '../components/amendment/PersonalDetailsAmendment';
import { NextOfKinAmendment } from '../components/amendment/NextOfKinAmendment';
import { PropertyReallocationAmendment } from '../components/amendment/PropertyReallocationAmendment';
import { PaymentPlanAmendment } from '../components/amendment/PaymentPlanAmendment';
import { IndentureAmendment } from '../components/amendment/IndentureAmendment';
import { UploadSection } from '../components/amendment/UploadSection';
import { OfficeUseSection } from '../components/amendment/OfficeUseSection';

import { useAmendmentForm } from '../hooks/useAmendmentForm';

interface AmendmentFormPageProps {
    client: Client;
    onBack: () => void;
    onSave: (amendmentData: AmendmentRequest, updatedClient: Client) => void;
    currentStaff: Staff;
}

const AmendmentFormPage: React.FC<AmendmentFormPageProps> = ({ client, onBack, onSave, currentStaff }) => {
    const {
        formData,
        scannedFormPreview,
        formError,
        isSubmitting,
        handleTypeToggle,
        handleFormChange,
        handleFileChange,
        handleSubmit
    } = useAmendmentForm(client, currentStaff, onSave);

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Client Details
                </button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">Client Amendment & Reallocation Request</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Updating records for: <span className="font-semibold text-blue-600 dark:text-blue-400">{client.name}</span></p>
            </div>
            
            <form id="amendment-form" onSubmit={handleSubmit} className="space-y-6">
                
                <AmendmentTypeSelector 
                    amendmentTypes={formData.amendmentTypes} 
                    onToggle={handleTypeToggle} 
                />

                {formData.amendmentTypes.personalDetails && (
                    <PersonalDetailsAmendment 
                        data={formData.personalDetails} 
                        onChange={(field, val) => handleFormChange('personalDetails', field, val)} 
                    />
                )}
                
                {formData.amendmentTypes.nextOfKin && (
                    <NextOfKinAmendment 
                        data={formData.nextOfKinDetails} 
                        onChange={(field, val) => handleFormChange('nextOfKinDetails', field, val)} 
                    />
                )}

                {formData.amendmentTypes.propertyReallocation && (
                    <PropertyReallocationAmendment 
                        data={formData.propertyReallocation} 
                        onChange={(field, val) => handleFormChange('propertyReallocation', field, val)} 
                    />
                )}

                {formData.amendmentTypes.paymentPlan && (
                    <PaymentPlanAmendment 
                        data={formData.paymentPlanDetails} 
                        onChange={(field, val) => handleFormChange('paymentPlanDetails', field, val)} 
                    />
                )}

                {formData.amendmentTypes.indenture && (
                    <IndentureAmendment 
                        data={formData.indentureDetails} 
                        onChange={(field, val) => handleFormChange('indentureDetails', field, val)} 
                    />
                )}

                <UploadSection 
                    scannedFormPreview={scannedFormPreview} 
                    onFileChange={handleFileChange} 
                    error={formError} 
                />

                <OfficeUseSection 
                    data={formData.officeUse} 
                    onChange={(field, val) => handleFormChange('officeUse', field, val)} 
                />

            </form>

            <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end transition-colors">
                <Button type="submit" form="amendment-form" isLoading={isSubmitting}>
                    Submit Amendment Request
                </Button>
            </div>
        </div>
    );
};

export default AmendmentFormPage;
