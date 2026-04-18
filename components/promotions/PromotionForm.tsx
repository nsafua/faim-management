
import React, { ChangeEvent, FormEvent } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { UploadIcon } from '../icons/DummyIcons';
import { Property, Promotion } from '../../types';
import { PriceCalculatorSummary } from './PriceCalculatorSummary';

interface PromotionFormProps {
    formData: Omit<Promotion, 'id'>;
    editingId: number | null;
    properties: Property[];
    currentOriginalPrice: number;
    computedPromoPrice: number;
    bannerPreview: string | null;
    bannerFile: File | null;
    isSaving: boolean;
    onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent) => void;
    onReset: () => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
    formData,
    editingId,
    properties,
    currentOriginalPrice,
    computedPromoPrice,
    bannerPreview,
    bannerFile,
    isSaving,
    onInputChange,
    onFileChange,
    onSubmit,
    onReset
}) => {
    return (
        <Card title={editingId ? 'Edit Promotion' : 'Create New Promotion'}>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input label="Promo Title*" name="title" value={formData.title} onChange={onInputChange} required />
                <div className="md:col-span-2">
                    <Textarea label="Promo Description*" name="description" value={formData.description} onChange={onInputChange} required rows={1} />
                </div>
                
                <Select label="Applicable Property*" name="applicablePropertyId" value={formData.applicablePropertyId} onChange={onInputChange} required>
                    <option value="all">Select a Property...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.location}</option>)}
                </Select>

                <Select label="Target Plot Size*" name="targetPlotSize" value={formData.targetPlotSize} onChange={onInputChange} required>
                    <option>70x100 ft</option>
                    <option>70x50 ft</option>
                    <option>60x80 ft</option>
                </Select>

                <Input label="Number of Plots for Promo*" type="number" name="numberOfPlots" value={formData.numberOfPlots} onChange={onInputChange} required />

                <Input label="Discount Value (GHC)*" type="number" name="discountValue" value={formData.discountValue} onChange={onInputChange} required />

                {/* Display computed prices */}
                <PriceCalculatorSummary 
                    currentOriginalPrice={currentOriginalPrice} 
                    computedPromoPrice={computedPromoPrice} 
                />

                <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={onInputChange} />
                <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={onInputChange} />
                
                <Select label="Promo Status" name="status" value={formData.status} onChange={onInputChange}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                </Select>

                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Banner Image</label>
                    <div className="mt-1 flex items-center gap-4">
                        {bannerPreview && <img src={bannerPreview} alt="Banner" className="h-12 w-24 object-cover rounded-md" />}
                        <label htmlFor="banner-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors">
                        <UploadIcon className="w-5 h-5"/>
                        <span>{bannerFile ? 'Change Image' : (bannerPreview ? 'Change Image' : 'Upload Image')}</span>
                        <input id="banner-upload" name="bannerImage" type="file" className="sr-only" onChange={onFileChange} accept="image/*" />
                        </label>
                    </div>
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                    <Button type="button" variant="secondary" onClick={onReset}>Cancel</Button>
                    <Button type="submit" isLoading={isSaving}>{editingId ? 'Update Promotion' : 'Save Promotion'}</Button>
                </div>
            </form>
        </Card>
    );
};
