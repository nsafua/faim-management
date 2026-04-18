import React from 'react';
import { 
    MegaphoneIcon, 
    ChartBarIcon, 
    DocumentTextIcon, 
    PlusCircleIcon, 
    ShieldCheckIcon
} from '../components/icons/DummyIcons';
import { Property, Client, Staff, Role, Invoice, ActivityLog } from '../types';
import { useStaff } from '../hooks/useAppData';
import { registerStaffAccount, normalizeEmail, updateStaffPassword } from '../services/authService';
import { useModal } from '../context/ModalContext';
import { MODAL_TYPES } from '../components/ModalManager';
import { MessagingControlCenter } from '../components/ceo/MessagingControlCenter';
import { GovernanceConstitution } from '../components/ceo/GovernanceConstitution';

// Modular Imports
import { QuickActionButton } from '../components/ceo/QuickActionButton';
import { useExecutiveSummary } from '../hooks/useExecutiveSummary';
import { RevenueSummaryWidget } from '../components/ceo/RevenueSummaryWidget';
import { SystemAuditWidget } from '../components/ceo/SystemAuditWidget';
import { SalesPerformanceWidget } from '../components/ceo/SalesPerformanceWidget';
import { ExecutiveTeamWidget } from '../components/ceo/ExecutiveTeamWidget';

interface CEOHubProps {
    setActivePage: (page: string, context?: any) => void;
    properties: Property[];
    clients: Client[];
    invoices: Invoice[];
    staff: Staff[];
    roles: Role[];
    onViewStaffActivity: (staff: Staff) => void;
    addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const CEOHub: React.FC<CEOHubProps> = ({ setActivePage, properties, clients, staff, roles, onViewStaffActivity, addActivityLog, invoices }) => {
    const { updateStaff, deleteStaff } = useStaff();
    const { openModal } = useModal();
    const [activeView, setActiveView] = React.useState<'overview' | 'governance'>('overview');

    const { statsData, formatCurrency } = useExecutiveSummary(properties, clients);
    
    const handleSaveStaff = async (staffData: Partial<Staff>, isEdit: boolean) => {
        try {
            if(isEdit && staffData.id) {
                await updateStaff(staffData.id, staffData);
                if (staffData.password && staffData.password.trim().length > 0) {
                    await updateStaffPassword(staffData.id, staffData.password);
                    addActivityLog('Update', `Securely updated password for ${staffData.fullName}.`);
                } else {
                    addActivityLog('Update', `Updated staff details for ${staffData.fullName}.`);
                }
            } else {
                const result = await registerStaffAccount({
                    email: normalizeEmail(staffData.email!),
                    password: staffData.password!,
                    fullName: staffData.fullName!,
                    roleId: staffData.roleId!,
                    phone: staffData.phone
                });
                if (result.success) {
                    addActivityLog('Create', `Created new staff account: ${staffData.fullName}.`);
                }
            }
        } catch (error: any) {
            console.error("CEOHub Staff Save Error:", error);
            let msg = error.message;
            if (msg === "EMAIL_EXISTS") msg = "This email is already registered in the security database.";
            if (msg === "WEAK_PASSWORD") msg = "Security requirement failed: Password is too weak.";
            if (msg === "AUTH_SERVICE_UNAVAILABLE") msg = "The authentication service is currently blocked or unavailable.";
            if (msg.includes("internal")) msg = "Password update failed. Please ensure the backend Cloud Function is deployed.";
            throw new Error(msg); 
        }
    };

    const confirmDeleteStaff = async (staffToDelete: Staff) => {
        if (staffToDelete) {
            await deleteStaff(staffToDelete.id);
            addActivityLog('Delete', `Deleted staff account: ${staffToDelete.fullName}.`);
        }
    }
    
    const handleToggleStaffStatus = async (staffId: string) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
            const newStatus: Staff['status'] = staffMember.status === 'Active' ? 'Inactive' : 'Active';
            await updateStaff(staffId, { status: newStatus });
            addActivityLog('Update', `Set status for ${staffMember.fullName} to ${newStatus}.`);
        }
    };

    const openStaffModal = (editingUser?: Staff) => {
        openModal(MODAL_TYPES.USER_FORM, {
            editingUser,
            roles,
            onSave: (data: Partial<Staff>) => handleSaveStaff({ ...data, id: editingUser?.id }, !!editingUser)
        });
    };

    const handleDeleteClick = (member: Staff) => {
        openModal(MODAL_TYPES.DELETE_CONFIRMATION, {
            itemName: member.fullName,
            itemType: "Executive Account",
            message: `Are you sure you want to delete ${member.fullName}? This will immediately disable their system credentials.`,
            onConfirm: () => confirmDeleteStaff(member)
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">CEO Strategic Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Executive oversight and portfolio management.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveView('overview')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeView === 'overview' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Portfolio Overview
                    </button>
                    <button 
                        onClick={() => setActiveView('governance')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${activeView === 'governance' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ShieldCheckIcon className="w-4 h-4" />
                        System Constitution
                    </button>
                </div>
            </div>

            {activeView === 'overview' ? (
                <>
                    <RevenueSummaryWidget statsData={statsData} formatCurrency={formatCurrency} />

                    {/* Quick Strategic Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <QuickActionButton icon={<PlusCircleIcon className="w-6 h-6" />} label="New Land Acquisition" color="bg-blue-600" hoverColor="hover:bg-blue-700" onClick={() => setActivePage('New Land Acquisition')} />
                        <QuickActionButton icon={<ChartBarIcon className="w-6 h-6" />} label="Purchase & Sale Management" color="bg-indigo-600" hoverColor="hover:bg-indigo-700" onClick={() => setActivePage('Purchase & Sale Management')} />
                        <QuickActionButton icon={<MegaphoneIcon className="w-6 h-6" />} label="Marketing Promotions" color="bg-purple-600" hoverColor="hover:bg-purple-700" onClick={() => setActivePage('Promotions', { from: 'CEO Hub' })} />
                        <QuickActionButton icon={<ChartBarIcon className="w-6 h-6" />} label="AI Data Analytics" color="bg-teal-600" hoverColor="hover:bg-teal-700" onClick={() => setActivePage('Analytics & Reports')} />
                        <QuickActionButton icon={<DocumentTextIcon className="w-6 h-6" />} label="Strategic Reports" color="bg-amber-600" hoverColor="hover:bg-amber-700" onClick={() => setActivePage('Advanced Reports')} />
                    </div>

                    <MessagingControlCenter />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ExecutiveTeamWidget 
                                staff={staff} 
                                roles={roles} 
                                openStaffModal={openStaffModal} 
                                handleToggleStaffStatus={handleToggleStaffStatus} 
                                onViewStaffActivity={onViewStaffActivity} 
                                handleDeleteClick={handleDeleteClick} 
                            />
                        </div>

                        <div className="space-y-6">
                            <SalesPerformanceWidget statsData={statsData} invoices={invoices} formatCurrency={formatCurrency} />
                            <SystemAuditWidget clients={clients} properties={properties} />
                        </div>
                    </div>
                </>
            ) : (
                <GovernanceConstitution />
            )}
        </div>
    );
};

export default CEOHub;