
import React from 'react';
import { Staff, Role, ActivityLog } from '../types';

// Modular Imports
import { HRPageHeader } from '../components/hr/HRPageHeader';
import { StaffDirectory } from '../components/hr/StaffDirectory';

interface HumanResourcesPageProps {
  onBack: () => void;
  staff: Staff[];
  roles: Role[];
  addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const HumanResourcesPage: React.FC<HumanResourcesPageProps> = ({ onBack, staff, roles }) => {
    // In a real app, these functions would open modals to upload/update details
    const handleEditDetails = (staffId: string) => {
        alert(`Editing employment details for staff ID: ${staffId}`);
    };
    
    const handleManageDocuments = (staffId: string) => {
        alert(`Managing documents for staff ID: ${staffId}`);
    };

    return (
        <div className="space-y-6">
            <HRPageHeader onBack={onBack} />

            <StaffDirectory 
                staff={staff} 
                roles={roles} 
                onEditDetails={handleEditDetails} 
                onManageDocuments={handleManageDocuments} 
            />
        </div>
    );
};

export default HumanResourcesPage;
