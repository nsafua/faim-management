import { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react';
import { Client, Property } from '../types';
import { FormData } from '../components/client-form/types';

export const initialFormData: FormData = {
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

export const useClientFormState = (
    isOpen: boolean,
    editingClient: Client | null | undefined,
    clients: Client[],
    properties: Property[]
) => {
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

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setPhotoPreview(null);
        setPdfFile(null);
        setPhotoFile(null);
        setStep(1);
        setTouched({});
        setIsProcessing(false);
    }, []);

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
    }, [isOpen, editingClient, resetForm]);

    const validate = useCallback((): Partial<Record<keyof FormData, string>> => {
        const errors: Partial<Record<keyof FormData, string>> = {};
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
    
    // Handlers
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target as { name: keyof FormData };
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handlePhoneChange = useCallback((fieldName: keyof FormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    const handlePlotsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const num = parseInt(value);
        setFormData(prev => ({ ...prev, numberOfPlots: value }));
        setTouched(prev => ({ ...prev, numberOfPlots: true }));
        if (!formData.location) return;
        if (isNaN(num) || num <= 0) return;
        const calculatedPrice = basePrice * num;
        setFormData(prev => ({ ...prev, numberOfPlots: value, price: calculatedPrice.toString() }));
    }, [formData.location, basePrice]);

    const handleLocationChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const loc = e.target.value;
        const match = properties.find(p => p.location === loc);
        const pCount = parseInt(formData.numberOfPlots) || 1;
        const priceValue = match ? (match.price * pCount).toString() : '';
        setFormData(prev => ({ ...prev, location: loc, price: priceValue, plotNumber: '' }));
    }, [formData.numberOfPlots, properties]);

    const togglePlotSelection = useCallback((plotNumber: string) => {
        const current = formData.plotNumber.split(',').map(x => x.trim()).filter(Boolean);
        const updated = current.includes(plotNumber) 
            ? current.filter(x => x !== plotNumber) 
            : [...current, plotNumber];
        setFormData(prev => ({ ...prev, plotNumber: updated.join(', ') }));
        setTouched(prev => ({ ...prev, plotNumber: true }));
    }, [formData.plotNumber]);

    const handlePhotoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (allowedTypes.includes(file.type)) {
                setPhotoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setPhotoPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                 alert('Invalid file type. Please upload a .jpg, .jpeg, or .png file.');
                 e.target.value = '';
            }
        }
    }, []);
    
    const handlePdfChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
    }, []);

    const handleNext = useCallback(() => setStep(prev => Math.min(prev + 1, 3)), []);
    const handleBack = useCallback(() => setStep(prev => Math.max(prev - 1, 1)), []);

    return {
        step,
        formData,
        setFormData,
        photoPreview,
        pdfFile,
        photoFile,
        touched,
        isProcessing,
        setIsProcessing,
        basePrice,
        takenPlots,
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
        resetForm
    };
};
