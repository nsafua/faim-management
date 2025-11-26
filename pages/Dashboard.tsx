import React, { useMemo } from 'react';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import { BanknotesIcon, CheckCircleIcon, ClockIcon, DocumentDuplicateIcon, ExclamationTriangleIcon, UserGroupIcon } from '../components/icons/DummyIcons';
import { Client, Property, Invoice } from '../types';

type Stat = {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: React.ReactNode;
};

interface DashboardProps {
    clients: Client[];
    properties: Property[];
    invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, properties, invoices }) => {
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

    const formatCurrency = (amount: number) => `GHC${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

    const stats: Stat[] = [
        { title: "Total Clients", value: statsData.totalClients.toString(), change: "+0%", changeType: "increase", icon: <UserGroupIcon className="w-8 h-8 text-blue-500" /> },
        { title: "Active Processes", value: statsData.activeProcesses.toString(), change: "+0%", changeType: "increase", icon: <ClockIcon className="w-8 h-8 text-orange-500" /> },
        { title: "Completed Deals", value: statsData.completedDeals.toString(), change: "+0%", changeType: "increase", icon: <CheckCircleIcon className="w-8 h-8 text-green-500" /> },
        { title: "Total Revenue", value: formatCurrency(statsData.totalRevenue), change: "+0%", changeType: "increase", icon: <BanknotesIcon className="w-8 h-8 text-teal-500" /> },
        { title: "Pending Payments", value: statsData.pendingPayments.toString(), change: "-0%", changeType: "decrease", icon: <ExclamationTriangleIcon className="w-8 h-8 text-red-500" /> },
        { title: "Available Plots", value: statsData.availablePlots.toString(), change: "+0%", changeType: "increase", icon: <DocumentDuplicateIcon className="w-8 h-8 text-purple-500" /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Real-time business analytics and insights</p>
                </div>
                <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ChartPlaceholder title="Revenue Trend" change="+0%" />
                 <ChartPlaceholder title="Client Growth" change="+0%" />
                 <ChartPlaceholder title="Process Status Distribution" />
            </div>
        </div>
    );
};

export default Dashboard;
