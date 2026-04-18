import React, { useMemo } from 'react';
import { 
    BanknotesIcon, 
    BuildingLibraryIcon, 
    UsersIcon, 
    BriefcaseIcon, 
    EyeIcon, 
    MegaphoneIcon, 
    ChartBarIcon, 
    ChartPieIcon, 
    DocumentTextIcon, 
    PlusCircleIcon, 
    PencilIcon, 
    TrashIcon, 
    ArrowTrendingUpIcon,
    DocumentDuplicateIcon,
    CurrencyDollarIcon,
    ShieldCheckIcon
} from '../components/icons/DummyIcons';
import { Property, Client, Staff, Role, Invoice, ActivityLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useStaff } from '../hooks/useAppData';
import { registerStaffAccount, normalizeEmail, updateStaffPassword } from '../services/authService';
import { useModal } from '../context/ModalContext';
import { MODAL_TYPES } from '../components/ModalManager';
import { MessagingControlCenter } from '../components/ceo/MessagingControlCenter';
import { GovernanceConstitution } from '../components/ceo/GovernanceConstitution';

// Modular Imports
import { CEOStatCard } from '../components/ceo/CEOStatCard';
import { QuickActionButton } from '../components/ceo/QuickActionButton';

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

    const statsData = useMemo(() => {
        const totalRevenue = clients.reduce((sum, client) => sum + (client.payment?.paid || 0), 0);
        const totalLands = properties.length;
        const totalClients = clients.length;
        const activeDeals = clients.filter(c => (c.payment?.balance || 0) > 0).length;
        const plotsSold = properties.reduce((acc, p) => acc + (p.inventory?.reduce((sum, inv) => sum + (inv.sold || 0), 0) || 0), 0);
        const totalPlots = properties.reduce((acc, p) => acc + (p.inventory?.reduce((sum, inv) => sum + (inv.count || 0), 0) || 0), 0);
        return { totalRevenue, totalLands, totalClients, activeDeals, plotsSold, totalPlots };
    }, [clients, properties]);
    
    const handleSaveStaff = async (staffData: Partial<Staff>, isEdit: boolean) => {
        try {
            if(isEdit && staffData.id) {
                await updateStaff(staffData.id, staffData);
                if (staffData.password && staffData.password.trim().length > 0) {
                    await updateStaffPassword(staffData.id, staffData.password);
                    // FIX: Removed third argument from addActivityLog
                    addActivityLog('Update', `Securely updated password for ${staffData.fullName}.`);
                } else {
                    // FIX: Removed third argument from addActivityLog
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
                    // FIX: Removed third argument from addActivityLog
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
            // FIX: Removed third argument from addActivityLog
            addActivityLog('Delete', `Deleted staff account: ${staffToDelete.fullName}.`);
        }
    }
    
    const handleToggleStaffStatus = async (staffId: string) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
            const newStatus: Staff['status'] = staffMember.status === 'Active' ? 'Inactive' : 'Active';
            await updateStaff(staffId, { status: newStatus });
            // FIX: Removed third argument from addActivityLog
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

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `GHC ${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `GHC ${(amount / 1000).toFixed(1)}k`;
        return `GHC ${amount.toLocaleString()}`;
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
                    {/* Top Level Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <CEOStatCard icon={<BanknotesIcon className="w-6 h-6 text-green-600"/>} title="Gross Revenue" value={formatCurrency(statsData.totalRevenue)} bgColor="bg-green-100" darkBgColor="dark:bg-green-900/30" />
                        <CEOStatCard icon={<BuildingLibraryIcon className="w-6 h-6 text-blue-600"/>} title="Land Portfolio" value={String(statsData.totalLands)} bgColor="bg-blue-100" darkBgColor="dark:bg-blue-900/30" />
                        <CEOStatCard icon={<UsersIcon className="w-6 h-6 text-purple-600"/>} title="Total Clients" value={String(statsData.totalClients)} bgColor="bg-purple-100" darkBgColor="dark:bg-purple-900/30" />
                        <CEOStatCard icon={<ArrowTrendingUpIcon className="w-6 h-6 text-orange-600"/>} title="Active Deals" value={String(statsData.activeDeals)} bgColor="bg-orange-100" darkBgColor="dark:bg-orange-900/30" />
                        <CEOStatCard icon={<ChartPieIcon className="w-6 h-6 text-teal-600"/>} title="Plots Sold" value={String(statsData.plotsSold)} bgColor="bg-teal-100" darkBgColor="dark:bg-teal-900/30" />
                        <CEOStatCard icon={<DocumentDuplicateIcon className="w-6 h-6 text-indigo-600"/>} title="Total Plots" value={String(statsData.totalPlots)} bgColor="bg-indigo-100" darkBgColor="dark:bg-indigo-900/30" />
                    </div>

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
                            <Card title="Executive Team Management" action={<Button size="sm" onClick={() => openStaffModal()} icon={<PlusCircleIcon className="w-4 h-4"/>}>Add Executive</Button>}>
                                <TableContainer className="border-0 shadow-none">
                                    <table className="w-full text-sm text-left">
                                        <Thead>
                                            <tr>
                                                <Th>Executive</Th>
                                                <Th>Role</Th>
                                                <Th className="text-center">Status</Th>
                                                <Th className="text-right">Actions</Th>
                                            </tr>
                                        </Thead>
                                        <Tbody>
                                            {staff.map(member => (
                                                <Tr key={member.id}>
                                                    <Td className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-300">
                                                            {member.initials}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{member.fullName}</div>
                                                            <div className="text-[10px] text-gray-400">{member.email}</div>
                                                        </div>
                                                    </Td>
                                                    <Td>
                                                        <Badge variant="info">{roles.find(r => r.id === member.roleId)?.name || 'Executive'}</Badge>
                                                    </Td>
                                                    <Td className="text-center">
                                                        <button onClick={() => handleToggleStaffStatus(member.id)}>
                                                            <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>{member.status}</Badge>
                                                        </button>
                                                    </Td>
                                                    <Td className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => onViewStaffActivity(member)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><EyeIcon className="w-5 h-5"/></button>
                                                            <button onClick={() => openStaffModal(member)} className="p-1 text-gray-400 hover:text-green-600 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                                            <button onClick={() => handleDeleteClick(member)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                                        </div>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </table>
                                </TableContainer>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card title="Sales Performance Snapshot">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                                            <span>Inventory Liquidated</span>
                                            <span>{statsData.totalPlots > 0 ? Math.round((statsData.plotsSold / statsData.totalPlots) * 100) : 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full shadow-sm" style={{ width: `${statsData.totalPlots > 0 ? (statsData.plotsSold / statsData.totalPlots) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 font-medium">Recent Notable Invoices</p>
                                        <div className="mt-3 space-y-3">
                                            {invoices.slice(0, 3).map(inv => (
                                                <div key={inv.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700 dark:text-gray-300 font-semibold truncate max-w-[120px]">{inv.clientName}</span>
                                                    <span className="font-black text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Risk & Compliance">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/50">
                                        <CurrencyDollarIcon className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-800 dark:text-red-400">Arrears Alert</p>
                                            <p className="text-[10px] text-red-600 dark:text-red-300/80 mt-1">{clients.filter(c => (c.payment?.balance || 0) > (c.payment?.total || 0) * 0.5).length} clients have &gt;50% outstanding balance.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                        <BriefcaseIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-800 dark:text-blue-400">Operational Update</p>
                                            <p className="text-[10px] text-blue-600 dark:text-blue-300/80 mt-1">{properties.filter(p => p.registrationStatus === 'Indenture').length} properties pending final title certification.</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
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