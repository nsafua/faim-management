
import React from 'react';
import { Property } from '../types';
import { ArrowLeftIcon, MapIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';

interface AllLandLayoutsPageProps {
    onBack: () => void;
    properties: Property[];
}

const AllLandLayoutsPage: React.FC<AllLandLayoutsPageProps> = ({ onBack, properties }) => {
    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                     <MapIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">All Land Layouts</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">View all available site and land layouts.</p>
                    </div>
                </div>
            </div>

            <Card>
                <div className="space-y-4">
                    {properties.map(prop => (
                        <div key={prop.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center transition-colors">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{prop.location}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{prop.description}</p>
                            </div>
                            {prop.layoutPdfUrl ? (
                                <a href={prop.layoutPdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                                    View Layout
                                </a>
                            ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500">No layout available</span>
                            )}
                        </div>
                    ))}
                    {properties.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No properties found.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AllLandLayoutsPage;
