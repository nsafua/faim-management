
import React from 'react';
import { Client, MilestoneRecord } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MILESTONE_DEFINITIONS } from './milestoneData';

interface DossierHealthCardProps {
    client: Client;
    milestones: MilestoneRecord[];
}

export const DossierHealthCard: React.FC<DossierHealthCardProps> = ({ client, milestones }) => {
    return (
        <Card title="Dossier Health">
                <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-8 border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10">
                    <span className="text-2xl font-black text-green-600">
                        {Math.round((milestones.length / MILESTONE_DEFINITIONS.length) * 100)}%
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Lifecycle Completion</p>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-left space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400 uppercase font-black">Registered</span>
                        <span className="font-bold">{client.regDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400 uppercase font-black">Current Node</span>
                        <Badge variant="info">{(milestones[milestones.length-1]?.milestoneCode) || 'None'}</Badge>
                    </div>
                </div>
                </div>
        </Card>
    );
};
