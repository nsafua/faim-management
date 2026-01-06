
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
}
