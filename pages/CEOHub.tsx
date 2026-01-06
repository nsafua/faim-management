
import React, { useMemo, useState } from 'react';
import { 
    BanknotesIcon, 
    BuildingLibraryIcon, 
    UsersIcon, 
    BriefcaseIcon, 
    DocumentPlusIcon, 
    EyeIcon, 
    MegaphoneIcon, 
    ChartBarIcon, 
    CurrencyDollarIcon, 
    ChartPieIcon, 
    DocumentTextIcon, 
    PlusCircleIcon, 
    PencilIcon, 
    TrashIcon, 
} from '../components/icons/DummyIcons';
import { Property, Client, Staff, Role, Invoice, ActivityLog } from '../types';
import UserFormModal from '../components/UserFormModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useStaff } from '../hooks/useAppData';

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

const CEOStatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; bgColor: string; darkBgColor: string }> = ({ icon, title, value, bgColor, darkBgColor }) => (
  <Card className="flex flex-row items-center space-x-4 p-4">
    <div className={`p-3 rounded-full ${bgColor} ${darkBgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </Card>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; color: string; hoverColor: string; onClick?: () => void; }> = ({ icon, label, color, hoverColor, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg text-white font-semibold transition-colors ${color} ${hoverColor} shadow-md`}>
        {icon}
        <span className="mt-2 text-sm text-center">{label}</span>
    </button>
);

