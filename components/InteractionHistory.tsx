import React from 'react';
import { Interaction } from '../types';
import { PhoneIcon, EnvelopeIcon, UserGroupIcon, PencilSquareIcon, DocumentDuplicateIcon } from './icons/DummyIcons';

interface InteractionHistoryProps {
  interactions: Interaction[];
}

const interactionIcons: Record<Interaction['type'], React.ReactNode> = {
    Call: <PhoneIcon className="w-5 h-5 text-white" />,
    Email: <EnvelopeIcon className="w-5 h-5 text-white" />,
    Meeting: <UserGroupIcon className="w-5 h-5 text-white" />,
    Note: <PencilSquareIcon className="w-5 h-5 text-white" />,
    Amendment: <DocumentDuplicateIcon className="w-5 h-5 text-white" />,
};

const interactionColors: Record<Interaction['type'], string> = {
    Call: 'bg-blue-500',
    Email: 'bg-red-500',
    Meeting: 'bg-purple-500',
    Note: 'bg-gray-500',
    Amendment: 'bg-orange-500',
}

const InteractionHistory: React.FC<InteractionHistoryProps> = ({ interactions }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Interaction History</h3>
            <div className="relative pl-6 border-l-2 border-gray-200">
                {interactions.map((item, index) => (
                    <div key={item.id} className="mb-8 relative">
                         <div className={`absolute -left-[23px] top-1 w-10 h-10 rounded-full flex items-center justify-center ${interactionColors[item.type]}`}>
                            {interactionIcons[item.type]}
                        </div>
                        <div className="ml-8">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">
                                    {item.type} with <span className="text-blue-600">{item.agent}</span>
                                </p>
                                <p className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{item.notes}</p>
                        </div>
                    </div>
                ))}
                 {interactions.length === 0 && (
                    <p className="text-sm text-gray-500">No interaction history recorded.</p>
                )}
            </div>
        </div>
    );
};

export default InteractionHistory;