import React from 'react';
import { Property } from '../types';
import { ArrowLeftIcon, MapIcon } from '../components/icons/DummyIcons';

interface AllLandLayoutsPageProps {
    onBack: () => void;
    properties: Property[];
}

const AllLandLayoutsPage: React.FC<AllLandLayoutsPageProps> = ({ onBack, properties }) => {
    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                     <MapIcon className="w-10 h-10 text-purple-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">All Land Layouts</h1>
                        <p className="text-gray-500 mt-1">View all available site and land layouts.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="space-y-4">
                    {properties.map(prop => (
                        <div key={prop.id} className="p-4 border rounded-md hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{prop.location}</h3>
                                <p className="text-sm text-gray-500">{prop.description}</p>
                            </div>
                            {prop.layoutPdfUrl ? (
                                <a href={prop.layoutPdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                                    View Layout
                                </a>
                            ) : (
                                <span className="text-sm text-gray-400">No layout available</span>
                            )}
                        </div>
                    ))}
                    {properties.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No properties found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllLandLayoutsPage;
