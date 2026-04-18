
import React from 'react';
import { 
    FolderIcon, 
    CheckCircleIcon, 
    InformationCircleIcon, 
    ClockIcon, 
    UserCheckIcon 
} from '../icons/DummyIcons';

export const MILESTONE_DEFINITIONS = [
    { code: 'SFR', label: 'Submitted Form Received', desc: 'Initial registration form logged in system.', icon: <FolderIcon className="w-5 h-5" /> },
    { code: 'PLR', label: 'Payment for Land Received', desc: 'Full cost of plot(s) settled by client.', icon: <CheckCircleIcon className="w-5 h-5" /> },
    { code: 'PFI', label: 'Payment For Indenture', desc: 'Indenture processing fees paid.', icon: <InformationCircleIcon className="w-5 h-5" /> },
    { code: '3MP', label: '3 Months Processing', desc: 'Standard turnaround time for legal docs.', icon: <ClockIcon className="w-5 h-5" /> },
    { code: 'IR', label: 'Indenture Ready', desc: 'Documents signed and ready for pick-up.', icon: <UserCheckIcon className="w-5 h-5" /> },
    { code: 'DPU', label: 'Picked-Up For Signing', desc: 'Client collected docs to execute physically.', icon: <FolderIcon className="w-5 h-5" /> },
    { code: 'CPD', label: 'Final Document Pickup', desc: 'Handover of finalized title documents.', icon: <CheckCircleIcon className="w-5 h-5" /> },
    { code: 'ACA', label: 'Address Assigned', desc: 'Digital coordinates and physical address set.', icon: <UserCheckIcon className="w-5 h-5" /> },
];
