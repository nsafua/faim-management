
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Property, PlotInventory } from '../types';
import { ArrowLeftIcon, CheckCircleIcon } from '../components/icons/DummyIcons';
import { Button } from '../components/ui/Button';
import { uploadFile } from '../services/storageService';

// Import refactored components
import { LandOwnershipDetails } from '../components/land/LandOwnershipDetails';
import { LegalDocumentation } from '../components/land/LegalDocumentation';
import { NegotiatorsContacts } from '../components/land/NegotiatorsContacts';
import { DisbursementSchedule } from '../components/land/DisbursementSchedule';
import { InventoryPartitioning } from '../components/land/InventoryPartitioning';

interface LandPurchaseFormPageProps {
  onBack: () => void;
  properties: Property[];
  onSaveProperty: (property: Property) => Promise<void>;
}

const initialFormData = {
    ownerNames: '',
    location: '',
    registrationStatus: '',
    purchaseAgreementDate: '',
    totalSizeAcres: '',
    pricePerAcre: '',
    totalPrice: '',
    familyName: '',
    nameOnSearch: '',
    officialSearchDoc: null,
    sitePlanDoc: null,
    leadNegotiators: '',
    familyContactPerson: '',
    phoneNumbers: ['', '', ''],
    additionalNotes: '',
    paymentAmountPerMonth: '',
    paymentPeriodMonths: '',
    recurringPaymentTime: '',
    payees: [],
    signingDate: new Date().toISOString().split('T')[0],
    plotsPerAcre: '6',
    pricePerPlot: '',
    inventory: [
        { size: '70x100 ft', count: 0, sold: 0, zone: 'PHASE1' }
    ] as (PlotInventory & { zone: string })[]
};

const LandPurchaseFormPage: React.FC<LandPurchaseFormPageProps> = ({ onBack, properties, onSaveProperty }) => {
    const [formData, setFormData] = useState<any>(() => ({
        ...initialFormData
    }));
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [plotsPerAcreError, setPlotsPerAcreError] = useState('');

    useEffect(() => {
        const acres = parseFloat(formData.totalSizeAcres) || 0;
        const priceAcre = parseFloat(formData.pricePerAcre) || 0;
        const plotsAcre = parseFloat(formData.plotsPerAcre) || 0;
        const computedTotalCost = acres * priceAcre;
        const computedCostPerPlot = plotsAcre > 0 ? (priceAcre / plotsAcre) : 0;

        setFormData(prev => ({
            ...prev,
            totalPrice: computedTotalCost > 0 ? computedTotalCost.toFixed(2) : '',
            pricePerPlot: computedCostPerPlot > 0 ? computedCostPerPlot.toFixed(2) : ''
        }));
    }, [formData.totalSizeAcres, formData.pricePerAcre, formData.plotsPerAcre]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'plotsPerAcre' || name === 'totalSizeAcres' || name === 'pricePerAcre') {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
                if(name === 'plotsPerAcre') setPlotsPerAcreError('Please enter numbers only.');
                return;
            }
            if(name === 'plotsPerAcre') setPlotsPerAcreError('');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (index: number, value: string) => {
        const newPhones = [...formData.phoneNumbers];
        newPhones[index] = value;
        setFormData(prev => ({...prev, phoneNumbers: newPhones}));
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: (files && files.length > 0) ? files[0] : null }));
    };

    const formatCurrencyString = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '0.00';
        return new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (plotsPerAcreError || parseFloat(formData.plotsPerAcre) <= 0) {
            alert('Please provide a valid number of plots per acre.');
            return;
        }
        setIsSaving(true);
        
        try {
            const regStatusMap: Record<string, Property['registrationStatus']> = {
                'LRD': 'Titled', 'PVLMD': 'Indenture', 'SMD': 'Plotted', 'LVD': 'Indenture'
            };

            const totalSizeAcres = parseFloat(formData.totalSizeAcres) || 0;
            const propertyId = Date.now();

            let officialSearchDocUrl = '';
            if (formData.officialSearchDoc) {
                officialSearchDocUrl = await uploadFile(formData.officialSearchDoc, `properties/${propertyId}/legal/${formData.officialSearchDoc.name}`);
            }

            let sitePlanDocUrl = '';
            if (formData.sitePlanDoc) {
                sitePlanDocUrl = await uploadFile(formData.sitePlanDoc, `properties/${propertyId}/legal/${formData.sitePlanDoc.name}`);
            }

            const newProperty: Property = {
                id: propertyId,
                location: formData.location,
                description: `Land acquired from ${formData.ownerNames}`,
                size: totalSizeAcres,
                price: parseFloat(formData.pricePerPlot) || 0,
                costPrice: parseFloat(formData.pricePerPlot) || 0,
                inventory: formData.inventory.map(({ size, count, sold, zone }: any) => ({ 
                    size, 
                    count: Number(count), 
                    sold: Number(sold), 
                    zone: zone.toUpperCase().replace(/\s/g, '') 
                })), 
                registrationStatus: regStatusMap[formData.registrationStatus] || 'Plotted'
            } as any;
            
            await onSaveProperty(newProperty);
            setIsSaved(true);
            window.scrollTo(0, 0);
            setTimeout(() => {
                setIsSaved(false);
                setFormData({ ...initialFormData });
            }, 4000);
        } catch (error) {
            console.error("Error saving property:", error);
            alert("Failed to save property.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                 <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to CEO Hub
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2 tracking-tight uppercase">New Land Acquisition</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Record details for newly purchased land assets.</p>
                </div>
            </div>

            {isSaved && (
                <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-lg shadow-md" role="alert">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-6 h-6 mr-3"/>
                        <div>
                            <p className="font-bold">Acquisition Success!</p>
                            <p>Land record finalized and added to master property inventory.</p>
                        </div>
                    </div>
                </div>
            )}
            
            <form id="land-purchase-form" onSubmit={handleSubmit} className="space-y-6 pb-20">
                <LandOwnershipDetails 
                    formData={formData} 
                    handleChange={handleChange} 
                    plotsPerAcreError={plotsPerAcreError} 
                    formatCurrencyString={formatCurrencyString} 
                />

                <LegalDocumentation 
                    formData={formData} 
                    handleChange={handleChange} 
                    handleFileChange={handleFileChange} 
                />

                <NegotiatorsContacts 
                    formData={formData} 
                    handleChange={handleChange} 
                    handlePhoneChange={handlePhoneChange} 
                />

                <DisbursementSchedule 
                    formData={formData} 
                    handleChange={handleChange} 
                    setFormData={setFormData} 
                />

                <InventoryPartitioning 
                    formData={formData} 
                    setFormData={setFormData} 
                />
            </form>
            
            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end z-20 shadow-lg">
                <div className="container mx-auto px-6 flex justify-end gap-4">
                    <Button variant="secondary" onClick={onBack} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} className="shadow-lg px-8 py-3 bg-blue-600 border-blue-600 text-white" isLoading={isSaving}>
                        Confirm Acquisition
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LandPurchaseFormPage;
