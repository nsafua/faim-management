
import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface StatusPieChartProps {
    data: { name: string; value: number }[];
    isDark: boolean;
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data, isDark }) => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const TOOLTIP_BG = isDark ? '#1F2937' : '#FFFFFF';
    const TOOLTIP_BORDER = isDark ? '#374151' : '#E5E7EB';
    const TOOLTIP_TEXT = isDark ? '#F3F4F6' : '#111827';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex flex-col lg:col-span-2 xl:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Process Status</h3>
            <div className="flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: TOOLTIP_BG, borderColor: TOOLTIP_BORDER, borderRadius: '8px', color: TOOLTIP_TEXT }}
                            itemStyle={{ color: TOOLTIP_TEXT }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
