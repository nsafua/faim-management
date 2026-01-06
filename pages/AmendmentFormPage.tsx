
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Client, Staff, AmendmentRequest } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, UploadIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { EmailInput } from '../components/ui/EmailInput';
import { uploadFile } from '../services/storageService';

interface AmendmentFormPageProps {
    client: Client;
    onBack: () => void;
    onSave: (amendmentData: AmendmentRequest, updatedClient: Client) => void;
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

const TextArea: React.FC<{ label: string; id: string; value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; required?: boolean; rows?: number; name?: string }> = ({ label, id, value, onChange, required, rows = 3, name }) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <textarea
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
);

const AmendmentFormPage: React.FC<AmendmentFormPageProps> = ({ client, onBack, onSave, currentStaff }) => {
    const [formData, setFormData] = useState<any>(initialFormState); // Using any temporarily for easier nested updates during init
    const [scannedFormFile, setScannedFormFile] = useState<File | null>(null);
    const [scannedFormPreview, setScannedFormPreview] = useState<string | null>(null);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                ...initialFormState,
                personalDetails: {
                    dateOfBirth: client.dateOfBirth || '',
                    currentAddress: client.location || '',
                    phone: client.phone || '',
                    email: client.email || '',
                    newDetailsToUpdate: '',
                },
                nextOfKinDetails: {
                    name: client.nextOfKin.name || '',
                    address: client.nextOfKin.address || '',
                    phone: client.nextOfKin.phone || '',
                    relationship: client.nextOfKin.relationship || '',
                    email: client.nextOfKin.email || '',
                    newDetailsToUpdate: '',
                },
                propertyReallocation: {
                    currentLocation: client.location,
                    currentPlot: client.plot,
                    newLocation: client.location,
                    newPlot: client.plot,
                },
                paymentPlanDetails: {
                    currentPlan: client.payment.planType,
                    newPlan: client.payment.planType,
                },
                indentureDetails: {
                    currentName: client.indenture.name,
                    currentAddress: client.indenture.address,
                    newName: client.indenture.name,
                    newAddress: client.indenture.address,
                },
                officeUse: {
                    receivedBy: currentStaff.fullName,
                    dateReceived: new Date().toISOString().split('T')[0],
                    status: 'Pending'
                }
            });
        }
    }, [client, currentStaff]);

    const handleTypeToggle = (type: keyof typeof formData.amendmentTypes) => {
        setFormData((prev: any) => ({
            ...prev,
            amendmentTypes: { ...prev.amendmentTypes, [type]: !prev.amendmentTypes[type] }
        }));
    };

    const handleFormChange = (section: keyof AmendmentRequest, field: string, value: string | number) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: { ...(prev[section] as object), [field]: value }
        }));
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                setScannedFormFile(file);
                const reader = new FileReader();
                reader.onloadend = () => { setScannedFormPreview(reader.result as string); setFormError(''); };
                reader.readAsDataURL(file);
            } else {
                setFormError('Please upload a valid image or PDF file.');
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!scannedFormFile) {
            setFormError('A scanned copy of the filled amendment form is mandatory for submission.');
            return;
        }
        if (!Object.values(formData.amendmentTypes).some((t: any) => t)) {
            setFormError('Please select at least one amendment type to proceed.');
            return;
        }
        setFormError('');
        setIsSubmitting(true);
        
        try {
            const requestId = `AMD-${Date.now()}`;
            const uploadedUrl = await uploadFile(scannedFormFile, `amendments/${requestId}/${scannedFormFile.name}`);

            const submissionData: AmendmentRequest = {
                ...formData,
                id: requestId,
                clientId: client.id,
                clientFullName: client.name,
                clientPurchaseRef: `${client.initials}-${client.id}`,
                requestDate: new Date().toISOString().split('T')[0],
                requestingStaffId: currentStaff.id,
                scannedForm: uploadedUrl,
            };

            // Construct Updated Client Object
            const updatedClient = { ...client };

            if (formData.amendmentTypes.personalDetails) {
                updatedClient.dateOfBirth = formData.personalDetails.dateOfBirth;
                updatedClient.phone = formData.personalDetails.phone;
                updatedClient.email = formData.personalDetails.email;
            }
            if (formData.amendmentTypes.nextOfKin) {
                updatedClient.nextOfKin = {
                    name: formData.nextOfKinDetails.name,
                    address: formData.nextOfKinDetails.address,
                    phone: formData.nextOfKinDetails.phone,
                    relationship: formData.nextOfKinDetails.relationship,
                    email: formData.nextOfKinDetails.email,
                };
            }
            if (formData.amendmentTypes.propertyReallocation) {
                updatedClient.location = formData.propertyReallocation.newLocation;
                updatedClient.plot = formData.propertyReallocation.newPlot;
                updatedClient.status = 'Reallocated'; // Automatically update status?
            }
            if (formData.amendmentTypes.paymentPlan) {
                updatedClient.payment = {
                    ...updatedClient.payment,
                    planType: formData.paymentPlanDetails.newPlan
                };
            }
            if (formData.amendmentTypes.indenture) {
                updatedClient.indenture = {
                    name: formData.indentureDetails.newName,
                    address: formData.indentureDetails.newAddress
                };
            }

            // Add an interaction note about the amendment
            const newInteraction = {
                id: Date.now(),
                type: 'Amendment' as const,
                date: new Date().toISOString(),
                agent: currentStaff.fullName,
                notes: `Amendment Request Submitted. Types: ${Object.keys(formData.amendmentTypes).filter((k:any) => formData.amendmentTypes[k]).join(', ')}`
            };
            updatedClient.interactions = [newInteraction, ...updatedClient.interactions];

            onSave(submissionData, updatedClient);
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit amendment request.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <Card title="Amendment Request Type">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please tick relevant sections and edit the current records.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.keys(formData.amendmentTypes).map(key => (
                            <label key={key} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md transition-colors border ${formData.amendmentTypes[key] ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.amendmentTypes[key as keyof typeof formData.amendmentTypes]} 
                                    onChange={() => handleTypeToggle(key as keyof typeof formData.amendmentTypes)} 
                                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            </label>
                        ))}
                    </div>
                </Card>

                {formData.amendmentTypes.personalDetails && (
                    <Card title="1. Personal Details">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <Input 
                                id="dateOfBirth" 
                                name="dateOfBirth"
                                label="Date of Birth" 
                                type="date" 
                                value={formData.personalDetails?.dateOfBirth || ''} 
                                onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} 
                            />
                            <Input 
                                id="currentAddress" 
                                name="currentAddress"
                                label="Current Residential Address" 
                                value={formData.personalDetails?.currentAddress || ''} 
                                onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} 
                            />
                            <PhoneInput 
                                id="phone" 
                                name="phone"
                                label="Phone Number" 
                                value={formData.personalDetails?.phone || ''} 
                                onChange={(val) => handleFormChange('personalDetails', 'phone', val)} 
                            />
                            <EmailInput 
                                id="email" 
                                name="email"
                                label="Email" 
                                value={formData.personalDetails?.email || ''} 
                                onChange={(val) => handleFormChange('personalDetails', 'email', val)} 
                            />
                            <div className="sm:col-span-2">
                                <TextArea 
                                    id="newDetailsToUpdate" 
                                    name="newDetailsToUpdate"
                                    label="Additional Notes / Summary of Changes" 
                                    value={formData.personalDetails?.newDetailsToUpdate || ''} 
                                    onChange={(e) => handleFormChange('personalDetails', e.target.name, e.target.value)} 
                                />
                            </div>
                        </div>
                    </Card>
                )}
                
                {formData.amendmentTypes.nextOfKin && (
                    <Card title="2. Next of Kin Details">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <Input 
                                id="kinName" 
                                name="name"
                                label="Next of Kin Name" 
                                value={formData.nextOfKinDetails?.name || ''} 
                                onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} 
                            />
                            <Input 
                                id="kinAddress" 
                                name="address"
                                label="Address" 
                                value={formData.nextOfKinDetails?.address || ''} 
                                onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} 
                            />
                            <PhoneInput 
                                id="kinPhone" 
                                name="phone"
                                label="Phone Number" 
                                value={formData.nextOfKinDetails?.phone || ''} 
                                onChange={(val) => handleFormChange('nextOfKinDetails', 'phone', val)} 
                            />
                            <Input 
                                id="kinRelationship" 
                                name="relationship"
                                label="Relationship" 
                                value={formData.nextOfKinDetails?.relationship || ''} 
                                onChange={(e) => handleFormChange('nextOfKinDetails', e.target.name, e.target.value)} 
                            />
                            <EmailInput 
                                id="kinEmail" 
                                name="email"
                                label="Email" 
                                value={formData.nextOfKinDetails?.email || ''} 
                                onChange={(val) => handleFormChange('nextOfKinDetails', 'email', val)} 
                            />
                        </div>
                    </Card>
                )}

                {formData.amendmentTypes.propertyReallocation && (
                    <Card title="3. Property Reallocation">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Current Allocation</label>
                                <div className="text-sm font-semibold text-gray-800 dark:text-white">{formData.propertyReallocation?.currentLocation}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Plot: {formData.propertyReallocation?.currentPlot}</div>
                            </div>
                            <div></div> {/* Spacer */}
                            <Input 
                                id="newLocation" 
                                name="newLocation"
                                label="New Location" 
                                value={formData.propertyReallocation?.newLocation || ''} 
                                onChange={(e) => handleFormChange('propertyReallocation', e.target.name, e.target.value)} 
                            />
                            <Input 
                                id="newPlot" 
                                name="newPlot"
                                label="New Plot Number" 
                                value={formData.propertyReallocation?.newPlot || ''} 
                                onChange={(e) => handleFormChange('propertyReallocation', e.target.name, e.target.value)} 
                            />
                        </div>
                    </Card>
                )}

                {formData.amendmentTypes.paymentPlan && (
                    <Card title="4. Payment Plan Amendment">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Current Plan</label>
                                <div className="text-sm font-semibold text-gray-800 dark:text-white">{formData.paymentPlanDetails?.currentPlan || 'Not Set'}</div>
                            </div>
                            <Select 
                                id="newPlan" 
                                name="newPlan"
                                label="New Payment Plan" 
                                value={formData.paymentPlanDetails?.newPlan || ''} 
                                onChange={e => handleFormChange('paymentPlanDetails', 'newPlan', e.target.value)}
                            >
                                <option value="Outright Payment">Outright Payment</option>
                                <option value="3-Month Installment">3-Month Installment</option>
                                <option value="6-Month Installment">6-Month Installment</option>
                                <option value="12-Month Installment">12-Month Installment</option>
                            </Select>
                        </div>
                    </Card>
                )}

                {formData.amendmentTypes.indenture && (
                    <Card title="5. Indenture Details">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-2">Current Indenture Name: <strong>{formData.indentureDetails?.currentName}</strong></p>
                            </div>
                            <Input 
                                id="newName" 
                                name="newName"
                                label="Name to Appear on Indenture" 
                                value={formData.indentureDetails?.newName || ''} 
                                onChange={(e) => handleFormChange('indentureDetails', e.target.name, e.target.value)} 
                            />
                            <Input 
                                id="newAddress" 
                                name="newAddress"
                                label="Address to Appear on Indenture" 
                                value={formData.indentureDetails?.newAddress || ''} 
                                onChange={(e) => handleFormChange('indentureDetails', e.target.name, e.target.value)} 
                            />
                        </div>
                    </Card>
                )}

                <Card title="Upload Filled Form">
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please upload a scanned PDF or image of the physically signed amendment form. This is mandatory.</p>
                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                        <div className="space-y-1 text-center">
                            {scannedFormPreview ? <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" /> : <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="scanned-form-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span className="px-2">{scannedFormPreview ? 'Change File' : 'Upload a file'}</span>
                                    <input id="scanned-form-upload" name="scannedForm" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{scannedFormPreview ? 'File ready for submission.' : 'PDF, PNG, JPG up to 10MB'}</p>
                        </div>
                    </div>
                    {formError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formError}</p>}
                </Card>

                <Card title="Office Use Only">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <Input 
                            id="approvedBy" 
                            name="approvedBy"
                            label="Approved By (Manager)" 
                            value={formData.officeUse.approvedBy || ''} 
                            onChange={e => handleFormChange('officeUse', 'approvedBy', e.target.value)} 
                        />
                        <Input 
                            id="additionalFees" 
                            name="additionalFees"
                            label="Additional Fees (GHC)" 
                            type="number" 
                            value={formData.officeUse.additionalFees || ''} 
                            onChange={e => handleFormChange('officeUse', 'additionalFees', Number(e.target.value))} 
                        />
                        <Select 
                            id="status" 
                            name="status"
                            label="Status" 
                            value={formData.officeUse.status} 
                            onChange={e => handleFormChange('officeUse', 'status', e.target.value)}
                        >
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                        </Select>
                        <div className="sm:col-span-2">
                            <TextArea 
                                id="remarks" 
                                name="remarks"
                                label="Remarks / Actions Taken" 
                                value={formData.officeUse.remarks || ''} 
                                onChange={e => handleFormChange('officeUse', 'remarks', e.target.value)} 
                            />
                        </div>
                    </div>
                </Card>

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
