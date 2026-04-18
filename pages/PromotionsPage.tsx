
import React, { useState, ChangeEvent, FormEvent, useMemo } from 'react';
import { Promotion, Property } from '../types';
import { ArrowLeftIcon } from '../components/icons/DummyIcons';
import { uploadFile } from '../services/storageService';

// Modular Imports
import { PromotionForm } from '../components/promotions/PromotionForm';
import { PromotionList } from '../components/promotions/PromotionList';

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
    targetPlotSize: '70x100 ft',
    numberOfPlots: 1,
    originalPrice: 0,
    promoPrice: 0
};

const PromotionsPage: React.FC<PromotionsPageProps> = ({ promotions, onSavePromotion, onDeletePromotion, properties, showForm = false, onBack }) => {
    const [formData, setFormData] = useState<Omit<Promotion, 'id'>>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Compute original price based on selected property
    const currentOriginalPrice = useMemo(() => {
        if (formData.applicablePropertyId === 'all') return 0;
        const prop = properties.find(p => p.id === formData.applicablePropertyId);
        return prop ? prop.price : 0;
    }, [formData.applicablePropertyId, properties]);

    // Real-time Promotional Price computation
    const computedPromoPrice = useMemo(() => {
        const discount = formData.discountValue || 0;
        return Math.max(0, currentOriginalPrice - discount);
    }, [currentOriginalPrice, formData.discountValue]);

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
                originalPrice: currentOriginalPrice,
                promoPrice: computedPromoPrice,
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
            targetPlotSize: promo.targetPlotSize || '70x100 ft',
            numberOfPlots: promo.numberOfPlots || 1,
            originalPrice: promo.originalPrice || 0,
            promoPrice: promo.promoPrice || 0
        });
        setBannerPreview(promo.bannerImage || null);
        setBannerFile(null);
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

            {showForm && (
                <PromotionForm 
                    formData={formData}
                    editingId={editingId}
                    properties={properties}
                    currentOriginalPrice={currentOriginalPrice}
                    computedPromoPrice={computedPromoPrice}
                    bannerPreview={bannerPreview}
                    bannerFile={bannerFile}
                    isSaving={isSaving}
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                />
            )}

            <PromotionList 
                promotions={promotions}
                properties={properties}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusToggle={handleStatusToggle}
            />
        </div>
    );
};

export default PromotionsPage;
