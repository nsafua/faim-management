
import React from 'react';
import { Card } from '../ui/Card';

interface CEOStatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    bgColor: string;
    darkBgColor: string;
}

export const CEOStatCard: React.FC<CEOStatCardProps> = ({ icon, title, value, bgColor, darkBgColor }) => (
  <Card className="flex flex-row items-center space-x-4 p-4">
    <div className={`p-3 rounded-full ${bgColor} ${darkBgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </Card>
);
