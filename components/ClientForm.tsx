import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback, useMemo } from 'react';
import { Client, Property } from '../types';
import { XIcon } from './icons/XIcon';
import { UserGroupIcon, BuildingLibraryIcon, BriefcaseIcon, CheckCircleIcon } from './icons/DummyIcons';

export type FormData = {
    // Personal
    surname: string;
    otherNames: string;
    dateOfBirth: string;
    currentAddress: string;
    telephone: string;
    email: string;
    gender: string;
    photo: string; // base64 string
    // Professional
    placeOfWork: string;
    profession: string;
    position: string;
    // Next of Kin
    kinName: string;
    kinAddress: string;
    kinPhone: string;
    kinRelationship: string;
    kinEmail: string;
    // Witness
    witnessName: string;
    witnessAddress: string;
    witnessPhone: string;
    // Property
    paymentDate: string;
// FIX: Added 'Cheque' to the payment method types to align with the data model.
    paymentMethod: 'Cash' | 'Bank Transfer' | 'MoMo' | 'Cheque' | 'Other';
    location: string;
    propertyType: 'Residential' | 'Commercial';
    plotNumber: string;
    plannedDevelopmentYear: string;
    filledFormPdf: string | null; // base64 string
    // Indenture
    indentureName: string;
    indentureAddress: string;
    // Office Use
    salesRep: string;
    salesManager: string;
    accountsHead: string;
    clerk: string;
};

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  onSaveAndPay: (formData: FormData) => void;
  properties: Property[];
  editingClient?: Client | null;
}

const getFieldClass = (error?: string): string => {
    const baseClass = "mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    return error ? `${baseClass} border-red-500` : `${baseClass} border-gray-300`;
};

