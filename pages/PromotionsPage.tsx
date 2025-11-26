import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Promotion, Property } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, UploadIcon } from '../components/icons/DummyIcons';

interface PromotionsPageProps {
    promotions: Promotion[];
    onSavePromotion: (promotion: Promotion) => Promise<void>;
    onDeletePromotion: (promotionId: number) => Promise<void>;
    properties: Property[];
    showForm?: boolean;
    onBack?: () => void;
}

// FIX: Removed non-existent 'driveFileId' from Omit type.
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, bannerImage: base64String }));
                setBannerPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatusToggle = (promo: Promotion) => {
        // FIX: Explicitly typed 'updatedPromo' to ensure 'status' property conforms to 'Active' | 'Inactive'.
        const updatedPromo: Promotion = { ...promo, status: promo.status === 'Active' ? 'Inactive' : 'Active' };
        onSavePromotion(updatedPromo);
    };
    
    const handleReset = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setBannerPreview(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        // FIX: Removed non-existent 'driveFileId' from the object creation.
        const promoToSave: Promotion = {
            id: editingId !== null ? editingId : Date.now(),
            ...formData,
        };
        onSavePromotion(promoToSave);
        handleReset();
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
        window.scrollTo(0, 0);
    };

    const handleDelete = (id: number) => {
        onDeletePromotion(id);
    };

    return (
        <div className="space-y-6">
            <div>
                 {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                    </button>
                )}
                <h1 className="text-3xl font-bold text-gray-800">Promotional Offers Management</h1>
                <p className="text-gray-500 mt-1">Create, manage, and track all marketing promotions.</p>
            </div>

            {/* Promo Creation Form - Conditionally Rendered */}
            {showForm && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-4 border-b" style={{color: '#0047AB'}}>
                      {editingId ? 'Edit Promotion' : 'Create New Promotion'}
                  </h2>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Promo Title*</label>
                          <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className="mt-1 block w-full input-class" />
                      </div>
                      <div className="md:col-span-2">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Promo Description*</label>
                          <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} required rows={1} className="mt-1 block w-full input-class" />
                      </div>
                      <div className="md:col-span-1">
                          <label htmlFor="promoType" className="block text-sm font-medium text-gray-700">Promo Type</label>
                          <select name="promoType" id="promoType" value={formData.promoType} onChange={handleInputChange} className="mt-1 block w-full input-class">
                              <option>Discount</option>
                              <option>Free Plot</option>
                              <option>Referral Bonus</option>
                              <option>Seasonal Offer</option>
                              <option>Other</option>
                          </select>
                      </div>
                      <div className="md:col-span-1">
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                          <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 block w-full input-class" />
                      </div>
                      <div className="md:col-span-1">
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                          <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleInputChange} className="mt-1 block w-full input-class" />
                      </div>
                      <div className="md:col-span-1">
                          <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Discount % or Value</label>
                          <input type="number" name="discountValue" id="discountValue" value={formData.discountValue} onChange={handleInputChange} className="mt-1 block w-full input-class" />
                      </div>
                      <div className="md:col-span-1">
                          <label htmlFor="applicablePropertyId" className="block text-sm font-medium text-gray-700">Applicable Property</label>
                          <select name="applicablePropertyId" id="applicablePropertyId" value={formData.applicablePropertyId} onChange={handleInputChange} className="mt-1 block w-full input-class">
                              <option value="all">All Properties</option>
                              {properties.map(p => <option key={p.id} value={p.id}>{p.location}</option>)}
                          </select>
                      </div>
                       <div className="md:col-span-1">
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Promo Status</label>
                           <select name="status" id="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full input-class">
                              <option value="Active">Active</option>
                               <option value="Inactive">Inactive</option>
                          </select>
                      </div>
                       <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Upload Banner Image</label>
                          <div className="mt-1 flex items-center gap-4">
                             {bannerPreview && <img src={bannerPreview} alt="Banner" className="h-12 w-24 object-cover rounded-md" />}
                             <label htmlFor="banner-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <UploadIcon className="w-5 h-5"/>
                                <span>{bannerPreview ? 'Change Image' : 'Upload Image'}</span>
                                <input id="banner-upload" name="bannerImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                             </label>
                          </div>
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                          <button type="button" onClick={handleReset} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{editingId ? 'Update Promotion' : 'Save Promotion'}</button>
                      </div>
                  </form>
                  <style>{`.input-class { padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input-class:focus { outline: none; --tw-ring-color: #3B82F6; border-color: #3B82F6; }`}</style>
              </div>
            )}

            {/* Promo List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Duration</th>
                            <th className="px-6 py-3">Applicable To</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(promo => (
                            <tr key={promo.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{promo.title}</td>
                                <td className="px-6 py-4">{promo.promoType}</td>
                                <td className="px-6 py-4">{promo.startDate} to {promo.endDate}</td>
                                <td className="px-6 py-4">{promo.applicablePropertyId === 'all' ? 'All Properties' : properties.find(p=>p.id === promo.applicablePropertyId)?.location}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleStatusToggle(promo)} className={`px-2 py-1 text-xs font-semibold rounded-full ${promo.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {promo.status}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(promo)} className="text-gray-500 hover:text-blue-600 p-1"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(promo.id)} className="text-gray-500 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {promotions.length === 0 && <div className="text-center py-10 text-gray-500">No promotions found.</div>}
            </div>
        </div>
    );
};

export default PromotionsPage;