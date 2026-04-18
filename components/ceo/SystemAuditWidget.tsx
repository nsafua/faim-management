import React from 'react';
import { Card } from '../ui/Card';
import { Property, Client } from '../../types';
import { CurrencyDollarIcon, BriefcaseIcon } from '../icons/DummyIcons';

interface SystemAuditWidgetProps {
    clients: Client[];
    properties: Property[];
}

export const SystemAuditWidget: React.FC<SystemAuditWidgetProps> = ({ clients, properties }) => {
    return (
        <Card title="Risk & Compliance">
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/50">
                    <CurrencyDollarIcon className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-red-800 dark:text-red-400">Arrears Alert</p>
                        <p className="text-[10px] text-red-600 dark:text-red-300/80 mt-1">{clients.filter(c => (c.payment?.balance || 0) > (c.payment?.total || 0) * 0.5).length} clients have &gt;50% outstanding balance.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-400">Operational Update</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-300/80 mt-1">{properties.filter(p => p.registrationStatus === 'Indenture').length} properties pending final title certification.</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
