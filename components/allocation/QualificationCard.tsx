
import React, { useMemo } from 'react';
import { Client } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
    UserCircleIcon, 
    MapPinIcon, 
    LockClosedIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    InformationCircleIcon 
} from '../icons/DummyIcons';

interface QualificationCardProps {
    client: Client;
}

export const QualificationCard: React.FC<QualificationCardProps> = ({ client }) => {
    const qualification = useMemo(() => {
        if (!client) return { isQualified: false, percentage: 0, status: 'N/A', hasAllocated: false };
        
        const total = client.payment.total || 1;
        const paid = client.payment.paid || 0;
        const percentage = (paid / total) * 100;
        const isQualified = percentage >= 70;
        const hasAllocated = client.allocationStatus === 'ALLOCATED';
        
        return {
            percentage: Math.round(percentage),
            isQualified,
            hasAllocated,
            status: hasAllocated 
                ? 'Record Finalized' 
                : isQualified 
                    ? 'Qualified (≥70%)' 
                    : 'Provisionally Flagged (<70%)'
        };
    }, [client]);

    const hasPlots = client.plot && client.plot !== 'N/A' && client.plot.trim() !== '';

    return (
        <Card title="Qualification Detail" className="lg:col-span-1 space-y-6">
            {/* Part A: Payment Status */}
            <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Payment Progress</p>
                <div className="relative">
                    <p className={`text-2xl font-black ${qualification.hasAllocated ? 'text-blue-600' : qualification.isQualified ? 'text-green-600' : 'text-amber-600'}`}>
                        {qualification.percentage}%
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{qualification.status}</p>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className={`h-full transition-all duration-1000 ${qualification.hasAllocated ? 'bg-blue-600' : qualification.isQualified ? 'bg-green-500' : 'bg-amber-500'}`} 
                        style={{ width: `${qualification.percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Part B: Allocation Audit */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Client:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{client.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Location:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{client.location || 'NONE'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Plot(s):</span>
                        <span className="font-bold text-gray-900 dark:text-white">{hasPlots ? client.plot : 'NONE'}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-2">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 font-medium">Plot Status:</span>
                            <Badge 
                                variant={qualification.hasAllocated ? 'success' : hasPlots ? 'warning' : 'neutral'} 
                                className="font-black uppercase tracking-tighter text-[10px]"
                            >
                                {qualification.hasAllocated ? 'ALLOCATED' : hasPlots ? 'RESERVED' : 'NONE'}
                            </Badge>
                        </div>
                        {!hasPlots && (
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 italic">
                                No plots reserved for this client yet.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">
                        {qualification.hasAllocated ? 'Allocation record verified.' : 'No allocation has been done for this client.'}
                    </p>
                </div>

                {/* Allocation Specific Messages */}
                {qualification.hasAllocated ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 rounded-r-lg space-y-2 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                            <LockClosedIcon className="w-4 h-4 shadow-sm" />
                            <p className="text-[10px] font-black uppercase tracking-tight">Allocation Finalized</p>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                            Allocation already completed. Plot number(s) <span className="font-black underline">{client.plot}</span> have been allocated to this client. 
                        </p>
                        <p className="text-[10px] text-blue-500 italic font-bold">
                            Request amendment to add or update plot numbers.
                        </p>
                    </div>
                ) : !qualification.isQualified ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg space-y-1 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-tight">Ineligible for Allocation</p>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                            Client has not paid up to 70%. Allocation cannot be confirmed.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 rounded-r-lg space-y-1 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                            <CheckCircleIcon className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-tight">Eligibility Verified</p>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                            Client qualifies for allocation. Confirm allocation in the panel to finalize.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};
