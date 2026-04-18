
import React, { ChangeEvent } from 'react';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { BanknotesIcon } from '../../components/icons/DummyIcons';

interface LandOwnershipDetailsProps {
    formData: any;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    plotsPerAcreError: string;
    formatCurrencyString: (val: string) => string;
}

export const LandOwnershipDetails: React.FC<LandOwnershipDetailsProps> = ({ formData, handleChange, plotsPerAcreError, formatCurrencyString }) => {
    return (
        <Card title="Section 1: Land & Ownership Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input id="ownerNames" name="ownerNames" label="Name of Owner(s)" value={formData.ownerNames} onChange={handleChange} required containerClassName="md:col-span-2" />
                <Input id="location" name="location" label="Location of Property" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Select id="registrationStatus" name="registrationStatus" label="Legal Registration Status" value={formData.registrationStatus} onChange={handleChange} required>
                    <option value="">Select status...</option>
                    <option value="LRD">LRD Registered</option>
                    <option value="PVLMD">PVLMD Licensed</option>
                    <option value="SMD">SMD Verified</option>
                    <option value="LVD">LVD Documented</option>
                </Select>
                <Input id="purchaseAgreementDate" name="purchaseAgreementDate" label="Date of Final Signing" type="date" value={formData.purchaseAgreementDate} onChange={handleChange} required />
                
                <Input id="totalSizeAcres" name="totalSizeAcres" label="Number of Acres*" type="text" value={formData.totalSizeAcres} onChange={handleChange} placeholder="0.00" required />
                
                <Input id="pricePerAcre" name="pricePerAcre" label="Cost per Acre (GHC)*" type="number" value={formData.pricePerAcre} onChange={handleChange} placeholder="0.00" className="no-spinner font-bold" required />
                
                <Input id="totalPrice" name="totalPrice" label="Total Cost of Land (GHC)" type="text" value={formatCurrencyString(formData.totalPrice)} readOnly containerClassName="md:col-span-2 bg-gray-50/50" className="font-black text-gray-700 dark:text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-gray-700 bg-blue-50/20 dark:bg-blue-900/5 p-4 rounded-xl">
                <Input 
                    id="plotsPerAcre" 
                    name="plotsPerAcre" 
                    label="Number of Plots Per Acre*" 
                    type="text" 
                    value={formData.plotsPerAcre} 
                    onChange={handleChange} 
                    error={plotsPerAcreError}
                    placeholder="e.g. 6"
                    className="font-bold text-lg text-blue-700 dark:text-blue-300"
                />
                
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost per Plot (GHC)</label>
                    <div className={`flex items-center px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm h-[42px] transition-colors ${!formData.pricePerPlot ? 'bg-gray-100 opacity-60' : ''}`}>
                        <BanknotesIcon className="w-5 h-5 text-gray-400 mr-2" />
                        {formData.pricePerPlot ? (
                            <span className="font-black text-lg text-gray-900 dark:text-white">
                                GHC {formatCurrencyString(formData.pricePerPlot)}
                            </span>
                        ) : (
                            <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                                Enter cost per acre to calculate
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
