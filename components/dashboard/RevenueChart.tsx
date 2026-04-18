
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
    data: { name: string; revenue: number }[];
    isDark: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isDark }) => {
    const GRID_COLOR = isDark ? '#374151' : '#E5E7EB';
    const TEXT_COLOR = isDark ? '#9CA3AF' : '#6B7280';
    const TOOLTIP_BG = isDark ? '#1F2937' : '#FFFFFF';
    const TOOLTIP_BORDER = isDark ? '#374151' : '#E5E7EB';
    const TOOLTIP_TEXT = isDark ? '#F3F4F6' : '#111827';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Revenue Trend</h3>
            <div className="flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
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
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: TOOLTIP_BG, borderColor: TOOLTIP_BORDER, borderRadius: '8px', color: TOOLTIP_TEXT }}
                            itemStyle={{ color: TOOLTIP_TEXT }}
                            formatter={(value: number) => [`GHC ${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
