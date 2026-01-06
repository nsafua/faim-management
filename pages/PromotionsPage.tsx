
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Promotion, Property } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, UploadIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { uploadFile } from '../services/storageService';

interface PromotionsPageProps {
    promotions: Promotion[];
    onSavePromotion: (promotion: Promotion) => Promise<void>;
    onDeletePromotion: (promotionId: number) => Promise<void>;
    properties: Property[];
    showForm?: boolean;
    onBack?: () => void;
}

const initialFormState: Omit<Promotion, 'id'> = {
    title: '',
    description: '',
    promoType: 'Discount',
    startDate: '',
    endDate: '',
    discountValue: 0,
    applicablePropertyId: 'all',
    status: 'Active',
    bannerImage: undefined,
};

const PromotionsPage: React.FC<PromotionsPageProps> = ({ promotions, onSavePromotion, onDeletePromotion, properties, showForm = false, onBack }) => {
    const [formData, setFormData] = useState<Omit<Promotion, 'id'>>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setBannerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatusToggle = (promo: Promotion) => {
        const updatedPromo: Promotion = { ...promo, status: promo.status === 'Active' ? 'Inactive' : 'Active' };
        onSavePromotion(updatedPromo);
    };
    
    const handleReset = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setBannerPreview(null);
        setBannerFile(null);
        setIsSaving(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let bannerUrl = formData.bannerImage;
            if (bannerFile) {
                bannerUrl = await uploadFile(bannerFile, `promotions/banners/${bannerFile.name}`);
            }

            const promoToSave: Promotion = {
                id: editingId !== null ? editingId : Date.now(),
                ...formData,
                bannerImage: bannerUrl,
            };
            await onSavePromotion(promoToSave);
            handleReset();
        } catch (error) {
            console.error("Error saving promotion:", error);
            alert("Failed to save promotion.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (promo: Promotion) => {
        setEditingId(promo.id);
        setFormData({
            title: promo.title,
            description: promo.description,
            promoType: promo.promoType,
            startDate: promo.startDate,
            endDate: promo.endDate,
            discountValue: promo.discountValue,
            applicablePropertyId: promo.applicablePropertyId,
            status: promo.status,
            bannerImage: promo.bannerImage,
        });
        setBannerPreview(promo.bannerImage || null);
        setBannerFile(null); // Reset file input
        window.scrollTo(0, 0);
    };

    const handleDelete = (id: number) => {
        onDeletePromotion(id);
    };

    return (
        <div className="space-y-6">
            <div>
                 {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                    </button>
                )}
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Promotional Offers Management</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Create, manage, and track all marketing promotions.</p>
            </div>

            {/* Promo Creation Form - Conditionally Rendered */}
            {showForm && (
              <Card title={editingId ? 'Edit Promotion' : 'Create New Promotion'}>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Input label="Promo Title*" name="title" value={formData.title} onChange={handleInputChange} required />
                      <div className="md:col-span-2">
                          <Textarea label="Promo Description*" name="description" value={formData.description} onChange={handleInputChange} required rows={1} />
                      </div>
                      <Select label="Promo Type" name="promoType" value={formData.promoType} onChange={handleInputChange}>
                          <option>Discount</option><option>Free Plot</option><option>Referral Bonus</option><option>Seasonal Offer</option><option>Other</option>
                      </Select>
                      <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                      <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                      <Input label="Discount % or Value" type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} />
                      <Select label="Applicable Property" name="applicablePropertyId" value={formData.applicablePropertyId} onChange={handleInputChange}>
                          <option value="all">All Properties</option>
                          {properties.map(p => <option key={p.id} value={p.id}>{p.location}</option>)}
                      </Select>
                      <Select label="Promo Status" name="status" value={formData.status} onChange={handleInputChange}>
                          <option value="Active">Active</option><option value="Inactive">Inactive</option>
                      </Select>
                       <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Banner Image</label>
                          <div className="mt-1 flex items-center gap-4">
                             {bannerPreview && <img src={bannerPreview} alt="Banner" className="h-12 w-24 object-cover rounded-md" />}
                             <label htmlFor="banner-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors">
                                <UploadIcon className="w-5 h-5"/>
                                <span>{bannerFile ? 'Change Image' : (bannerPreview ? 'Change Image' : 'Upload Image')}</span>
                                <input id="banner-upload" name="bannerImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                             </label>
                          </div>
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                          <Button type="button" variant="secondary" onClick={handleReset}>Cancel</Button>
                          <Button type="submit" isLoading={isSaving}>{editingId ? 'Update Promotion' : 'Save Promotion'}</Button>
                      </div>
                  </form>
              </Card>
            )}

            {/* Promo List */}
            <TableContainer>
                <table className="w-full text-sm text-left">
                    <Thead>
                        <tr>
                            <Th>Title</Th>
                            <Th>Type</Th>
                            <Th>Duration</Th>
                            <Th>Applicable To</Th>
                            <Th className="text-center">Status</Th>
                            <Th className="text-center">Actions</Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {promotions.map(promo => (
                            <Tr key={promo.id}>
                                <Td className="font-medium text-gray-900 dark:text-white">{promo.title}</Td>
                                <Td className="text-gray-600 dark:text-gray-300">{promo.promoType}</Td>
                                <Td className="text-gray-600 dark:text-gray-300">{promo.startDate} to {promo.endDate}</Td>
                                <Td className="text-gray-600 dark:text-gray-300">{promo.applicablePropertyId === 'all' ? 'All Properties' : properties.find(p=>p.id === promo.applicablePropertyId)?.location}</Td>
                                <Td className="text-center">
                                    <button onClick={() => handleStatusToggle(promo)}>
                                        <Badge variant={promo.status === 'Active' ? 'success' : 'danger'}>{promo.status}</Badge>
                                    </button>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(promo)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(promo.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </table>
                {promotions.length === 0 && <div className="text-center py-10 text-gray-500 dark:text-gray-400">No promotions found.</div>}
            </TableContainer>
        </div>
    );
};

export default PromotionsPage;
