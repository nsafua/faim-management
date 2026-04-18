
import React from 'react';
import { MilestoneRecord } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MILESTONE_DEFINITIONS } from './milestoneData';

interface MilestoneTimelineProps {
    milestones: MilestoneRecord[];
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
    return (
        <Card title="Timeline Overview" className="lg:col-span-2 p-0 overflow-hidden">
            <div className="p-8 space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[3.25rem] top-10 bottom-10 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                {MILESTONE_DEFINITIONS.map((def, idx) => {
                    const record = milestones.find(m => m.milestoneCode === def.code);
                    const isCompleted = !!record;
                    
                    return (
                        <div key={def.code} className={`flex items-start gap-6 pb-12 last:pb-0 relative z-10 transition-opacity ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-green-600 border-green-100 dark:border-green-900/30 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 shadow-inner'}`}>
                                {def.icon}
                            </div>
                            <div className="flex-grow pt-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-black text-lg uppercase tracking-tight ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                        {def.label}
                                    </h3>
                                    {isCompleted ? (
                                        <Badge variant="success" className="font-bold">{record.dateCompleted}</Badge>
                                    ) : (
                                        <Badge variant="neutral">Pending</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{def.desc}</p>
                                {record?.notes && (
                                    <p className="text-xs italic text-blue-600 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                        Note: {record.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
