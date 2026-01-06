
import React from 'react';
import { Property, Staff } from '../types';
import { ArrowLeftIcon } from '../components/icons/DummyIcons';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

interface PropertiesPageProps {
  properties: Property[];
  onBack?: () => void;
  currentStaff: Staff;
}

const getRegistrationStatusBadgeVariant = (status: Property['registrationStatus']) => {
  switch (status) {
    case 'Titled': return 'info';
    case 'Indenture': return 'purple';
    case 'Plotted': return 'warning';
    default: return 'neutral';
  }
};

const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH').format(amount)}`;

const PropertiesPage: React.FC<PropertiesPageProps> = ({ properties, onBack }) => {
  return (
    <div className="space-y-6">
      <div>
        {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
            </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Properties</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all property listings, inventory, and registration details.</p>
      </div>

      <TableContainer>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <Thead>
                <tr>
                    <Th>Location</Th>
                    <Th>Registration Status</Th>
                    <Th>Plot Inventory</Th>
                    <Th className="text-right">Price per Plot</Th>
                    <Th className="text-center">Availability</Th>
                </tr>
            </Thead>
            <Tbody>
                {properties.map(prop => {
                    const totalPlots = prop.inventory.reduce((sum, inv) => sum + inv.count, 0);
                    const plotsSold = prop.inventory.reduce((sum, inv) => sum + inv.sold, 0);
                    const plotsAvailable = totalPlots - plotsSold;
                    const soldPercentage = totalPlots > 0 ? (plotsSold / totalPlots) * 100 : 0;
                    const isAvailable = plotsAvailable > 0;
                    
                    const isDiscountActive = prop.discount && new Date(prop.discount.endDate) >= new Date();
                    const discountedPrice = isDiscountActive ? prop.price * (1 - prop.discount.percentage / 100) : prop.price;

                    return (
                        <Tr key={prop.id}>
                            <Td className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                {prop.location}
                            </Td>
                            <Td>
                                <Badge variant={getRegistrationStatusBadgeVariant(prop.registrationStatus)}>
                                    {prop.registrationStatus}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex flex-col min-w-[180px]">
                                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        <span>{plotsSold} Sold / {totalPlots} Total</span>
                                        <span>({plotsAvailable} Left)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                            </Td>
                            <Td className="font-semibold text-gray-800 dark:text-white text-right">
                               {isDiscountActive ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-green-600 dark:text-green-400 font-bold">{formatCurrency(discountedPrice)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-red-500 line-through">{formatCurrency(prop.price)}</span>
                                            <Badge variant="success" className="text-[10px] px-1 py-0">
                                                {prop.discount?.percentage}% OFF
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    formatCurrency(prop.price)
                                )}
                            </Td>
                            <Td className="text-center">
                                <Badge variant={isAvailable ? 'success' : 'danger'}>
                                    {isAvailable ? 'Available' : 'Sold Out'}
                                </Badge>
                            </Td>
                        </Tr>
                    );
                })}
            </Tbody>
        </table>
        {properties.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No properties found.</p>
            </div>
        )}
      </TableContainer>
    </div>
  );
};
export default PropertiesPage;
