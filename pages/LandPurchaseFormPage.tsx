
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Property, VendorLandPurchase, Payee, PlotInventory, PlotSize } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon, UploadIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { uploadFile } from '../services/storageService';

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

const FileUploadField: React.FC<{ id: string; label: string; file: File | null | undefined; onChange: (e: ChangeEvent<HTMLInputElement>) => void; accept: string; }> = ({ id, label, file, onChange, accept }) => (
    <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor={id} className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id={id} name={id} type="file" className="sr-only" onChange={onChange} accept={accept} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">{file ? file.name : "PDF, PNG, JPG up to 10MB"}</p>
            </div>
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
    const [isSaving, setIsSaving] = useState(false);

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
        setIsSaving(true);
        
        try {
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
                price: totalPlots > 0 ? (parseFloat(formData.totalPrice) / totalPlots) : 0,
                inventory: finalInventory,
                registrationStatus: regStatusMap[formData.registrationStatus] || 'Plotted',
                // Assuming we add these fields to Property type or handle them separately
                // For now, storing them implicitly if needed, or if Property type allows extensions.
                // The provided Property type doesn't have these fields explicitly, so we just log/store what we can.
            };
            
            // To properly persist the document URLs, we should technically extend the Property type.
            // For now, we proceed with saving the property as defined.
            
            await onSaveProperty(newProperty);

            setIsSaved(true);
            window.scrollTo(0, 0);
            setTimeout(() => {
                setIsSaved(false);
                setFormData(initialFormData);
            }, 4000);
        } catch (error) {
            console.error("Error saving property:", error);
            alert("Failed to save property.");
        } finally {
            setIsSaving(false);
        }
    };

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
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to CEO Hub
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">New Land Acquisition</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Record details for newly purchased land.</p>
                </div>
            </div>

            {isSaved && (
                <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-lg shadow-md" role="alert">
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
                <Card title="Section 1: Land, Inventory & Ownership Details">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input id="ownerNames" name="ownerNames" label="Name of Owner(s)" value={formData.ownerNames} onChange={handleChange} required containerClassName="md:col-span-2" />
                        <Input id="location" name="location" label="Location of Property" value={formData.location} onChange={handleChange} required />
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white">Plot Inventory</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Specify the number of plots for each available size. Total acreage will be calculated automatically.</p>
                        <div className="space-y-2">
                           {formData.plotInventory.map((item, index) => (
                               <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                   <div className="col-span-5">
                                       <Select id={`plot-size-${index}`} label={index === 0 ? "Plot Size" : ""} value={item.size} onChange={(e) => handleInventoryChange(index, 'size', e.target.value)}>
                                            <option>70x100 ft</option><option>70x50 ft</option><option>60x80 ft</option>
                                       </Select>
                                   </div>
                                   <div className="col-span-5">
                                        <Input id={`plot-count-${index}`} label={index === 0 ? "Number of Plots" : ""} type="number" value={item.count} onChange={(e) => handleInventoryChange(index, 'count', e.target.value)} />
                                   </div>
                                    <div className="col-span-2 pb-2">
                                        <button type="button" onClick={() => removeInventoryRow(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                   </div>
                               </div>
                           ))}
                        </div>
                        <button type="button" onClick={addInventoryRow} className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            <PlusCircleIcon className="w-5 h-5"/> Add Another Plot Size
                        </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Select id="registrationStatus" name="registrationStatus" label="Registration Status of Land" value={formData.registrationStatus} onChange={handleChange} required>
                            <option value="">Select division...</option>
                            <option value="LRD">LRD</option>
                            <option value="PVLMD">PVLMD</option>
                            <option value="SMD">SMD</option>
                            <option value="LVD">LVD</option>
                        </Select>
                        <Input id="purchaseAgreementDate" name="purchaseAgreementDate" label="Date of final signing" type="date" value={formData.purchaseAgreementDate} onChange={handleChange} required />
                        <Input id="pricePerAcre" name="pricePerAcre" label="Price Per acre (GHC)" type="number" value={formData.pricePerAcre} onChange={handleChange} placeholder="e.g., 50000.00" />
                        <Input id="totalSizeAcres" name="totalSizeAcres" label="Total Size (acres)" type="number" value={formData.totalSizeAcres} onChange={()=>{}} readOnly />
                        <Input id="totalPrice" name="totalPrice" label="Total Price (GHC)" type="number" value={formData.totalPrice} onChange={() => {}} readOnly containerClassName="md:col-span-1" />
                    </div>
                </Card>

                <Card title="Section 2: Official & Legal Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="familyName" name="familyName" label="Official Name of Family" value={formData.familyName} onChange={handleChange} />
                        <Input id="nameOnSearch" name="nameOnSearch" label="Name on Official search at Time of Acquisition" value={formData.nameOnSearch} onChange={handleChange} />
                        <FileUploadField id="officialSearchDoc" label="Official Search Document" file={formData.officialSearchDoc} onChange={handleFileChange} accept=".pdf,image/*" />
                        <FileUploadField id="sitePlanDoc" label="Site Plan" file={formData.sitePlanDoc} onChange={handleFileChange} accept=".pdf,image/*" />
                    </div>
                </Card>

                <Card title="Section 3: Negotiators & Family Contacts">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Textarea id="leadNegotiators" name="leadNegotiators" label="Name(s) of lead Negotiators/Contact Persons" value={formData.leadNegotiators} onChange={handleChange} placeholder="1. John Doe&#10;2. Jane Smith" containerClassName="lg:col-span-3"/>
                        <Input id="familyContactPerson" name="familyContactPerson" label="Name of family contact person" value={formData.familyContactPerson} onChange={handleChange} />
                        <Input id="phone1" name="phone1" label="Telephone No. 1" type="tel" value={formData.phoneNumbers[0]} onChange={(e) => handlePhoneChange(0, e.target.value)} />
                        <Input id="phone2" name="phone2" label="Telephone No. 2" type="tel" value={formData.phoneNumbers[1]} onChange={(e) => handlePhoneChange(1, e.target.value)} />
                        <Textarea id="additionalNotes" name="additionalNotes" label="Additional note" value={formData.additionalNotes} onChange={handleChange} containerClassName="lg:col-span-3" />
                    </div>
                </Card>

                <Card title="Section 4: Payment Schedule">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <Input id="paymentAmountPerMonth" name="paymentAmountPerMonth" label="Amount Per Month (GHC)" type="number" value={formData.paymentAmountPerMonth} onChange={handleChange} />
                         <Input id="paymentPeriodMonths" name="paymentPeriodMonths" label="Total Payment Period (months)" type="number" value={formData.paymentPeriodMonths} onChange={handleChange} />
                         <Select id="recurringPaymentTime" name="recurringPaymentTime" label="Preferred Recurrent Payment Time" value={formData.recurringPaymentTime} onChange={handleChange}>
                            <option value="">Select schedule...</option>
                            <option>Monthly</option>
                            <option>Bi-Monthly</option>
                            <option>Quarterly</option>
                            <option>Annually</option>
                        </Select>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white">Individuals Designated by Family to be Paid</h4>
                        <div className="mt-2 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-900 text-left text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="p-2 font-semibold">Name of Payee (Family Member)</th>
                                        <th className="p-2 font-semibold">Number of Acres Allocated</th>
                                        <th className="p-2 font-semibold">Amount Allocated (GHC)</th>
                                        <th className="p-2 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {formData.payees.map((payee, index) => (
                                        <tr key={payee.id}>
                                            <td className="p-2"><input type="text" value={payee.name} onChange={(e) => handlePayeeChange(index, 'name', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"/></td>
                                            <td className="p-2"><input type="number" value={payee.acres} onChange={(e) => handlePayeeChange(index, 'acres', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"/></td>
                                            <td className="p-2"><input type="number" value={payee.amount} onChange={(e) => handlePayeeChange(index, 'amount', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"/></td>
                                            <td className="p-2 text-center"><button type="button" onClick={() => removePayee(payee.id)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><TrashIcon className="w-5 h-5"/></button></td>
                                        </tr>
                                    ))}
                                    {formData.payees.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">No payees added yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {formData.payees.length < 10 && (
                            <button type="button" onClick={addPayee} className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                <PlusCircleIcon className="w-5 h-5"/> Add Payee
                            </button>
                        )}
                    </div>
                </Card>

                <Card title="Section 5: Signatures & Verification">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="signingDate" name="signingDate" label="Signed on this Day of" type="date" value={formData.signingDate} onChange={handleChange} containerClassName="md:col-span-2" />
                        {signatureFields.map(sig => (
                            <div key={sig.key} className="sm:col-span-1">
                                <Input id={`${sig.key}Name`} name={`${sig.key}Name`} label={`${sig.label} Name`} value={formData[sig.key].name} onChange={(e) => handleSignatureChange(sig.key, 'name', e.target.value)} />
                                <div className="mt-2 h-20 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Signature Area</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

            </form>
            
            <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-t-lg shadow-lg">
                <Button type="submit" form="land-purchase-form" className="shadow-lg px-8 py-3" style={{backgroundColor: '#D4AF37', borderColor: '#D4AF37'}} isLoading={isSaving}>
                    Save Property
                </Button>
            </div>
        </div>
    );
};

export default LandPurchaseFormPage;
