import React, { FormEvent } from 'react';
import { Client, Property } from '../types';
import { XIcon } from './icons/XIcon';
import { FormData } from './client-form/types';
import { ClientFormStepper } from './client-form/ClientFormStepper';
import { Step1PersonalDetails } from './client-form/Step1PersonalDetails';
import { Step2PropertyDetails } from './client-form/Step2PropertyDetails';
import { Step3OfficeDetails } from './client-form/Step3OfficeDetails';
import { useClientFormState } from '../hooks/useClientFormState';

export type { FormData };

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, files?: { photo?: File | null, pdf?: File | null }) => Promise<Client | void>;
  onSaveAndPay: (formData: FormData, files?: { photo?: File | null, pdf?: File | null }) => void;
  properties: Property[];
  editingClient?: Client | null;
  clients: Client[];
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, onSaveAndPay, properties, editingClient, clients }) => {
    const {
        step,
        formData,
        setFormData,
        photoPreview,
        pdfFile,
        photoFile,
        touched,
        isProcessing,
        setIsProcessing,
        availablePlotsForLocation,
        errors,
        handleBlur,
        handleChange,
        handlePhoneChange,
        handlePlotsChange,
        handleLocationChange,
        togglePlotSelection,
        handlePhotoChange,
        handlePdfChange,
        handleNext,
        handleBack,
    } = useClientFormState(isOpen, editingClient, clients, properties);

    const handleAddPaymentDetails = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.surname || !formData.otherNames || !formData.location || !formData.plotNumber) {
            alert("Critical details (Name, Location, Plot) are required to finish registration.");
            return;
        }
        setIsProcessing(true);
        try {
            onSaveAndPay(formData, { photo: photoFile, pdf: pdfFile });
        } catch (error) {
            console.error("Save failed:", error);
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    const isPropertyAvailable = properties && properties.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transform transition-all">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingClient ? 'Edit Client Details' : 'New Client Registration'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <ClientFormStepper currentStep={step} />
                
                <div className="p-6 overflow-y-auto flex-grow">
                    {step === 1 && (
                        <Step1PersonalDetails 
                            formData={formData}
                            touched={touched}
                            errors={errors}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            handlePhoneChange={handlePhoneChange}
                            handlePhotoChange={handlePhotoChange}
                            setFormData={setFormData}
                            photoPreview={photoPreview}
                            photoFile={photoFile}
                        />
                    )}
                    {step === 2 && (
                        <Step2PropertyDetails 
                            formData={formData}
                            touched={touched}
                            errors={errors}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            handleLocationChange={handleLocationChange}
                            handlePlotsChange={handlePlotsChange}
                            handlePdfChange={handlePdfChange}
                            togglePlotSelection={togglePlotSelection}
                            properties={properties}
                            availablePlotsForLocation={availablePlotsForLocation}
                            isPropertyAvailable={isPropertyAvailable}
                            pdfFile={pdfFile}
                        />
                    )}
                    {step === 3 && (
                        <Step3OfficeDetails 
                            formData={formData}
                            touched={touched}
                            errors={errors}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                        />
                    )}
                </div>

                <div className="flex justify-between items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
                    <div>{step > 1 && <button type="button" onClick={handleBack} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 transition-colors">Back</button>}</div>
                    <div>
                        {step < 3 ? (
                             <button type="button" onClick={handleNext} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Next Step</button>
                        ) : (
                            <button type="button" onClick={handleAddPaymentDetails} disabled={isProcessing} className="bg-blue-600 text-white font-black uppercase tracking-widest py-2.5 px-8 rounded-lg hover:bg-blue-700 transition-all shadow-lg disabled:bg-gray-400">
                                {isProcessing ? 'Saving...' : 'Finish Registration'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};

export default ClientForm;