import React from 'react';
import { Property, Staff } from '../types';
import { ArrowLeftIcon } from '../components/icons/DummyIcons';

interface PropertiesPageProps {
  properties: Property[];
  onBack?: () => void;
  currentStaff: Staff;
}

const getRegistrationStatusColor = (status: Property['registrationStatus']) => {
  switch (status) {
    case 'Titled': return 'bg-blue-100 text-blue-800';
    case 'Indenture': return 'bg-purple-100 text-purple-800';
    case 'Plotted': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAvailabilityStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH').format(amount)}`;

const PropertiesPage: React.FC<PropertiesPageProps> = ({ properties, onBack }) => {
  return (
    <div className="space-y-6">
      <div>
        {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
            </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
        <p className="text-gray-500 mt-1">Manage all property listings, inventory, and registration details.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Location</th>
                    <th scope="col" className="px-6 py-3">Registration Status</th>
                    <th scope="col" className="px-6 py-3">Plot Inventory</th>
                    <th scope="col" className="px-6 py-3 text-right">Price per Plot</th>
                    <th scope="col" className="px-6 py-3 text-center">Availability</th>
                </tr>
            </thead>
            <tbody>
                {properties.map(prop => {
                    const totalPlots = prop.inventory.reduce((sum, inv) => sum + inv.count, 0);
                    const plotsSold = prop.inventory.reduce((sum, inv) => sum + inv.sold, 0);
                    const plotsAvailable = totalPlots - plotsSold;
                    const soldPercentage = totalPlots > 0 ? (plotsSold / totalPlots) * 100 : 0;
                    const isAvailable = plotsAvailable > 0;
                    
                    const isDiscountActive = prop.discount && new Date(prop.discount.endDate) >= new Date();
                    const discountedPrice = isDiscountActive ? prop.price * (1 - prop.discount.percentage / 100) : prop.price;

                    return (
                        <tr key={prop.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {prop.location}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRegistrationStatusColor(prop.registrationStatus)}`}>
                                    {prop.registrationStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <div className="flex justify-between text-xs font-medium text-gray-600">
                                        <span>{plotsSold} Sold / {totalPlots} Total</span>
                                        <span>({plotsAvailable} Left)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${soldPercentage}%` }}
                                            role="progressbar"
                                            aria-valuenow={soldPercentage}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-800 text-right">
                               {isDiscountActive ? (
                                    <div>
                                        <span className="text-green-600 font-bold">{formatCurrency(discountedPrice)}</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs text-red-500 line-through">{formatCurrency(prop.price)}</span>
                                            <span className="text-xs font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                                {prop.discount?.percentage}% OFF
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    formatCurrency(prop.price)
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityStatusColor(isAvailable)}`}>
                                    {isAvailable ? 'Available' : 'Sold Out'}
                                </span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
        {properties.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500">No properties found.</p>
            </div>
        )}
      </div>
    </div>
  );
};
export default PropertiesPage;
