import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Property, VendorLandPurchase, Payee, PlotInventory, PlotSize } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon, UploadIcon } from '../components/icons/DummyIcons';

interface LandPurchaseFormPageProps {
  onBack: () => void;
  properties: Property[];
  onSaveProperty: (property: Property) => Promise<void>;
}

const PLOT_SIZE_SQFT: Record<PlotSize, number> = {
    '70x100 ft': 7000,
    '70x50 ft': 3500,
    '60x80 ft': 4800,
};
const ACRE_SQFT = 43560;

const FormField: React.FC<{ id: string; label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; placeholder?: string; readOnly?: boolean; className?: string; }> = ({ id, label, value, onChange, type = 'text', required = false, placeholder, readOnly = false, className = '' }) => (
    <div className={`sm:col-span-1 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        {type === 'textarea' ? (
            <textarea name={id} id={id} value={value} onChange={onChange} required={required} placeholder={placeholder} readOnly={readOnly} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm read-only:bg-gray-100" />
        ) : (
             <input type={type} name={id} id={id} value={value} onChange={onChange} required={required} placeholder={placeholder} readOnly={readOnly} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm read-only:bg-gray-100" />
        )}
    </div>
);

const SelectField: React.FC<{ id: string; label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; required?: boolean; }> = ({ id, label, value, onChange, children, required = false }) => (
    <div className="sm:col-span-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <select id={id} name={id} value={value} onChange={onChange} required={required} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {children}
        </select>
    </div>
);

const FileUploadField: React.FC<{ id: string; label: string; file: File | null | undefined; onChange: (e: ChangeEvent<HTMLInputElement>) => void; accept: string; }> = ({ id, label, file, onChange, accept }) => (
    <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                    <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id={id} name={id} type="file" className="sr-only" onChange={onChange} accept={accept} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">{file ? file.name : "PDF, PNG, JPG up to 10MB"}</p>
            </div>
        </div>
    </div>
);


const FormSection: React.FC<{ title: string; children: React.ReactNode; gridCols?: number }> = ({ title, children, gridCols = 3 }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4" style={{color: '#0047AB'}}>{title}</h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridCols} gap-6`}>
            {children}
        </div>
    </div>
);

const initialFormData: VendorLandPurchase = {
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
    plotInventory: [{ size: '70x100 ft', count: '' }],
    signingDate: new Date().toISOString().split('T')[0],
    familyRepSignature: { name: '', date: ''},
    ceoSignature: { name: '', date: '' },
    managingDirectorSignature: { name: '', date: '' },
    accountsHeadSignature: { name: '', date: '' },
};