const SmartInputField: React.FC<{ id: keyof FormData; label: string; value: string | number; onChange: (e: ChangeEvent<HTMLInputElement>) => void; onBlur: (e: React.FocusEvent<HTMLInputElement>) => void; error?: string; type?: string; required?: boolean; list?: string; isTouched?: boolean; }> = ({ id, label, value, onChange, onBlur, error, type = 'text', required = false, list, isTouched }) => (
    <div className="sm:col-span-1 relative">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} name={id} id={id} value={value} onChange={onChange} onBlur={onBlur} required={required} list={list} className={getFieldClass(error)} title={error || ''} />
        {isTouched && !error && required && (
            <CheckCircleIcon className="absolute right-3 top-[37px] w-5 h-5 text-green-500 pointer-events-none" />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const SmartSelectField: React.FC<{ id: keyof FormData; label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void; children: React.ReactNode; error?: string; required?: boolean; isTouched?: boolean; }> = ({ id, label, value, onChange, onBlur, children, error, required = false, isTouched }) => (
     <div className="sm:col-span-1 relative">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <select id={id} name={id} value={value} onChange={onChange} onBlur={onBlur} required={required} className={getFieldClass(error)} title={error || ''}>
            {children}
        </select>
        {isTouched && !error && required && (
            <CheckCircleIcon className="absolute right-8 top-[37px] w-5 h-5 text-green-500 pointer-events-none" />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);


const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {children}
        </div>
    </div>
);

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
    plannedDevelopmentYear: new Date().getFullYear().toString(),
    filledFormPdf: null,
    indentureName: '',
    indentureAddress: '',
    salesRep: '',
    salesManager: '',
    accountsHead: '',
    clerk: '',
};

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, onSaveAndPay, properties, editingClient }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

     useEffect(() => {
        if (isOpen && editingClient) {
            setFormData({
                surname: editingClient.surname,
                otherNames: editingClient.otherNames,
                dateOfBirth: '', // Assuming not stored, can be added to type
                currentAddress: editingClient.location, // Best guess
                telephone: editingClient.phone,
                email: editingClient.email,
                gender: 'Other', // Assuming not stored
                photo: editingClient.photo || '',
                placeOfWork: '', // Assuming not stored
                profession: '', // Assuming not stored
                position: '', // Assuming not stored
                kinName: editingClient.nextOfKin.name,
                kinAddress: '', // Assuming not stored
                kinPhone: editingClient.nextOfKin.phone,
                kinRelationship: editingClient.nextOfKin.relationship,
                kinEmail: editingClient.nextOfKin.email || '',
                witnessName: editingClient.witness.name,
                witnessAddress: editingClient.witness.address,
                witnessPhone: editingClient.witness.phone,
                paymentDate: editingClient.regDate,
                paymentMethod: editingClient.payment.paymentHistory[0]?.method || 'Bank Transfer',
                location: editingClient.location,
                propertyType: 'Residential', // Assuming not stored
                plotNumber: editingClient.plot,
                plannedDevelopmentYear: new Date().getFullYear().toString(),
                filledFormPdf: editingClient.filledFormPdf,
                indentureName: editingClient.indenture.name,
                indentureAddress: editingClient.indenture.address,
                salesRep: editingClient.officeUse.salesRep,
                salesManager: editingClient.officeUse.salesManager,
                accountsHead: editingClient.officeUse.accountsHead,
                clerk: editingClient.officeUse.clerk,
            });
            setPhotoPreview(editingClient.photo || null);
            setTouched({});
        } else if (isOpen) {
            resetForm();
        }
    }, [isOpen, editingClient]);

    const validate = useCallback((): Partial<Record<keyof FormData, string>> => {
        const errors: Partial<Record<keyof FormData, string>> = {};
        const requiredFields: (keyof FormData)[] = ['surname', 'otherNames', 'currentAddress', 'telephone', 'kinName', 'kinPhone', 'witnessName', 'witnessPhone', 'witnessAddress', 'location', 'plotNumber', 'indentureName', 'indentureAddress', 'salesRep', 'salesManager', 'accountsHead', 'clerk', 'paymentDate'];
        
        requiredFields.forEach(field => {
            if (!formData[field]) errors[field] = 'This field cannot be left blank.';
        });

        const textFields: (keyof FormData)[] = ['surname', 'otherNames', 'kinName', 'witnessName', 'salesRep', 'salesManager', 'accountsHead', 'clerk'];
        textFields.forEach(field => {
            const value = formData[field];
            if (value) {
                if (!/^[A-Za-z\s'-]+$/.test(value)) errors[field] = 'Only letters, spaces, hyphens, and apostrophes are allowed.';
                if (/(.)\1{3,}/.test(value)) errors[field] = 'Please provide a valid, readable entry.';
                if (value.length < 2) errors[field] = 'Entry must be at least 2 characters.';
            }
        });
        
        const addressFields: (keyof FormData)[] = ['currentAddress', 'witnessAddress', 'indentureAddress', 'location'];
        addressFields.forEach(field => {
            const value = formData[field];
            if(value && (!/[a-zA-Z]/.test(value) || !/\s/.test(value))){
                errors[field] = 'Address must contain letters and at least one space.';
            }
        });

        if (formData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address format.';
        }

        const phoneFields: (keyof FormData)[] = ['telephone', 'kinPhone', 'witnessPhone'];
        phoneFields.forEach(field => {
            if (formData[field] && !/^\d{9,10}$/.test(formData[field])) {
                errors[field] = 'Please enter a valid 9 or 10-digit phone number.';
            }
        });

        if (formData.plotNumber && !/^[A-Z]{2,}-\d+/.test(formData.plotNumber)) {
            errors.plotNumber = 'Plot number must follow a format like ELH-101.';
        }

        if (!formData.filledFormPdf && !editingClient?.filledFormPdf) errors.filledFormPdf = 'PDF form upload is required.';
        return errors;
    }, [formData, editingClient]);

    const errors = useMemo(() => validate(), [validate]);
    const isFormValid = Object.keys(errors).length === 0;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target as { name: keyof FormData };
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (allowedTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setFormData(prev => ({ ...prev, photo: base64String }));
                    setPhotoPreview(base64String);
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
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setFormData(prev => ({ ...prev, filledFormPdf: base64String }));
                };
                reader.readAsDataURL(file);
                 setTouched(prev => ({ ...prev, filledFormPdf: true }));
            } else {
                alert('Please upload a PDF file.');
                e.target.value = '';
            }
        }
    };

    const step1Fields: (keyof FormData)[] = ['surname', 'otherNames', 'currentAddress', 'telephone', 'kinName', 'kinPhone', 'witnessName', 'witnessPhone', 'witnessAddress'];
    const step2Fields: (keyof FormData)[] = ['location', 'plotNumber', 'paymentDate', 'filledFormPdf', 'indentureName', 'indentureAddress'];

    const handleNext = () => {
        const currentStepFields = step === 1 ? step1Fields : step2Fields;
        let isStepValid = true;
        const fieldsToTouch: Partial<Record<keyof FormData, boolean>> = {};
        
        currentStepFields.forEach(field => {
            fieldsToTouch[field] = true;
            if (errors[field]) {
                isStepValid = false;
            }
        });

        if (!isStepValid) {
            setTouched(prev => ({ ...prev, ...fieldsToTouch }));
            alert('Please complete all required fields correctly before continuing.');
            return;
        }
        setStep(prev => Math.min(prev + 1, 3));
    };
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            const allFields = Object.keys(initialFormData) as (keyof FormData)[];
            const allTouched = allFields.reduce((acc, key) => ({...acc, [key]: true}), {});
            setTouched(allTouched);
            alert("Some fields contain invalid or incomplete data. Please correct them before saving.");
            return;
        }
        onSave(formData);
        resetForm();
    };

    const handleSubmitAndPay = (e: FormEvent) => {
        e.preventDefault();
         if (!isFormValid) {
            const allFields = Object.keys(initialFormData) as (keyof FormData)[];
            const allTouched = allFields.reduce((acc, key) => ({...acc, [key]: true}), {});
            setTouched(allTouched);
            alert("Some fields contain invalid or incomplete data. Please correct them before saving.");
            return;
        }
        onSaveAndPay(formData);
        resetForm();
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setPhotoPreview(null);
        setPdfFile(null);
        setStep(1);
        setTouched({});
    };

    if (!isOpen) return null;

    const steps = [
        { name: 'Client Information', icon: <UserGroupIcon className="w-5 h-5" /> },
        { name: 'Acquisition Details', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
        { name: 'Office Details', icon: <BriefcaseIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transform transition-all">
                <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">{editingClient ? 'Edit Client Details' : 'New Client Registration'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 border-b">
                    <nav aria-label="Progress">
                         <ol role="list" className="flex items-center">
                            {steps.map((s, stepIdx) => (
                                <li key={s.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                                    {step > stepIdx + 1 ? (
                                        <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-blue-600" />
                                        </div>
                                        <div className="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white">
                                            {s.icon}
                                        </div>
                                        </>
                                    ) : step === stepIdx + 1 ? (
                                        <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200" />
                                        </div>
                                        <div className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full text-blue-600">
                                           {s.icon}
                                        </div>
                                        </>
                                    ) : (
                                        <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200" />
                                        </div>
                                        <div className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full text-gray-400">
                                            {s.icon}
                                        </div>
                                        </>
                                    )}
                                     <span className="absolute -bottom-6 text-xs font-semibold text-center w-24 -left-8">{s.name}</span>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow">
                    {step === 1 && (
                        <div>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="sm:col-span-2">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <SmartInputField id="surname" label="Surname" value={formData.surname} onChange={handleChange} onBlur={handleBlur} required error={touched.surname ? errors.surname : undefined} isTouched={touched.surname} />
                                        <SmartInputField id="otherNames" label="Other Names" value={formData.otherNames} onChange={handleChange} onBlur={handleBlur} required error={touched.otherNames ? errors.otherNames : undefined} isTouched={touched.otherNames}/>
                                        <SmartInputField id="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} onBlur={handleBlur} error={touched.dateOfBirth ? errors.dateOfBirth : undefined} isTouched={touched.dateOfBirth} />
                                         <SmartSelectField id="gender" label="Gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} error={touched.gender ? errors.gender : undefined} isTouched={touched.gender}>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </SmartSelectField>
                                        <div className="sm:col-span-2">
                                            <SmartInputField id="currentAddress" label="Current Address" value={formData.currentAddress} onChange={handleChange} onBlur={handleBlur} required error={touched.currentAddress ? errors.currentAddress : undefined} isTouched={touched.currentAddress} />
                                        </div>
                                        <SmartInputField id="telephone" label="Telephone" type="tel" value={formData.telephone} onChange={handleChange} onBlur={handleBlur} required error={touched.telephone ? errors.telephone : undefined} isTouched={touched.telephone} />
                                        <SmartInputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : undefined} isTouched={touched.email} />
                                    </div>
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Passport-sized Photo</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Client" className="mx-auto h-24 w-24 object-cover rounded-md" />
                                            ) : (
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            )}
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload a file</span>
                                                    <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handlePhotoChange} accept=".jpg,.jpeg,.png" />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                        </div>
                                    </div>
                                </div>
                           </div>

                           <FormSection title="Professional Information">
                               <SmartInputField id="placeOfWork" label="Place of Work" value={formData.placeOfWork} onChange={handleChange} onBlur={handleBlur} error={touched.placeOfWork ? errors.placeOfWork : undefined} isTouched={touched.placeOfWork}/>
                               <SmartInputField id="profession" label="Profession" value={formData.profession} onChange={handleChange} onBlur={handleBlur} error={touched.profession ? errors.profession : undefined} isTouched={touched.profession}/>
                               <SmartInputField id="position" label="Position/Rank" value={formData.position} onChange={handleChange} onBlur={handleBlur} error={touched.position ? errors.position : undefined} isTouched={touched.position}/>
                           </FormSection>

                           <FormSection title="Next of Kin Details">
                               <SmartInputField id="kinName" label="Name" value={formData.kinName} onChange={handleChange} onBlur={handleBlur} required error={touched.kinName ? errors.kinName : undefined} isTouched={touched.kinName}/>
                               <SmartInputField id="kinRelationship" label="Relationship with Buyer" value={formData.kinRelationship} onChange={handleChange} onBlur={handleBlur} error={touched.kinRelationship ? errors.kinRelationship : undefined} isTouched={touched.kinRelationship}/>
                               <SmartInputField id="kinPhone" label="Telephone Number" type="tel" value={formData.kinPhone} onChange={handleChange} onBlur={handleBlur} required error={touched.kinPhone ? errors.kinPhone : undefined} isTouched={touched.kinPhone}/>
                               <SmartInputField id="kinEmail" label="Email Address" type="email" value={formData.kinEmail} onChange={handleChange} onBlur={handleBlur} error={touched.kinEmail ? errors.kinEmail : undefined} isTouched={touched.kinEmail}/>
                               <div className="sm:col-span-2">
                                    <SmartInputField id="kinAddress" label="Address" value={formData.kinAddress} onChange={handleChange} onBlur={handleBlur} error={touched.kinAddress ? errors.kinAddress : undefined} isTouched={touched.kinAddress}/>
                               </div>
                           </FormSection>

                           <FormSection title="Witness Details">
                               <SmartInputField id="witnessName" label="Name" value={formData.witnessName} onChange={handleChange} onBlur={handleBlur} required error={touched.witnessName ? errors.witnessName : undefined} isTouched={touched.witnessName}/>
                               <SmartInputField id="witnessPhone" label="Telephone Number" type="tel" value={formData.witnessPhone} onChange={handleChange} onBlur={handleBlur} required error={touched.witnessPhone ? errors.witnessPhone : undefined} isTouched={touched.witnessPhone}/>
                               <div className="sm:col-span-2">
                                <SmartInputField id="witnessAddress" label="Address" value={formData.witnessAddress} onChange={handleChange} onBlur={handleBlur} required error={touched.witnessAddress ? errors.witnessAddress : undefined} isTouched={touched.witnessAddress}/>
                               </div>
                           </FormSection>
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                             <FormSection title="Property & Transaction Details">
                                <SmartInputField id="location" label="Location" value={formData.location} onChange={handleChange} onBlur={handleBlur} required list="property-locations" error={touched.location ? errors.location : undefined} isTouched={touched.location}/>
                                <datalist id="property-locations">
                                    {properties.map(p => <option key={p.id} value={p.location} />)}
                                </datalist>
                                <SmartInputField id="plotNumber" label="Plot Number(s)" value={formData.plotNumber} onChange={handleChange} onBlur={handleBlur} required error={touched.plotNumber ? errors.plotNumber : undefined} isTouched={touched.plotNumber}/>
                                <SmartSelectField id="propertyType" label="Property Type" value={formData.propertyType} onChange={handleChange} onBlur={handleBlur} error={touched.propertyType ? errors.propertyType : undefined} isTouched={touched.propertyType}>
                                    <option>Residential</option>
                                    <option>Commercial</option>
                                </SmartSelectField>
                                <SmartInputField id="plannedDevelopmentYear" label="Year of Planned Development" type="number" value={formData.plannedDevelopmentYear} onChange={handleChange} onBlur={handleBlur} error={touched.plannedDevelopmentYear ? errors.plannedDevelopmentYear : undefined} isTouched={touched.plannedDevelopmentYear}/>
                                <SmartInputField id="paymentDate" label="Date of Initial Payment" type="date" value={formData.paymentDate} onChange={handleChange} onBlur={handleBlur} required error={touched.paymentDate ? errors.paymentDate : undefined} isTouched={touched.paymentDate}/>
                                <SmartSelectField id="paymentMethod" label="Initial Payment Method" value={formData.paymentMethod} onChange={handleChange} onBlur={handleBlur} error={touched.paymentMethod ? errors.paymentMethod : undefined} isTouched={touched.paymentMethod}>
                                    <option>Cash</option>
                                    <option>Bank Transfer</option>
                                    <option>MoMo</option>
                                    <option>Cheque</option>
                                    <option>Other</option>
                                </SmartSelectField>
                                <div className={`sm:col-span-2 p-3 rounded-md border relative ${touched.filledFormPdf && errors.filledFormPdf ? 'border-red-500' : 'border-gray-200 bg-gray-50'}`}>
                                    <label htmlFor="filledFormPdf" className="block text-sm font-medium text-gray-700">Upload Filled Client Form <span className="text-red-500">*</span></label>
                                    <div className="mt-1 flex items-center">
                                        <label htmlFor="filledFormPdf-upload" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>{pdfFile?.name || (formData.filledFormPdf ? 'File uploaded' : 'Select file')}</span>
                                            <input id="filledFormPdf-upload" name="filledFormPdf" type="file" className="sr-only" onChange={handlePdfChange} accept="application/pdf" />
                                        </label>
                                        {(pdfFile || formData.filledFormPdf) && <span className="ml-3 text-sm text-green-600">✔ PDF selected</span>}
                                    </div>
                                    {touched.filledFormPdf && errors.filledFormPdf && <p className="mt-1 text-xs text-red-600">{errors.filledFormPdf}</p>}
                                    {touched.filledFormPdf && !errors.filledFormPdf && (
                                        <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
                                    )}
                                </div>
                            </FormSection>

                            <FormSection title="What Name & Address Do You Want to Appear on Your Indenture?">
                                <SmartInputField id="indentureName" label="Full Name" value={formData.indentureName} onChange={handleChange} onBlur={handleBlur} required error={touched.indentureName ? errors.indentureName : undefined} isTouched={touched.indentureName}/>
                                <SmartInputField id="indentureAddress" label="Postal Address" value={formData.indentureAddress} onChange={handleChange} onBlur={handleBlur} required error={touched.indentureAddress ? errors.indentureAddress : undefined} isTouched={touched.indentureAddress}/>
                            </FormSection>
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                             <FormSection title="For Office Use Only">
                                <SmartInputField id="salesRep" label="Intermediary Sales Rep" value={formData.salesRep} onChange={handleChange} onBlur={handleBlur} required error={touched.salesRep ? errors.salesRep : undefined} isTouched={touched.salesRep}/>
                                <SmartInputField id="salesManager" label="Approving Sales Manager Name" value={formData.salesManager} onChange={handleChange} onBlur={handleBlur} required error={touched.salesManager ? errors.salesManager : undefined} isTouched={touched.salesManager}/>
                                <SmartInputField id="accountsHead" label="Approval Accounts Head Name" value={formData.accountsHead} onChange={handleChange} onBlur={handleBlur} required error={touched.accountsHead ? errors.accountsHead : undefined} isTouched={touched.accountsHead}/>
                                <SmartInputField id="clerk" label="Receiving Clerk on Duty Name" value={formData.clerk} onChange={handleChange} onBlur={handleBlur} required error={touched.clerk ? errors.clerk : undefined} isTouched={touched.clerk}/>
                            </FormSection>
                        </div>
                    )}
                </form>

                <div className="flex justify-between items-center p-5 border-t bg-white rounded-b-lg">
                    <div>
                        {step > 1 && (
                            <button type="button" onClick={handleBack} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                                Back
                            </button>
                        )}
                    </div>
                    <div>
                        {step < 3 ? (
                             <button type="button" onClick={handleNext} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Next: {step === 1 ? 'Acquisition Details' : 'Office Details'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button type="submit" onClick={handleSubmit} disabled={!isFormValid} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Save Client
                                </button>
                                {!editingClient && (
                                <button type="button" onClick={handleSubmitAndPay} disabled={!isFormValid} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Add Payment Information
                                </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientForm;