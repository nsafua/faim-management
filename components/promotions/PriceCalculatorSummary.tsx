
import React from 'react';

interface PriceCalculatorSummaryProps {
    currentOriginalPrice: number;
    computedPromoPrice: number;
}

export const PriceCalculatorSummary: React.FC<PriceCalculatorSummaryProps> = ({ currentOriginalPrice, computedPromoPrice }) => {
    return (
        <>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Base Price</p>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">GHC {currentOriginalPrice.toLocaleString()}</p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Generated Promo Price</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-300">GHC {computedPromoPrice.toLocaleString()}</p>
                <p className="text-[9px] text-blue-500 italic mt-1">Calculated from: Original Price - Discount</p>
            </div>
        </>
    );
};
