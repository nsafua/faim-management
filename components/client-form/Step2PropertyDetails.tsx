
import React, { ChangeEvent, useRef, useEffect, useState } from 'react';
import { FormData } from './types';
import { Property } from '../../types';
import { SmartInputField, SmartSelectField } from './ClientFormFields';
import { FormSection } from './FormSection';
import { Badge } from '../ui/Badge';
import { CheckCircleIcon, ChevronDownIcon, XMarkIcon } from '../icons/DummyIcons';

interface Step2PropertyDetailsProps {
    formData: FormData;
    touched: Partial<Record<keyof FormData, boolean>>;
    errors: Partial<Record<keyof FormData, string>>;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleLocationChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    handlePlotsChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handlePdfChange: (e: ChangeEvent<HTMLInputElement>) => void;
    togglePlotSelection: (plotNumber: string) => void;
    properties: Property[];
    availablePlotsForLocation: { plotNumber: string; isTaken: boolean }[];
    isPropertyAvailable: boolean;
    pdfFile: File | null;
}

export const Step2PropertyDetails: React.FC<Step2PropertyDetailsProps> = ({
    formData, touched, errors, handleChange, handleBlur, handleLocationChange, handlePlotsChange, handlePdfChange, togglePlotSelection, properties, availablePlotsForLocation, isPropertyAvailable, pdfFile
}) => {
    const [isPlotDropdownOpen, setIsPlotDropdownOpen] = useState(false);
    const plotDropdownRef = useRef<HTMLDivElement>(null);
    
    // Authority Check: Is the plot price valid for reservation?
    const isPriceMissing = !formData.price || parseFloat(formData.price) <= 0;

    // Close plot dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (plotDropdownRef.current && !plotDropdownRef.current.contains(event.target as Node)) {
                setIsPlotDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedPlots = formData.plotNumber.split(',').map(x => x.trim()).filter(Boolean);

    return (
        <div className="animate-in fade-in duration-300">
             <FormSection title="Property & Transaction Details">
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SmartSelectField id="location" label="Location*" value={formData.location} onChange={handleLocationChange} onBlur={handleBlur} required disabled={!isPropertyAvailable} error={touched.location ? errors.location : undefined} isTouched={touched.location}>
                        <option value="">{isPropertyAvailable ? '-- Select Location --' : 'No properties available'}</option>
                        {properties.map(p => <option key={p.id} value={p.location}>{p.location}</option>)}
                    </SmartSelectField>

                    <SmartInputField id="numberOfPlots" label="Plots Required*" type="number" value={formData.numberOfPlots} onChange={handlePlotsChange} onBlur={handleBlur} required placeholder="1" error={touched.numberOfPlots ? errors.numberOfPlots : undefined} isTouched={touched.numberOfPlots} />

                    <SmartInputField id="price" label="Total Price (GHC)*" value={formData.price} readOnly required error={touched.price ? errors.price : undefined} isTouched={touched.price} placeholder="Auto-calculated" />
                </div>
                
                <div className="sm:col-span-2 space-y-2 relative" ref={plotDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Plot(s)* <span className="text-gray-400 font-normal text-xs">(Based on CEO Hub Inventory)</span></label>
                    
                    {/* Multi-Select Dropdown Toggle - Disabled if price is missing */}
                    <div 
                        onClick={() => formData.location && !isPriceMissing && setIsPlotDropdownOpen(!isPlotDropdownOpen)}
                        className={`min-h-[42px] flex flex-wrap gap-2 items-center p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm cursor-pointer transition-all ${(!formData.location || isPriceMissing) ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'hover:border-blue-500'}`}
                    >
                        {selectedPlots.length > 0 ? (
                            selectedPlots.map(plot => (
                                <Badge 
                                    key={plot} 
                                    variant="info" 
                                    className="flex items-center gap-1.5 py-1 px-2 text-[11px]"
                                >
                                    {plot}
                                    <XMarkIcon 
                                        className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePlotSelection(plot);
                                        }}
                                    />
                                </Badge>
                            ))
                        ) : (
                            <span className="text-gray-400 text-sm pl-1">
                                {isPriceMissing ? 'Valid price required for reservation.' : (formData.location ? '-- Choose plot numbers --' : 'Select a location first')}
                            </span>
                        )}
                        <div className="ml-auto pr-1">
                            <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isPlotDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isPlotDropdownOpen && formData.location && !isPriceMissing && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-top-1 duration-200">
                            <div className="max-h-[250px] overflow-y-auto scrollbar-thin divide-y divide-gray-100 dark:divide-gray-700">
                                {availablePlotsForLocation.length > 0 ? (
                                    availablePlotsForLocation.map(p => (
                                        <label 
                                            key={p.plotNumber}
                                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${p.isTaken ? 'opacity-50 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'}`}
                                        >
                                            <input 
                                                type="checkbox"
                                                disabled={p.isTaken}
                                                checked={selectedPlots.includes(p.plotNumber)}
                                                onChange={() => togglePlotSelection(p.plotNumber)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 bg-white dark:bg-gray-700"
                                            />
                                            <div className="flex-grow">
                                                <span className={`text-sm font-bold ${selectedPlots.includes(p.plotNumber) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {p.plotNumber}
                                                </span>
                                                {p.isTaken && (
                                                    <span className="ml-2 text-[10px] uppercase font-black text-red-500">Taken</span>
                                                )}
                                            </div>
                                            {selectedPlots.includes(p.plotNumber) && (
                                                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                                            )}
                                        </label>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">No plots found for this location.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {errors.plotNumber && touched.plotNumber && <p className="text-xs text-red-500 mt-1">{errors.plotNumber}</p>}
                </div>

                <SmartSelectField id="propertyType" label="Usage Category" value={formData.propertyType} onChange={handleChange} onBlur={handleBlur} error={touched.propertyType ? errors.propertyType : undefined} isTouched={touched.propertyType}>
                    <option>Residential</option>
                    <option>Commercial</option>
                </SmartSelectField>
                <SmartInputField id="plannedDevelopmentYear" label="Development Year" type="number" value={formData.plannedDevelopmentYear} onChange={handleChange} onBlur={handleBlur} error={touched.plannedDevelopmentYear ? errors.plannedDevelopmentYear : undefined} isTouched={touched.plannedDevelopmentYear}/>
                <SmartInputField id="paymentDate" label="Reg. Date" type="date" value={formData.paymentDate} onChange={handleChange} onBlur={handleBlur} required error={touched.paymentDate ? errors.paymentDate : undefined} isTouched={touched.paymentDate}/>
                <SmartSelectField id="paymentMethod" label="Method" value={formData.paymentMethod} onChange={handleChange} onBlur={handleBlur} error={touched.paymentMethod ? errors.paymentMethod : undefined} isTouched={touched.paymentMethod}>
                    <option>Bank Transfer</option><option>Cash</option><option>MoMo</option><option>Cheque</option>
                </SmartSelectField>
                <div className={`sm:col-span-2 p-3 rounded-md border relative ${touched.filledFormPdf && errors.filledFormPdf ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Form Scan</label>
                    <div className="mt-1 flex items-center">
                        <label htmlFor="filledFormPdf-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>{pdfFile ? pdfFile.name : (formData.filledFormPdf ? 'Uploaded' : 'Select PDF')}</span>
                            <input id="filledFormPdf-upload" name="filledFormPdf" type="file" className="sr-only" onChange={handlePdfChange} accept="application/pdf" />
                        </label>
                    </div>
                </div>
             </FormSection>

            <FormSection title="Indenture Name Preference">
                <SmartInputField id="indentureName" label="Full Name" value={formData.indentureName} onChange={handleChange} onBlur={handleBlur} required error={touched.indentureName ? errors.indentureName : undefined} isTouched={touched.indentureName}/>
                <SmartInputField id="indentureAddress" label="Address" value={formData.indentureAddress} onChange={handleChange} onBlur={handleBlur} required error={touched.indentureAddress ? errors.indentureAddress : undefined} isTouched={touched.indentureAddress}/>
            </FormSection>
        </div>
    );
};
