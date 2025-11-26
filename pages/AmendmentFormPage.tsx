import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Client, Staff, AmendmentRequest } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, UploadIcon } from '../components/icons/DummyIcons';

interface AmendmentFormPageProps {
    client: Client;
    onBack: () => void;
    onSave: (amendmentData: AmendmentRequest) => void;
    currentStaff: Staff;
}

const initialFormState: Omit<AmendmentRequest, 'id' | 'clientId' | 'clientFullName' | 'clientPurchaseRef' | 'requestDate' | 'requestingStaffId' | 'scannedForm'> = {
    amendmentTypes: {
        personalDetails: false, nextOfKin: false, propertyReallocation: false,
        paymentPlan: false, indenture: false,
    },
    officeUse: {
        receivedBy: '', dateReceived: new Date().toISOString().split('T')[0], status: 'Pending'
    }
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ id: string; label: string; value: string | number; onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; disabled?: boolean; }> = ({ id, label, value, onChange, type = 'text', required = false, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        {type === 'textarea' ? (
            <textarea name={id} id={id} value={value as string} onChange={onChange} required={required} disabled={disabled} rows={3} className="mt-1 block w-full input-class" />
        ) : (
            <input type={type} name={id} id={id} value={value} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full input-class" />
        )}
    </div>
);

const AmendmentFormPage: React.FC<AmendmentFormPageProps> = ({ client, onBack, onSave, currentStaff }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [scannedForm, setScannedForm] = useState<string | null>(null);
    const [formError, setFormError] = useState('');

    const handleTypeToggle = (type: keyof typeof formData.amendmentTypes) => {
        setFormData(prev => ({
            ...prev,
            amendmentTypes: { ...prev.amendmentTypes, [type]: !prev.amendmentTypes[type] }
        }));
    };

    const handleFormChange = (section: keyof AmendmentRequest, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...(prev[section] as object), [field]: value }
        }));
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onloadend = () => { setScannedForm(reader.result as string); setFormError(''); };
                reader.readAsDataURL(file);
            } else {
                setFormError('Please upload a valid image or PDF file.');
            }
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!scannedForm) {
            setFormError('A scanned copy of the filled amendment form is mandatory for submission.');
            return;
        }
        if (!Object.values(formData.amendmentTypes).some(t => t)) {
            setFormError('Please select at least one amendment type to proceed.');
            return;
        }
        setFormError('');
        
        const submissionData: AmendmentRequest = {
            ...formData,
            id: `AMD-${Date.now()}`,
            clientId: client.id,
            clientFullName: client.name,
            clientPurchaseRef: `${client.initials}-${client.id}`,
            requestDate: new Date().toISOString().split('T')[0],
            requestingStaffId: currentStaff.id,
            scannedForm: scannedForm,
            officeUse: {
                ...formData.officeUse,
                receivedBy: currentStaff.fullName
            }
        };

        onSave(submissionData);
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Client Details
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mt-2">Client Amendment & Reallocation Request</h1>
                <p className="text-gray-500 mt-1">Updating records for: <span className="font-semibold text-blue-600">{client.name}</span></p>
            </div>
            
            <form id="amendment-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-bold text-gray-800">AMENDMENT REQUEST TYPE</h3>
                    <p className="text-sm text-gray-500">Please tick relevant sections and complete only those you wish to amend.</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.keys(formData.amendmentTypes).map(key => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={formData.amendmentTypes[key as keyof typeof formData.amendmentTypes]} onChange={() => handleTypeToggle(key as keyof typeof formData.amendmentTypes)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                <span className="text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {formData.amendmentTypes.personalDetails && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <FormSection title="1. Personal Details">
                            <InputField id="dateOfBirth" label="Date of Birth" type="date" value={formData.personalDetails?.dateOfBirth || ''} onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} />
                            <InputField id="currentAddress" label="Current Address" value={formData.personalDetails?.currentAddress || ''} onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} />
                            <InputField id="phone" label="Phone Number" type="tel" value={formData.personalDetails?.phone || ''} onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} />
                            <InputField id="email" label="Email" type="email" value={formData.personalDetails?.email || ''} onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} />
                            <div className="sm:col-span-2">
                                <InputField id="newDetailsToUpdate" label="New Details to be Updated (Summary)" type="textarea" value={formData.personalDetails?.newDetailsToUpdate || ''} onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} />
                            </div>
                        </FormSection>
                    </div>
                )}
                 {formData.amendmentTypes.nextOfKin && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <FormSection title="2. Next of Kin Details">
                            <InputField id="name" label="Next of Kin Name" value={formData.nextOfKinDetails?.name || ''} onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} />
                             <InputField id="address" label="Address" value={formData.nextOfKinDetails?.address || ''} onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} />
                            <InputField id="phone" label="Phone Number" type="tel" value={formData.nextOfKinDetails?.phone || ''} onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} />
                            <InputField id="relationship" label="Relationship" value={formData.nextOfKinDetails?.relationship || ''} onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} />
                            <InputField id="email" label="Email" type="email" value={formData.nextOfKinDetails?.email || ''} onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} />
                             <div className="sm:col-span-2">
                                <InputField id="newDetailsToUpdate" label="New Details to be Updated (Summary)" type="textarea" value={formData.nextOfKinDetails?.newDetailsToUpdate || ''} onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} />
                            </div>
                        </FormSection>
                    </div>
                )}

                {/* More sections to be added here based on the form... */}

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                     <h3 className="text-lg font-bold text-gray-800">Upload Filled Form</h3>
                     <p className="text-sm text-gray-500 mb-4">Please upload a scanned PDF or image of the physically signed amendment form. This is mandatory.</p>
                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {scannedForm ? <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" /> : <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />}
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="scanned-form-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                    <span>{scannedForm ? 'File selected' : 'Upload a file'}</span>
                                    <input id="scanned-form-upload" name="scannedForm" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{scannedForm ? 'You can now submit the form.' : 'PDF, PNG, JPG up to 10MB'}</p>
                        </div>
                    </div>
                    {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <FormSection title="Office Use Only">
                        <InputField id="approvedBy" label="Approved By (Manager)" value={formData.officeUse.approvedBy || ''} onChange={e => handleFormChange('officeUse', 'approvedBy', e.target.value)} />
                        <InputField id="newPlotAllocated" label="New Plot Allocated (if any)" value={formData.officeUse.newPlotAllocated || ''} onChange={e => handleFormChange('officeUse', 'newPlotAllocated', e.target.value)} />
                        <InputField id="additionalFees" label="Additional Fees (GHC)" type="number" value={formData.officeUse.additionalFees || ''} onChange={e => handleFormChange('officeUse', 'additionalFees', Number(e.target.value))} />
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" id="status" value={formData.officeUse.status} onChange={e => handleFormChange('officeUse', 'status', e.target.value)} className="mt-1 block w-full input-class">
                                <option>Pending</option><option>Approved</option><option>Rejected</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <InputField id="remarks" label="Remarks / Actions Taken" type="textarea" value={formData.officeUse.remarks || ''} onChange={e => handleFormChange('officeUse', 'remarks', e.target.value)} />
                        </div>
                    </FormSection>
                </div>

            </form>

            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200 flex justify-end">
                <button type="submit" form="amendment-form" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                    Submit Amendment Request
                </button>
            </div>
            <style>{`.input-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input-class:focus { outline: none; --tw-ring-color: #3B82F6; border-color: #3B82F6; } .input-class:disabled { background-color: #F3F4F6; }`}</style>
        </div>
    );
};

export default AmendmentFormPage;