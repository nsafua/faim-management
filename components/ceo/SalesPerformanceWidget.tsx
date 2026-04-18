import React from 'react';
import { Card } from '../ui/Card';
import { Invoice } from '../../types';

interface SalesPerformanceWidgetProps {
    statsData: any;
    invoices: Invoice[];
    formatCurrency: (amount: number) => string;
}

export const SalesPerformanceWidget: React.FC<SalesPerformanceWidgetProps> = ({ statsData, invoices, formatCurrency }) => {
    return (
        <Card title="Sales Performance Snapshot">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                        <span>Inventory Liquidated</span>
                        <span>{statsData.totalPlots > 0 ? Math.round((statsData.plotsSold / statsData.totalPlots) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full shadow-sm" style={{ width: `${statsData.totalPlots > 0 ? (statsData.plotsSold / statsData.totalPlots) * 100 : 0}%` }}></div>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 font-medium">Recent Notable Invoices</p>
                    <div className="mt-3 space-y-3">
                        {invoices.slice(0, 3).map(inv => (
                            <div key={inv.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate max-w-[120px]">{inv.clientName}</span>
                                <span className="font-black text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};
