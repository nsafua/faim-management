import React from 'react';
import { Staff, ActivityLog } from '../types';
import { ArrowLeftIcon, ClockIcon, EyeIcon, PencilIcon, PlusCircleIcon, TrashIcon, DocumentDuplicateIcon } from '../components/icons/DummyIcons';

interface StaffActivityPageProps {
  staffMember: Staff;
  logs: ActivityLog[];
  onBack: () => void;
}

const LogIcon: React.FC<{ type: ActivityLog['type'] }> = ({ type }) => {
    const iconMap: Record<ActivityLog['type'], React.ReactNode> = {
        'Login': <ArrowLeftIcon className="w-5 h-5 text-white -rotate-90" />,
        'Logout': <ArrowLeftIcon className="w-5 h-5 text-white rotate-90" />,
        'Create': <PlusCircleIcon className="w-5 h-5 text-white" />,
        'Update': <PencilIcon className="w-5 h-5 text-white" />,
        'Delete': <TrashIcon className="w-5 h-5 text-white" />,
        'View': <EyeIcon className="w-5 h-5 text-white" />,
        'Import': <DocumentDuplicateIcon className="w-5 h-5 text-white" />,
    };
    const colorMap: Record<ActivityLog['type'], string> = {
        'Login': 'bg-green-500',
        'Logout': 'bg-gray-500',
        'Create': 'bg-blue-500',
        'Update': 'bg-yellow-500',
        'Delete': 'bg-red-500',
        'View': 'bg-purple-500',
        'Import': 'bg-indigo-500',
    };
    return (
        <div className={`absolute -left-[21px] top-1 w-10 h-10 rounded-full flex items-center justify-center ${colorMap[type]}`}>
            {iconMap[type]}
        </div>
    );
}

// FIX: Changed prop from 'user' to 'staffMember' to match the props interface.
const UserActivityPage: React.FC<StaffActivityPageProps> = ({ staffMember, logs, onBack }) => {
  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl flex-shrink-0">
                {staffMember.initials}
            </div>
            <div className="flex-grow">
                <h1 className="text-3xl font-bold text-gray-800">{staffMember.fullName}</h1>
                <p className="text-gray-500 mt-1">Activity Log</p>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <div className="relative pl-6 border-l-2 border-gray-200">
            {logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                <div key={log.id} className="mb-8 relative">
                     <LogIcon type={log.type} />
                    <div className="ml-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">
                                {log.type} Event
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {new Date(log.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{log.description}</p>
                    </div>
                </div>
            ))}
             {logs.length === 0 && (
                <p className="text-sm text-gray-500">No activity history recorded for this user.</p>
            )}
        </div>
    </div>
    </div>
  );
};

export default UserActivityPage;