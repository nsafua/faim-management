
import React, { useState, useMemo } from 'react';
import { Staff, Role, CompanySettings as CompanySettingsType } from '../types';
import { ShieldCheckIcon, UsersIcon, UserCircleIcon, BuildingLibraryIcon, ChatBubbleLeftEllipsisIcon } from '../components/icons/DummyIcons';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { CompanySettings } from '../components/settings/CompanySettings';
import { RolesManager } from '../components/settings/RolesManager';
import { StaffManager } from '../components/settings/StaffManager';
import { SMSGatewaySettings } from '../components/settings/SMSGatewaySettings';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { SettingsTabs, TabItem } from '../components/settings/SettingsTabs';

interface SettingsPageProps {
    currentStaff: Staff;
    staff: Staff[];
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    onViewStaffActivity: (staff: Staff) => void;
    companySettings: CompanySettingsType;
    setCompanySettings: (value: React.SetStateAction<CompanySettingsType>) => Promise<void>;
    onUpdateStaff: (id: string, details: Partial<Staff>) => Promise<void>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentStaff, staff, roles, setRoles, onViewStaffActivity, companySettings, setCompanySettings, onUpdateStaff }) => {
    
    const [activeTab, setActiveTab] = useState('profile');
    const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const userRole = useMemo(() => roles.find(r => r.id === currentStaff.roleId), [currentStaff, roles]);
    const isCEO = currentStaff.roleId === 'CEO';
    const isPowerUser = isCEO || userRole?.name === 'Administrator';

    const tabs: TabItem[] = [
        { id: 'profile', name: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'company', name: 'Company Settings', icon: <BuildingLibraryIcon className="w-5 h-5" />, disabled: !isPowerUser },
        { id: 'sms', name: 'SMS Gateway', icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />, disabled: !isCEO },
        { id: 'roles', name: 'Roles & Permissions', icon: <ShieldCheckIcon className="w-5 h-5" />, disabled: !isPowerUser },
        { id: 'staff', name: 'Staff Accounts', icon: <UsersIcon className="w-5 h-5" />, disabled: !isPowerUser },
    ];
    
    return (
        <div className="space-y-6">
            <SettingsHeader title="System Settings" actionFeedback={actionFeedback} onClearFeedback={() => setActionFeedback(null)} />
            <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'profile' && <ProfileSettings currentStaff={currentStaff} onUpdateStaff={onUpdateStaff} />}
            {activeTab === 'company' && isPowerUser && <CompanySettings companySettings={companySettings} setCompanySettings={setCompanySettings} />}
            {activeTab === 'sms' && isCEO && <SMSGatewaySettings />}
            {activeTab === 'roles' && isPowerUser && <RolesManager roles={roles} setRoles={setRoles} staff={staff} />}
            {activeTab === 'staff' && isPowerUser && <StaffManager staff={staff} roles={roles} onUpdateStaff={onUpdateStaff} onViewStaffActivity={onViewStaffActivity} setActionFeedback={setActionFeedback} />}
        </div>
    );
};

export default SettingsPage;
