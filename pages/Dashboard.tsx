
import React from 'react';
import StatCard from '../components/StatCard';
import { BanknotesIcon, CheckCircleIcon, ClockIcon, DocumentDuplicateIcon, ExclamationTriangleIcon, UserGroupIcon } from '../components/icons/DummyIcons';
import { useClients, useProperties, useInvoices } from '../hooks/useAppData';
import { useTheme } from '../context/ThemeContext';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { ClientGrowthChart } from '../components/dashboard/ClientGrowthChart';
import { StatusPieChart } from '../components/dashboard/StatusPieChart';

const Dashboard: React.FC = () => {
    const { clients } = useClients();
    const { properties } = useProperties();
    const { invoices } = useInvoices();
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    // Use Custom Hook for Logic
    const { statsData, revenueData, growthData, statusData } = useDashboardAnalytics(clients, properties, invoices);

    const formatCurrencyCompact = (amount: number) => `GHC${new Intl.NumberFormat('en-GH', { notation: 'compact', compactDisplay: 'short' }).format(amount)}`;

    const stats = [
        { title: "Total Clients", value: statsData.totalClients.toString(), change: "+0%", changeType: "increase" as const, icon: <UserGroupIcon className="w-8 h-8 text-blue-500" /> },
        { title: "Active Processes", value: statsData.activeProcesses.toString(), change: "+0%", changeType: "increase" as const, icon: <ClockIcon className="w-8 h-8 text-orange-500" /> },
        { title: "Completed Deals", value: statsData.completedDeals.toString(), change: "+0%", changeType: "increase" as const, icon: <CheckCircleIcon className="w-8 h-8 text-green-500" /> },
        { title: "Total Revenue", value: formatCurrencyCompact(statsData.totalRevenue), change: "+0%", changeType: "increase" as const, icon: <BanknotesIcon className="w-8 h-8 text-teal-500" /> },
        { title: "Pending Payments", value: statsData.pendingPayments.toString(), change: "-0%", changeType: "decrease" as const, icon: <ExclamationTriangleIcon className="w-8 h-8 text-red-500" /> },
        { title: "Available Plots", value: statsData.availablePlots.toString(), change: "+0%", changeType: "increase" as const, icon: <DocumentDuplicateIcon className="w-8 h-8 text-purple-500" /> },
    ];

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
                 <RevenueChart data={revenueData} isDark={isDark} />
                 <ClientGrowthChart data={growthData} isDark={isDark} />
                 <StatusPieChart data={statusData} isDark={isDark} />
            </div>
        </div>
    );
};

export default Dashboard;
