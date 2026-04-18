import React from 'react';
import { CEOStatCard } from './CEOStatCard';
import { 
    BanknotesIcon, 
    BuildingLibraryIcon, 
    UsersIcon, 
    ArrowTrendingUpIcon,
    ChartPieIcon,
    DocumentDuplicateIcon
} from '../icons/DummyIcons';

interface RevenueSummaryWidgetProps {
    statsData: any;
    formatCurrency: (amount: number) => string;
}

export const RevenueSummaryWidget: React.FC<RevenueSummaryWidgetProps> = ({ statsData, formatCurrency }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <CEOStatCard icon={<BanknotesIcon className="w-6 h-6 text-green-600"/>} title="Gross Revenue" value={formatCurrency(statsData.totalRevenue)} bgColor="bg-green-100" darkBgColor="dark:bg-green-900/30" />
            <CEOStatCard icon={<BuildingLibraryIcon className="w-6 h-6 text-blue-600"/>} title="Land Portfolio" value={String(statsData.totalLands)} bgColor="bg-blue-100" darkBgColor="dark:bg-blue-900/30" />
            <CEOStatCard icon={<UsersIcon className="w-6 h-6 text-purple-600"/>} title="Total Clients" value={String(statsData.totalClients)} bgColor="bg-purple-100" darkBgColor="dark:bg-purple-900/30" />
            <CEOStatCard icon={<ArrowTrendingUpIcon className="w-6 h-6 text-orange-600"/>} title="Active Deals" value={String(statsData.activeDeals)} bgColor="bg-orange-100" darkBgColor="dark:bg-orange-900/30" />
            <CEOStatCard icon={<ChartPieIcon className="w-6 h-6 text-teal-600"/>} title="Plots Sold" value={String(statsData.plotsSold)} bgColor="bg-teal-100" darkBgColor="dark:bg-teal-900/30" />
            <CEOStatCard icon={<DocumentDuplicateIcon className="w-6 h-6 text-indigo-600"/>} title="Total Plots" value={String(statsData.totalPlots)} bgColor="bg-indigo-100" darkBgColor="dark:bg-indigo-900/30" />
        </div>
    );
};
