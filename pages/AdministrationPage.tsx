
import React from 'react';
import { MapIcon, UserCheckIcon, MapPinIcon, FolderIcon, BriefcaseIcon } from '../components/icons/DummyIcons';
import { Card } from '../components/ui/Card';

interface AdministrationPageProps {
    setActivePage: (page: string) => void;
}

const AdminCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <Card 
        onClick={onClick}
        className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
        <div className="flex items-start justify-between">
            {/* FIX: Cast style object to React.CSSProperties to allow CSS custom properties. */}
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors" style={{ '--tw-bg-opacity': '0.8' } as React.CSSProperties}>
                {icon}
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </Card>
);

const AdministrationPage: React.FC<AdministrationPageProps> = ({ setActivePage }) => {
    
    const adminActions = [
        {
            title: "Human Resources",
            description: "Manage staff documents and employment details.",
            icon: <BriefcaseIcon className="w-8 h-8" />,
            page: 'Human Resources'
        },
        {
            title: "All Land Layouts",
            description: "View and manage all uploaded estate and land layouts.",
            icon: <MapIcon className="w-8 h-8" />,
            page: 'All Land Layouts'
        },
        {
            title: "Allocate Plot to Client",
            description: "Assign purchased plots to registered clients and update ownership records.",
            icon: <UserCheckIcon className="w-8 h-8" />,
            page: 'Allocate Plot'
        },
        {
            title: "Mappings",
            description: "Manage and update digital land maps and coordinates for each property.",
            icon: <MapPinIcon className="w-8 h-8" />,
            page: 'Mappings'
        },
        {
            title: "Client Documentation",
            description: "Access and upload legal documents, deeds, and client files.",
            icon: <FolderIcon className="w-8 h-8" />,
            page: 'Client Documentation'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Administration Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage estate layouts, plot allocations, client documents, and mapping activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminActions.map((action) => (
                    <AdminCard 
                        key={action.title}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        onClick={() => setActivePage(action.page)}
                    />
                ))}
            </div>
            <style>
                {`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.5s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default AdministrationPage;
