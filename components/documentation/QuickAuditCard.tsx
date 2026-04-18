
import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuickAuditCardProps {
    onExport: () => void;
}

export const QuickAuditCard: React.FC<QuickAuditCardProps> = ({ onExport }) => {
    return (
        <Card title="Quick Audit Action">
                <p className="text-xs text-gray-500 leading-relaxed mb-4">Milestones are automatically triggered by system events. Use this page to verify compliance with the 3-month legal turnaround period.</p>
                <Button variant="secondary" className="w-full text-[10px] font-black uppercase tracking-widest" onClick={onExport}>Export Fulfillment Report</Button>
        </Card>
    );
};
