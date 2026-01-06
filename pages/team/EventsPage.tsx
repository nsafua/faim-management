
import React from 'react';

const EventsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Company Events</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Calendar of upcoming company events.</p>
            <div className="mt-6 bg-white dark:bg-gray-800 p-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Events Calendar</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">This feature is under construction.</p>
            </div>
        </div>
    );
};

export default EventsPage;
