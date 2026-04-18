import { useMemo } from 'react';
import { Property, Client, Staff, Invoice } from '../types';

export const useExecutiveSummary = (
    properties: Property[],
    clients: Client[]
) => {
    const statsData = useMemo(() => {
        const totalRevenue = clients.reduce((sum, client) => sum + (client.payment?.paid || 0), 0);
        const totalLands = properties.length;
        const totalClients = clients.length;
        const activeDeals = clients.filter(c => (c.payment?.balance || 0) > 0).length;
        const plotsSold = properties.reduce((acc, p) => acc + (p.inventory?.reduce((sum, inv) => sum + (inv.sold || 0), 0) || 0), 0);
        const totalPlots = properties.reduce((acc, p) => acc + (p.inventory?.reduce((sum, inv) => sum + (inv.count || 0), 0) || 0), 0);
        return { totalRevenue, totalLands, totalClients, activeDeals, plotsSold, totalPlots };
    }, [clients, properties]);

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `GHC ${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `GHC ${(amount / 1000).toFixed(1)}k`;
        return `GHC ${amount.toLocaleString()}`;
    };

    return {
        statsData,
        formatCurrency
    };
};
