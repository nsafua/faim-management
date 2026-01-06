
import React, { useMemo } from 'react';
import StatCard from '../components/StatCard';
import { BanknotesIcon, CheckCircleIcon, ClockIcon, DocumentDuplicateIcon, ExclamationTriangleIcon, UserGroupIcon } from '../components/icons/DummyIcons';
import { useClients, useProperties, useInvoices } from '../hooks/useAppData';
import { useTheme } from '../context/ThemeContext';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard: React.FC = () => {
    const { clients } = useClients();
    const { properties } = useProperties();
    const { invoices } = useInvoices();
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    // -- Derived Stats Data --
    const statsData = useMemo(() => {
        const totalClients = clients.length;
        const activeProcesses = clients.filter(c => c.stage !== 'COMP').length;
        const completedDeals = clients.filter(c => c.stage === 'COMP').length;
        const totalRevenue = clients.reduce((acc, client) => acc + client.payment.paid, 0);
        const pendingPayments = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;
        const availablePlots = properties.reduce((acc, prop) => {
            const totalPlots = prop.inventory.reduce((sum, inv) => sum + inv.count, 0);
            const plotsSold = prop.inventory.reduce((sum, inv) => sum + inv.sold, 0);
            return acc + (totalPlots - plotsSold);
        }, 0);

        return { totalClients, activeProcesses, completedDeals, totalRevenue, pendingPayments, availablePlots };
    }, [clients, properties, invoices]);

    // -- Chart Data Preparation --

    // 1. Revenue Trend (Monthly)
    const revenueData = useMemo(() => {
        const monthlyRevenue: Record<string, number> = {};
        
        clients.forEach(client => {
            if(client.payment && client.payment.paymentHistory) {
                client.payment.paymentHistory.forEach(txn => {
                    // Ensure date exists and is valid. Assuming txn.date is YYYY-MM-DD
                    if (txn.date && (txn.status === 'Success' || !txn.status)) { // Count success or legacy w/o status
                        const month = txn.date.substring(0, 7); // YYYY-MM
                        if (month.match(/^\d{4}-\d{2}$/)) {
                             monthlyRevenue[month] = (monthlyRevenue[month] || 0) + txn.amount;
                        }
                    }
                });
            }
        });

        // Convert to array and sort
        const sortedData = Object.entries(monthlyRevenue)
            .map(([date, amount]) => ({
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                dateStr: date, // for sorting
                revenue: amount
            }))
            .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
            .slice(-6); // Last 6 active months

        return sortedData;
    }, [clients]);

    // 2. Client Growth (Monthly Registrations)
    const growthData = useMemo(() => {
        const monthlyGrowth: Record<string, number> = {};

        clients.forEach(client => {
            if (client.regDate) {
                const month = client.regDate.substring(0, 7);
                if (month.match(/^\d{4}-\d{2}$/)) {
                    monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
                }
            }
        });

        return Object.entries(monthlyGrowth)
            .map(([date, count]) => ({
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                dateStr: date,
                clients: count
            }))
            .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
            .slice(-6);
    }, [clients]);

    // 3. Process Status Distribution
    const statusData = useMemo(() => {
        const stageCounts: Record<string, number> = {};
        
        clients.forEach(client => {
            const stage = client.stage || 'Unknown';
            stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });

        const STAGE_LABELS: Record<string, string> = {
            'REG': 'Registration',
            'PAYM': 'Payment',
            'IND': 'Indenture',
            'COMP': 'Completed'
        };

        const data = Object.entries(stageCounts).map(([stage, count]) => ({
            name: STAGE_LABELS[stage] || stage,
            value: count
        }));
        
        // Filter out zero values if any
        return data.filter(d => d.value > 0);
    }, [clients]);

    const formatCurrency = (amount: number) => `GHC${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
    const formatCurrencyCompact = (amount: number) => `GHC${new Intl.NumberFormat('en-GH', { notation: 'compact', compactDisplay: 'short' }).format(amount)}`;

    const stats = [
        { title: "Total Clients", value: statsData.totalClients.toString(), change: "+0%", changeType: "increase" as const, icon: <UserGroupIcon className="w-8 h-8 text-blue-500" /> },
        { title: "Active Processes", value: statsData.activeProcesses.toString(), change: "+0%", changeType: "increase" as const, icon: <ClockIcon className="w-8 h-8 text-orange-500" /> },
        { title: "Completed Deals", value: statsData.completedDeals.toString(), change: "+0%", changeType: "increase" as const, icon: <CheckCircleIcon className="w-8 h-8 text-green-500" /> },
        { title: "Total Revenue", value: formatCurrencyCompact(statsData.totalRevenue), change: "+0%", changeType: "increase" as const, icon: <BanknotesIcon className="w-8 h-8 text-teal-500" /> },
        { title: "Pending Payments", value: statsData.pendingPayments.toString(), change: "-0%", changeType: "decrease" as const, icon: <ExclamationTriangleIcon className="w-8 h-8 text-red-500" /> },
        { title: "Available Plots", value: statsData.availablePlots.toString(), change: "+0%", changeType: "increase" as const, icon: <DocumentDuplicateIcon className="w-8 h-8 text-purple-500" /> },
    ];

    // Chart Colors
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']; // Blue, Green, Yellow, Red, Purple, Pink
    const GRID_COLOR = isDark ? '#374151' : '#E5E7EB';
    const TEXT_COLOR = isDark ? '#9CA3AF' : '#6B7280';
    const TOOLTIP_BG = isDark ? '#1F2937' : '#FFFFFF';
    const TOOLTIP_BORDER = isDark ? '#374151' : '#E5E7EB';
    const TOOLTIP_TEXT = isDark ? '#F3F4F6' : '#111827';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time business analytics and insights</p>
                </div>
                <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                    Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {/* Revenue Trend Chart */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Revenue Trend</h3>
                    <div className="flex-grow min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

                 {/* Client Growth Chart */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Client Growth</h3>
                    <div className="flex-grow min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

                 {/* Process Status Distribution */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex flex-col lg:col-span-2 xl:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Process Status</h3>
                    <div className="flex-grow min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
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
            </div>
        </div>
    );
};

export default Dashboard;
