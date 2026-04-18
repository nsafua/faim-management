
import { useMemo } from 'react';
import { Client, Property, Invoice } from '../types';

export const useDashboardAnalytics = (clients: Client[], properties: Property[], invoices: Invoice[]) => {
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
                    if (txn.date && (txn.status === 'Success' || !txn.status)) {
                        const month = txn.date.substring(0, 7); // YYYY-MM
                        if (month.match(/^\d{4}-\d{2}$/)) {
                             monthlyRevenue[month] = (monthlyRevenue[month] || 0) + txn.amount;
                        }
                    }
                });
            }
        });

        return Object.entries(monthlyRevenue)
            .map(([date, amount]) => ({
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                dateStr: date, // for sorting
                revenue: amount
            }))
            .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
            .slice(-6); // Last 6 active months
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
        
        return data.filter(d => d.value > 0);
    }, [clients]);

    return { statsData, revenueData, growthData, statusData };
};
