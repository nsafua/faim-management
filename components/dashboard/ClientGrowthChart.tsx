
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientGrowthChartProps {
    data: { name: string; clients: number }[];
    isDark: boolean;
}

export const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ data, isDark }) => {
    const GRID_COLOR = isDark ? '#374151' : '#E5E7EB';
    const TEXT_COLOR = isDark ? '#9CA3AF' : '#6B7280';
    const TOOLTIP_BG = isDark ? '#1F2937' : '#FFFFFF';
    const TOOLTIP_BORDER = isDark ? '#374151' : '#E5E7EB';
    const TOOLTIP_TEXT = isDark ? '#F3F4F6' : '#111827';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Client Growth</h3>
            <div className="flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: TEXT_COLOR, fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: TEXT_COLOR, fontSize: 12 }} 
                        />
                        <Tooltip 
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ backgroundColor: TOOLTIP_BG, borderColor: TOOLTIP_BORDER, borderRadius: '8px', color: TOOLTIP_TEXT }}
                            itemStyle={{ color: TOOLTIP_TEXT }}
                        />
                        <Bar 
                            dataKey="clients" 
                            name="New Clients" 
                            fill="#3B82F6" 
                            radius={[4, 4, 0, 0]} 
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
