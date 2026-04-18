import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Client, Staff, AmendmentRequest } from '../types';
import { uploadFile } from '../services/storageService';

const initialFormState: Omit<AmendmentRequest, 'id' | 'clientId' | 'clientFullName' | 'clientPurchaseRef' | 'requestDate' | 'requestingStaffId' | 'scannedForm'> = {
    amendmentTypes: {
        personalDetails: false, nextOfKin: false, propertyReallocation: false,
        paymentPlan: false, indenture: false,
    },
    officeUse: {
        receivedBy: '', dateReceived: new Date().toISOString().split('T')[0], status: 'Pending'
    }
};

export const useAmendmentForm = (
    client: Client,
    currentStaff: Staff,
    onSave: (amendmentData: AmendmentRequest, updatedClient: Client) => void
) => {
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

    return {
        formData,
        scannedFormPreview,
        formError,
        isSubmitting,
        handleTypeToggle,
        handleFormChange,
        handleFileChange,
        handleSubmit
    };
};
