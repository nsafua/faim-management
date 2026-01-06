
import React from 'react';
import { ArrowLeftIcon } from '../components/icons/DummyIcons';

interface PlaceholderPageProps {
  title: string;
  onBack: () => void;
  message?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, onBack, message }) => {
  return (
    <div className="space-y-6">
       <div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
      </div>
      <div className="mt-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
      </div>
      <div className="mt-6 bg-white dark:bg-gray-800 p-20 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center transition-colors duration-200">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white">{message ? 'Notice' : 'Coming Soon!'}</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{message || 'This feature is currently in development and will be available shortly.'}</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