const CEOHub: React.FC<CEOHubProps> = ({ setActivePage, properties, clients, staff, roles, onViewStaffActivity, addActivityLog, invoices }) => {
    // Import hooks for mutations
    const { saveStaff, deleteStaff } = useStaff();
    
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

    const statsData = useMemo(() => {
        const totalRevenue = clients.reduce((sum, client) => sum + client.payment.paid, 0);
        const totalLands = properties.length;
        const totalClients = clients.length;
        const activeDeals = clients.filter(c => c.payment.balance > 0).length;
        const plotsSold = properties.reduce((acc, p) => acc + p.inventory.reduce((sum, inv) => sum + inv.sold, 0), 0);
        const totalPlots = properties.reduce((acc, p) => acc + p.inventory.reduce((sum, inv) => sum + inv.count, 0), 0);
        return { totalRevenue, totalLands, totalClients, activeDeals, plotsSold, totalPlots };
    }, [clients, properties]);
    
    const handleSaveStaff = async (staffData: Partial<Staff>) => {
        try {
            if(editingStaff) {
                const updatedStaff = { ...editingStaff, ...staffData } as Staff;
                await saveStaff(updatedStaff);
                addActivityLog('Update', `Updated staff details for ${staffData.fullName}.`);
            } else {
                const nameParts = staffData.fullName!.split(' ');
                const initials = (nameParts[0]?.[0] || '' + nameParts[nameParts.length - 1]?.[0] || '').toUpperCase();
                
                const newStaff: Staff = { 
                    id: String(Date.now()), 
                    fullName: staffData.fullName!,
                    email: staffData.email!,
                    phone: staffData.phone,
                    password: staffData.password, 
                    roleId: staffData.roleId!,
                    status: staffData.status!,
                    lastLogin: 'Never',
                    initials: initials
                };
                await saveStaff(newStaff);
                addActivityLog('Create', `Created new staff account: ${newStaff.fullName}.`);
            }
            setStaffModalOpen(false);
            setEditingStaff(null);
        } catch (error: any) {
            alert(`Error saving staff: ${error.message || 'Unknown error'}`);
        }
    };

    const handleDeleteClick = (staffMember: Staff) => {
        setStaffToDelete(staffMember);
    }

    const confirmDeleteStaff = async () => {
        if (staffToDelete) {
            await deleteStaff(staffToDelete.id);
            addActivityLog('Delete', `Deleted staff account: ${staffToDelete.fullName}.`);
            setStaffToDelete(null);
        }
    }
    
    const handleToggleStaffStatus = async (staffId: string) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
            const newStatus: Staff['status'] = staffMember.status === 'Active' ? 'Inactive' : 'Active';
            const updatedStaff = { ...staffMember, status: newStatus };
            await saveStaff(updatedStaff);
            addActivityLog('Update', `Set status for ${staffMember.fullName} to ${newStatus}.`);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1_000_000) {
            return `GH₵${(amount / 1_000_000).toFixed(2)}M`;
        }
        if (amount >= 1_000) {
            return `GH₵${(amount / 1_000).toFixed(1)}K`;
        }
        return `GH₵${amount.toFixed(2)}`;
    };

    const stats = [
        { title: "Total Revenue", value: formatCurrency(statsData.totalRevenue), icon: <BanknotesIcon className="w-6 h-6 text-green-700 dark:text-green-300" />, bgColor: "bg-green-100", darkBgColor: "dark:bg-green-900/30" },
        { title: "Total Lands", value: statsData.totalLands.toString(), icon: <BuildingLibraryIcon className="w-6 h-6 text-blue-700 dark:text-blue-300" />, bgColor: "bg-blue-100", darkBgColor: "dark:bg-blue-900/30" },
        { title: "Total Clients", value: statsData.totalClients.toString(), icon: <UsersIcon className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />, bgColor: "bg-indigo-100", darkBgColor: "dark:bg-indigo-900/30" },
        { title: "Active Deals", value: statsData.activeDeals.toString(), icon: <BriefcaseIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />, bgColor: "bg-amber-100", darkBgColor: "dark:bg-amber-900/30" },
        { title: "Plots Sold", value: `${statsData.plotsSold}/${statsData.totalPlots}`, icon: <ChartBarIcon className="w-6 h-6 text-pink-700 dark:text-pink-300" />, bgColor: "bg-pink-100", darkBgColor: "dark:bg-pink-900/30" },
        { title: "Pending Invoices", value: invoices.filter(i=>i.status === 'Pending').length.toString(), icon: <CurrencyDollarIcon className="w-6 h-6 text-sky-700 dark:text-sky-300" />, bgColor: "bg-sky-100", darkBgColor: "dark:bg-sky-900/30" },
    ];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">CEO Hub</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Strategic overview and business management center.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {stats.map(stat => <CEOStatCard key={stat.title} {...stat} />)}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
                <QuickActionButton icon={<DocumentPlusIcon className="w-6 h-6" />} label="New Land Acquisition" color="bg-blue-600" hoverColor="hover:bg-blue-700" onClick={() => setActivePage('New Land Acquisition')} />
                <QuickActionButton icon={<EyeIcon className="w-6 h-6" />} label="View Properties" color="bg-green-600" hoverColor="hover:bg-green-700" onClick={() => setActivePage('Properties', { from: 'CEO Hub' })} />
                <QuickActionButton icon={<MegaphoneIcon className="w-6 h-6" />} label="Create Promotions" color="bg-purple-600" hoverColor="hover:bg-purple-700" onClick={() => setActivePage('Promotions', { from: 'CEO Hub' })} />
                <QuickActionButton icon={<ChartPieIcon className="w-6 h-6" />} label="AI Analytics" color="bg-orange-500" hoverColor="hover:bg-orange-600" onClick={() => setActivePage('Analytics & Reports')} />
                <QuickActionButton icon={<DocumentTextIcon className="w-6 h-6" />} label="Advanced Reports" color="bg-indigo-700" hoverColor="hover:bg-indigo-800" onClick={() => setActivePage('Advanced Reports')} />
            </div>

             {/* Staff Management Panel */}
            <Card 
                title="Manage Staff" 
                action={
                    <Button onClick={() => { setEditingStaff(null); setStaffModalOpen(true); }} variant="secondary" icon={<PlusCircleIcon className="w-5 h-5" />}>
                        Add New Staff
                    </Button>
                }
            >
                 <TableContainer>
                    <table className="w-full text-sm text-left">
                        <Thead>
                            <tr>
                                <Th>Name</Th>
                                <Th>Role</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {staff.map(member => (
                                <Tr key={member.id}>
                                    <Td>
                                        <div className="font-semibold text-gray-900 dark:text-white">{member.fullName}</div>
                                        <div className="text-gray-500 dark:text-gray-400">{member.email}</div>
                                    </Td>
                                    <Td className="text-gray-600 dark:text-gray-300">{roles.find(r => r.id === member.roleId)?.name}</Td>
                                    <Td>
                                        <button onClick={() => handleToggleStaffStatus(member.id)}>
                                            <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>{member.status}</Badge>
                                        </button>
                                    </Td>
                                    <Td className="flex items-center gap-1">
                                         <button onClick={() => onViewStaffActivity(member)} className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title="View Activity"><EyeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => { setEditingStaff(member); setStaffModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Edit Staff"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDeleteClick(member)} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete Staff"><TrashIcon className="w-5 h-5" /></button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </table>
                </TableContainer>
            </Card>
            
             <UserFormModal 
                isOpen={isStaffModalOpen}
                onClose={() => { setStaffModalOpen(false); setEditingStaff(null); }}
                onSave={handleSaveStaff}
                editingUser={editingStaff}
                roles={roles}
            />

            {/* Confirmation Modal */}
            {staffToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                            <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Delete Staff Account?</h3>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
                            Are you sure you want to delete <strong>{staffToDelete.fullName}</strong>? This action cannot be undone and will immediately revoke their access to the system.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setStaffToDelete(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDeleteStaff}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CEOHub;
