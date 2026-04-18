
import React from 'react';
import { 
    HomeIcon, 
    ShieldCheckIcon, 
    CurrencyDollarIcon, 
    UsersIcon, 
    MapPinIcon, 
    BriefcaseIcon, 
    BellIcon, 
    BookOpenIcon 
} from '../icons/DummyIcons';

export interface SupportTopic {
    id: string;
    category: string;
    title: string;
    description: string;
    steps?: string[];
    glossary?: { term: string; definition: string }[];
    icon: React.ReactNode;
    screenshotUrl?: string;
}

export const SUPPORT_TOPICS: SupportTopic[] = [
    {
        id: '001',
        category: 'Introduction',
        title: 'Welcome to Legacy ERP',
        description: 'Legacy ERP is a modern, responsive enterprise management system designed for real estate operations. It centralizes client acquisition, financial tracking, land inventory, and team collaboration into a single secure platform.',
        icon: <HomeIcon className="w-5 h-5 text-blue-600" />,
        screenshotUrl: 'https://placehold.co/1200x800/e2e8f0/475569?text=Welcome+Dashboard+Overview'
    },
    {
        id: '002',
        category: 'Getting Started',
        title: 'Logging In & Authentication',
        description: 'Accessing the system requires verified staff credentials.',
        steps: [
            'Navigate to the application URL.',
            'Enter your registered staff email address.',
            'Enter your secure password.',
            'Click "Sign In" to access your assigned dashboard.'
        ],
        icon: <ShieldCheckIcon className="w-5 h-5 text-green-600" />,
        screenshotUrl: 'https://placehold.co/1200x800/e2e8f0/475569?text=Login+Portal+View'
    },
    {
        id: '004',
        category: 'Account Management',
        title: 'Financial Ledger & Ledger Management',
        description: 'The Account Management module allows tracking of client payments, discounts, and payment plans.',
        steps: [
            'Open Account Management from the sidebar.',
            'Select "New Ledger" or click the edit icon on an existing invoice.',
            'Initialize financial values like Land Price and Indenture fees.',
            'Apply promotional discounts where applicable.'
        ],
        icon: <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />,
        screenshotUrl: 'https://placehold.co/1200x800/e2e8f0/475569?text=Financial+Ledger+Editor'
    },
    {
        id: '007',
        category: 'Clients',
        title: 'Adding & Managing Clients',
        description: 'Registered clients are the core of the system. New entries trigger notifications for financial initialization.',
        steps: [
            'Go to the Clients page.',
            'Click "Add New Client".',
            'Complete the multi-step form (Personal, Acquisition, Office Use).',
            'Save to trigger an allocation flag for verified payments.'
        ],
        icon: <UsersIcon className="w-5 h-5 text-indigo-600" />,
        screenshotUrl: 'https://placehold.co/1200x800/e2e8f0/475569?text=Client+Registration+Form'
    },
    {
        id: '009',
        category: 'Allocation',
        title: 'Plot Allocation Protocol',
        description: 'Plots can only be permanently allocated once a client reaches the 70% payment threshold.',
        steps: [
            'Navigate to Administration > Allocate Plot.',
            'Select the qualified client and desired location.',
            'Verify entitlement count.',
            'Select specific plot numbers and confirm allocation.'
        ],
        icon: <MapPinIcon className="w-5 h-5 text-red-600" />,
        screenshotUrl: 'https://placehold.co/1200x800/e2e8f0/475569?text=Plot+Allocation+Grid'
    },
    {
        id: '011',
        category: 'CEO Hub',
        title: 'Strategic Portfolio Management',
        description: 'High-level oversight of land acquisitions and profit margins.',
        steps: [
            'Use "New Land Acquisition" to record vendor agreements.',
            'Monitor "Purchase & Sale Management" to adjust market prices.',
            'Review AI-powered Analytics for business growth insights.'
        ],
        icon: <BriefcaseIcon className="w-5 h-5 text-amber-600" />
    },
    {
        id: '016',
        category: 'Notifications',
        title: 'Automated Alerts & Escalations',
        description: 'The system automatically flags critical events based on business logic.',
        steps: [
            'Qualification Alerts: Reaching 70% payment.',
            'Escalations: 90-hour delay in plot allocation.',
            'Default Alerts: 3-month payment inactivity.'
        ],
        icon: <BellIcon className="w-5 h-5 text-rose-600" />,
        screenshotUrl: 'https://placehold.co/1200x800/e2e8f0/475569?text=Notification+Center+Alerts'
    },
    {
        id: '018',
        category: 'Glossary',
        title: 'System Terminology',
        description: 'Key acronyms used throughout the platform.',
        glossary: [
            { term: 'REG', definition: 'Registration Stage' },
            { term: 'PAYM', definition: 'Payment Stage' },
            { term: 'IND', definition: 'Indenture Documentation Stage' },
            { term: 'COMP', definition: 'Completed Deal' },
            { term: 'ACA', definition: 'Accounts Category A' }
        ],
        icon: <BookOpenIcon className="w-5 h-5 text-gray-600" />
    }
];