const LandPurchaseFormPage: React.FC<LandPurchaseFormPageProps> = ({ onBack, properties, onSaveProperty }) => {
    const [formData, setFormData] = useState<VendorLandPurchase>(initialFormData);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const totalSqFt = formData.plotInventory.reduce((sum, item) => {
            const count = parseInt(item.count) || 0;
            return sum + (PLOT_SIZE_SQFT[item.size] * count);
        }, 0);
        
        const totalAcres = totalSqFt > 0 ? (totalSqFt / ACRE_SQFT).toFixed(4) : '';
        setFormData(prev => ({...prev, totalSizeAcres: totalAcres}));

        const price = parseFloat(formData.pricePerAcre);
        if (!isNaN(parseFloat(totalAcres)) && !isNaN(price) && parseFloat(totalAcres) > 0 && price > 0) {
            setFormData(prev => ({ ...prev, totalPrice: (parseFloat(totalAcres) * price).toFixed(2) }));
        } else {
            setFormData(prev => ({ ...prev, totalPrice: '' }));
        }
    }, [formData.plotInventory, formData.pricePerAcre]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (index: number, value: string) => {
        const newPhones = [...formData.phoneNumbers];
        newPhones[index] = value;
        setFormData(prev => ({...prev, phoneNumbers: newPhones}));
    };
    
    const handleSignatureChange = (signatory: keyof VendorLandPurchase, field: 'name' | 'date', value: string) => {
        setFormData(prev => ({
            ...prev,
            [signatory]: { ...(prev[signatory] as object), [field]: value }
        }));
    };

    const addPayee = () => {
        if (formData.payees.length < 10) {
            setFormData(prev => ({
                ...prev,
                payees: [...prev.payees, { id: Date.now().toString(), name: '', acres: '', amount: '' }]
            }));
        }
    };
    
    const handlePayeeChange = (index: number, field: keyof Omit<Payee, 'id'>, value: string) => {
        const newPayees = [...formData.payees];
        newPayees[index] = { ...newPayees[index], [field]: value };
        setFormData(prev => ({ ...prev, payees: newPayees }));
    };

    const removePayee = (id: string) => {
        setFormData(prev => ({ ...prev, payees: prev.payees.filter(p => p.id !== id) }));
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: (files && files.length > 0) ? files[0] : null }));
    };

    const handleInventoryChange = (index: number, field: 'size' | 'count', value: string) => {
        const newInventory = [...formData.plotInventory];
        newInventory[index] = {...newInventory[index], [field]: value as PlotSize};
        setFormData(prev => ({...prev, plotInventory: newInventory}));
    };

    const addInventoryRow = () => {
        setFormData(prev => ({...prev, plotInventory: [...prev.plotInventory, {size: '70x100 ft', count: ''}]}));
    };

    const removeInventoryRow = (index: number) => {
        if (formData.plotInventory.length > 1) {
            setFormData(prev => ({...prev, plotInventory: prev.plotInventory.filter((_, i) => i !== index)}));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const regStatusMap: Record<string, Property['registrationStatus']> = {
            'LRD': 'Titled', 'PVLMD': 'Indenture', 'SMD': 'Plotted', 'LVD': 'Indenture'
        };

        const totalSizeAcres = parseFloat(formData.totalSizeAcres) || 0;
        
        const finalInventory: PlotInventory[] = formData.plotInventory
            .filter(item => parseInt(item.count) > 0)
            .map(item => ({
                size: item.size,
                count: parseInt(item.count),
                sold: 0
            }));
        
        const totalPlots = finalInventory.reduce((sum, item) => sum + item.count, 0);

        const newProperty: Property = {
            id: Date.now(),
            location: formData.location,
            description: `Land acquired from ${formData.ownerNames}`,
            size: totalSizeAcres,
            price: totalPlots > 0 ? (parseFloat(formData.totalPrice) / totalPlots) : 0,
            inventory: finalInventory,
            registrationStatus: regStatusMap[formData.registrationStatus] || 'Plotted',
        };
        await onSaveProperty(newProperty);

        setIsSaved(true);
        window.scrollTo(0, 0);
        setTimeout(() => {
            setIsSaved(false);
            setFormData(initialFormData);
        }, 4000);
    };

    // FIX: Define a strongly-typed array for signature fields to prevent type errors when accessing properties.
    const signatureFields: {key: 'familyRepSignature' | 'ceoSignature' | 'managingDirectorSignature' | 'accountsHeadSignature', label: string}[] = [
        {key: 'familyRepSignature', label: 'Family Representative'},
        {key: 'ceoSignature', label: 'CEO'},
        {key: 'managingDirectorSignature', label: 'Managing Director/Administrator'},
        {key: 'accountsHeadSignature', label: 'Accounts Head of Department'}
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                 <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to CEO Hub
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mt-2">FAIM Land Purchased (Product) Details Form</h1>
                </div>
            </div>

            {isSaved && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md" role="alert">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-6 h-6 mr-3"/>
                        <div>
                            <p className="font-bold">Success!</p>
                            <p>Land Purchase Details Successfully Recorded and Added to Property Listings.</p>
                        </div>
                    </div>
                </div>
            )}
            
            <form id="land-purchase-form" onSubmit={handleSubmit} className="space-y-6">
                <FormSection title="Section 1: Land, Inventory & Ownership Details" gridCols={1}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField id="ownerNames" label="Name of Owner(s)" value={formData.ownerNames} onChange={handleChange} required className="md:col-span-2" />
                        <FormField id="location" label="Location of Property" value={formData.location} onChange={handleChange} required />
                    </div>
                    <div className="mt-6 pt-4 border-t">
                        <h4 className="text-lg font-medium text-gray-800">Plot Inventory</h4>
                        <p className="text-sm text-gray-500 mb-2">Specify the number of plots for each available size. Total acreage will be calculated automatically.</p>
                        <div className="space-y-2">
                           {formData.plotInventory.map((item, index) => (
                               <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                   <div className="col-span-5">
                                       <SelectField id={`plot-size-${index}`} label={index === 0 ? "Plot Size" : ""} value={item.size} onChange={(e) => handleInventoryChange(index, 'size', e.target.value)}>
                                            <option>70x100 ft</option><option>70x50 ft</option><option>60x80 ft</option>
                                       </SelectField>
                                   </div>
                                   <div className="col-span-5">
                                        <FormField id={`plot-count-${index}`} label={index === 0 ? "Number of Plots" : ""} type="number" value={item.count} onChange={(e) => handleInventoryChange(index, 'count', e.target.value)} />
                                   </div>
                                    <div className="col-span-2 self-end pb-2">
                                        <button type="button" onClick={() => removeInventoryRow(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                   </div>
                               </div>
                           ))}
                        </div>
                        <button type="button" onClick={addInventoryRow} className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                            <PlusCircleIcon className="w-5 h-5"/> Add Another Plot Size
                        </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t">
                        <SelectField id="registrationStatus" label="Registration Status of Land" value={formData.registrationStatus} onChange={handleChange} required>
                            <option value="">Select division...</option>
                            <option value="LRD">LRD</option>
                            <option value="PVLMD">PVLMD</option>
                            <option value="SMD">SMD</option>
                            <option value="LVD">LVD</option>
                        </SelectField>
                        <FormField id="purchaseAgreementDate" label="Date of final signing of Purchase Agreement" type="date" value={formData.purchaseAgreementDate} onChange={handleChange} required />
                        <FormField id="pricePerAcre" label="Price Per acre (GHC)" type="number" value={formData.pricePerAcre} onChange={handleChange} placeholder="e.g., 50000.00" />
                        <FormField id="totalSizeAcres" label="Total Size of Land (acres)" type="number" value={formData.totalSizeAcres} onChange={()=>{}} readOnly />
                        <FormField id="totalPrice" label="Total Price of entire Land (GHC)" type="number" value={formData.totalPrice} onChange={() => {}} readOnly className="md:col-span-1" />
                    </div>
                </FormSection>

                <FormSection title="Section 2: Official & Legal Details">
                    <FormField id="familyName" label="Official Name of Family" value={formData.familyName} onChange={handleChange} />
                    <FormField id="nameOnSearch" label="Name on Official search at Time of Acquisition" value={formData.nameOnSearch} onChange={handleChange} />
                    <FileUploadField id="officialSearchDoc" label="Official Search Document" file={formData.officialSearchDoc} onChange={handleFileChange} accept=".pdf,image/*" />
                    <FileUploadField id="sitePlanDoc" label="Site Plan" file={formData.sitePlanDoc} onChange={handleFileChange} accept=".pdf,image/*" />
                </FormSection>

                <FormSection title="Section 3: Negotiators & Family Contacts">
                    <FormField id="leadNegotiators" label="Name(s) of lead Negotiators/Contact Persons" type="textarea" value={formData.leadNegotiators} onChange={handleChange} placeholder="1. John Doe&#10;2. Jane Smith" className="lg:col-span-3"/>
                    <FormField id="familyContactPerson" label="Name of family contact person" value={formData.familyContactPerson} onChange={handleChange} />
                    <FormField id="phone1" label="Telephone No. 1" type="tel" value={formData.phoneNumbers[0]} onChange={(e) => handlePhoneChange(0, e.target.value)} />
                    <FormField id="phone2" label="Telephone No. 2" type="tel" value={formData.phoneNumbers[1]} onChange={(e) => handlePhoneChange(1, e.target.value)} />
                    <FormField id="additionalNotes" label="Additional note" type="textarea" value={formData.additionalNotes} onChange={handleChange} className="lg:col-span-3" />
                </FormSection>

                <FormSection title="Section 4: Payment Schedule" gridCols={1}>
                    <div className="bg-gray-50 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField id="paymentAmountPerMonth" label="Amount Per Month (GHC)" type="number" value={formData.paymentAmountPerMonth} onChange={handleChange} />
                         <FormField id="paymentPeriodMonths" label="Total Payment Period (months)" type="number" value={formData.paymentPeriodMonths} onChange={handleChange} />
                         <SelectField id="recurringPaymentTime" label="Preferred Recurrent Payment Time" value={formData.recurringPaymentTime} onChange={handleChange}>
                            <option value="">Select schedule...</option>
                            <option>Monthly</option>
                            <option>Bi-Monthly</option>
                            <option>Quarterly</option>
                            <option>Annually</option>
                        </SelectField>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-800">Individuals Designated by Family to be Paid</h4>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-left">
                                    <tr>
                                        <th className="p-2">Name of Payee (Family Member)</th>
                                        <th className="p-2">Number of Acres Allocated</th>
                                        <th className="p-2">Amount Allocated (GHC)</th>
                                        <th className="p-2 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.payees.map((payee, index) => (
                                        <tr key={payee.id} className="border-b">
                                            <td><input type="text" value={payee.name} onChange={(e) => handlePayeeChange(index, 'name', e.target.value)} className="w-full p-2 border-0 focus:ring-1 focus:ring-blue-500"/></td>
                                            <td><input type="number" value={payee.acres} onChange={(e) => handlePayeeChange(index, 'acres', e.target.value)} className="w-full p-2 border-0 focus:ring-1 focus:ring-blue-500"/></td>
                                            <td><input type="number" value={payee.amount} onChange={(e) => handlePayeeChange(index, 'amount', e.target.value)} className="w-full p-2 border-0 focus:ring-1 focus:ring-blue-500"/></td>
                                            <td><button type="button" onClick={() => removePayee(payee.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full"><TrashIcon className="w-5 h-5"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {formData.payees.length < 10 && (
                            <button type="button" onClick={addPayee} className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                <PlusCircleIcon className="w-5 h-5"/> Add Payee
                            </button>
                        )}
                    </div>
                </FormSection>

                <FormSection title="Section 5: Signatures & Verification" gridCols={2}>
                    <FormField id="signingDate" label="Signed on this Day of" type="date" value={formData.signingDate} onChange={handleChange} className="lg:col-span-2" />
                    {signatureFields.map(sig => (
                        <div key={sig.key} className="sm:col-span-1">
                            <FormField id={`${sig.key}Name`} label={`${sig.label} Name`} value={formData[sig.key].name} onChange={(e) => handleSignatureChange(sig.key, 'name', e.target.value)} />
                            <div className="mt-2 h-20 bg-gray-50 border border-dashed rounded-md flex items-center justify-center">
                                <span className="text-sm text-gray-500">Signature Area</span>
                            </div>
                        </div>
                    ))}
                </FormSection>

            </form>
            
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200 flex justify-end">
                <button type="submit" form="land-purchase-form" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-lg" style={{backgroundColor: '#D4AF37'}}>
                    Save Property
                </button>
            </div>
        </div>
    );
};

export default LandPurchaseFormPage;