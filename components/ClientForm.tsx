import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback, useMemo } from 'react';
import { Client, Property } from '../types';
import { XIcon } from './icons/XIcon';
import { FormData } from './client-form/types';
import { ClientFormStepper } from './client-form/ClientFormStepper';
import { Step1PersonalDetails } from './client-form/Step1PersonalDetails';
import { Step2PropertyDetails } from './client-form/Step2PropertyDetails';
import { Step3OfficeDetails } from './client-form/Step3OfficeDetails';

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

const initialFormData: FormData = {
    surname: '',
    otherNames: '',
    dateOfBirth: '',
    currentAddress: '',
    telephone: '',
    email: '',
    gender: 'Other',
    photo: '',
    placeOfWork: '',
    profession: '',
    position: '',
    kinName: '',
    kinAddress: '',
    kinPhone: '',
    kinRelationship: '',
    kinEmail: '',
    witnessName: '',
    witnessAddress: '',
    witnessPhone: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    location: '',
    propertyType: 'Residential',
    plotNumber: '',
    numberOfPlots: '1',
    plannedDevelopmentYear: new Date().getFullYear().toString(),
    filledFormPdf: null,
    indentureName: '',
    indentureAddress: '',
    salesRep: '',
    salesManager: '',
    accountsHead: '',
    clerk: '',
    price: '',
};

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, onSaveAndPay, properties, editingClient, clients }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Authority Base Price
    const basePrice = useMemo(() => {
        const match = properties.find(p => p.location === formData.location);
        return match ? match.price : 0;
    }, [formData.location, properties]);

    // Availability Cross-Reference
    const takenPlots = useMemo(() => {
        const taken = new Set<string>();
        clients.forEach(c => {
            if (c.plot && c.plot !== 'N/A') {
                c.plot.split(',').forEach(p => taken.add(p.trim().toUpperCase()));
            }
        });
        return taken;
    }, [clients]);

    const availablePlotsForLocation = useMemo(() => {
        const prop = properties.find(p => p.location === formData.location);
        if (!prop || !prop.inventory) return [];
        
        const allPlots: { plotNumber: string; isTaken: boolean }[] = [];
        prop.inventory.forEach((inv: any) => {
            const prefix = inv.zone || 'P1';
            for (let i = 1; i <= inv.count; i++) {
                const pNum = `${prefix}-${i}`;
                allPlots.push({
                    plotNumber: pNum,
                    isTaken: takenPlots.has(pNum) && (!editingClient || !editingClient.plot.split(',').map(p => p.trim().toUpperCase()).includes(pNum))
                });
            }
        });
        return allPlots;
    }, [formData.location, properties, takenPlots, editingClient]);

    // Handle Plot Selection Logic
    const handlePlotsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const num = parseInt(value);
        setFormData(prev => ({ ...prev, numberOfPlots: value }));
        setTouched(prev => ({ ...prev, numberOfPlots: true }));
        if (!formData.location) return;
        if (isNaN(num) || num <= 0) return;
        const calculatedPrice = basePrice * num;
        setFormData(prev => ({ ...prev, numberOfPlots: value, price: calculatedPrice.toString() }));
    };

    const handleLocationChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const loc = e.target.value;
        const match = properties.find(p => p.location === loc);
        const pCount = parseInt(formData.numberOfPlots) || 1;
        const priceValue = match ? (match.price * pCount).toString() : '';
        setFormData(prev => ({ ...prev, location: loc, price: priceValue, plotNumber: '' }));
    };

    const togglePlotSelection = (plotNumber: string) => {
        const current = formData.plotNumber.split(',').map(x => x.trim()).filter(Boolean);
        const updated = current.includes(plotNumber) 
            ? current.filter(x => x !== plotNumber) 
            : [...current, plotNumber];
        setFormData(prev => ({ ...prev, plotNumber: updated.join(', ') }));
        setTouched(prev => ({ ...prev, plotNumber: true }));
    };

     useEffect(() => {
        if (isOpen && editingClient) {
            setFormData({
                surname: editingClient.surname,
                otherNames: editingClient.otherNames,
                dateOfBirth: editingClient.dateOfBirth || '',
                currentAddress: editingClient.location,
                telephone: editingClient.phone,
                email: editingClient.email,
                gender: editingClient.gender || 'Other',
                photo: editingClient.photo || '',
                placeOfWork: editingClient.professionalDetails?.placeOfWork || '',
                profession: editingClient.professionalDetails?.profession || '',
                position: editingClient.professionalDetails?.position || '',
                kinName: editingClient.nextOfKin.name,
                kinAddress: editingClient.nextOfKin.address || '',
                kinPhone: editingClient.nextOfKin.phone,
                kinRelationship: editingClient.nextOfKin.relationship,
                kinEmail: editingClient.nextOfKin.email || '',
                witnessName: editingClient.witness.name,
                witnessAddress: editingClient.witness.address,
                witnessPhone: editingClient.witness.phone,
                paymentDate: editingClient.regDate,
                paymentMethod: editingClient.payment.paymentHistory[0]?.method || 'Bank Transfer',
                location: editingClient.location,
                propertyType: editingClient.propertyType || 'Residential',
                plotNumber: editingClient.plot,
                numberOfPlots: (editingClient as any).numberOfPlots || '1',
                plannedDevelopmentYear: editingClient.plannedDevelopmentYear || new Date().getFullYear().toString(),
                filledFormPdf: editingClient.filledFormPdf,
                indentureName: editingClient.indenture.name,
                indentureAddress: editingClient.indenture.address,
                salesRep: editingClient.officeUse.salesRep,
                salesManager: editingClient.officeUse.salesManager,
                accountsHead: editingClient.officeUse.accountsHead,
                clerk: editingClient.officeUse.clerk,
                price: editingClient.payment.total.toString(),
            });
            setPhotoPreview(editingClient.photo || null);
            setTouched({});
        } else if (isOpen) {
            resetForm();
        }
    }, [isOpen, editingClient]);

    const validate = useCallback((): Partial<Record<keyof FormData, string>> => {
        const errors: Partial<Record<keyof FormData, string>> = {};
        // Critical fields required for save
        const requiredFields: (keyof FormData)[] = ['surname', 'otherNames', 'telephone', 'location', 'plotNumber'];
        requiredFields.forEach(field => {
            if (!formData[field]) errors[field] = 'This field cannot be left blank.';
        });
        if (formData.numberOfPlots && (parseInt(formData.numberOfPlots) <= 0 || isNaN(parseInt(formData.numberOfPlots)))) {
            errors.numberOfPlots = 'Number of plots must be a positive number.';
        }
        return errors;
    }, [formData]);

    const errors = useMemo(() => validate(), [validate]);
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target as { name: keyof FormData };
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (fieldName: keyof FormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (allowedTypes.includes(file.type)) {
                setPhotoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                 alert('Invalid file type. Please upload a .jpg, .jpeg, or .png file.');
                 e.target.value = '';
            }
        }
    };
    
    const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setPdfFile(file);
                setTouched(prev => ({ ...prev, filledFormPdf: true }));
            } else {
                alert('Please upload a PDF file.');
                e.target.value = '';
            }
        }
    };

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, 3));
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
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

    const resetForm = () => {
        setFormData(initialFormData);
        setPhotoPreview(null);
        setPdfFile(null);
        setPhotoFile(null);
        setStep(1);
        setTouched({});
        setIsProcessing(false);
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