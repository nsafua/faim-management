
import { PlotSize } from './realEstate';

export interface Promotion {
    id: number;
    title: string;
    description: string;
    promoType: 'Discount' | 'Free Plot' | 'Referral Bonus' | 'Seasonal Offer' | 'Other';
    startDate: string;
    endDate: string;
    discountValue: number;
    applicablePropertyId: number | 'all';
    status: 'Active' | 'Inactive';
    bannerImage?: string;
    // Enhanced fields for pricing logic
    targetPlotSize?: PlotSize;
    numberOfPlots?: number;
    originalPrice?: number;
    promoPrice?: number;
}
