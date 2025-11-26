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
    ArrowUpIcon,
    ArrowDownIcon,
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    FolderIcon,
} from '../components/icons/DummyIcons';
import { Property, Client, Staff, Role, Invoice, ActivityLog } from '../types';
import UserFormModal from '../components/UserFormModal';

interface CEOHubProps {
    setActivePage: (page: string, context?: any) => void;
    properties: Property[];
    clients: Client[];
    invoices: Invoice[];
    staff: Staff[];
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    roles: Role[];
    onViewStaffActivity: (staff: Staff) => void;
    addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const CEOStatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; bgColor: string }> = ({ icon, title, value, bgColor }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; color: string; hoverColor: string; onClick?: () => void; }> = ({ icon, label, color, hoverColor, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg text-white font-semibold transition-colors ${color} ${hoverColor}`}>
        {icon}
        <span className="mt-2 text-sm text-center">{label}</span>
    </button>
);

const CEOHub: React.FC<CEOHubProps> = ({ setActivePage, properties, clients, staff, setStaff, roles, onViewStaffActivity, addActivityLog, invoices }) => {
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const statsData = useMemo(() => {
        const totalRevenue = clients.reduce((sum, client) => sum + client.payment.paid, 0);
        const totalLands = properties.length;
        const totalClients = clients.length;
        const activeDeals = clients.filter(c => c.payment.balance > 0).length;
        const plotsSold = properties.reduce((acc, p) => acc + p.inventory.reduce((sum, inv) => sum + inv.sold, 0), 0);
        const totalPlots = properties.reduce((acc, p) => acc + p.inventory.reduce((sum, inv) => sum + inv.count, 0), 0);
        return { totalRevenue, totalLands, totalClients, activeDeals, plotsSold, totalPlots };
    }, [clients, properties]);
    
    const handleSaveStaff = (staffData: Partial<Staff>) => {
        if(editingStaff) {
            setStaff(prev => prev.map(u => u.id === editingStaff.id ? {...u, ...staffData} : u));
            addActivityLog('Update', `Updated staff details for ${staffData.fullName}.`);
        } else {
            const nameParts = staffData.fullName!.split(' ');
            const initials = (nameParts[0]?.[0] || '' + nameParts[nameParts.length - 1]?.[0] || '').toUpperCase();
            const newStaff: Staff = { 
                id: Date.now(), 
                fullName: staffData.fullName!,
                email: staffData.email!,
                phone: staffData.phone,
                password: staffData.password,
                roleId: staffData.roleId!,
                status: staffData.status!,
                lastLogin: 'Never',
                initials: initials
            };
            setStaff(prev => [newStaff, ...prev]);
            addActivityLog('Create', `Created new staff account: ${newStaff.fullName}.`);
        }
        setStaffModalOpen(false);
        setEditingStaff(null);
    };

    const handleDeleteStaff = (staffId: number) => {
        const staffToDelete = staff.find(s => s.id === staffId);
        if (window.confirm("Are you sure you want to delete this staff member?")) {
            setStaff(prev => prev.filter(u => u.id !== staffId));
            if (staffToDelete) {
                addActivityLog('Delete', `Deleted staff account: ${staffToDelete.fullName}.`);
            }
        }
    };
    
    const handleToggleStaffStatus = (staffId: number) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
            const newStatus = staffMember.status === 'Active' ? 'Inactive' : 'Active';
            setStaff(prev => prev.map(u => u.id === staffId ? { ...u, status: newStatus } : u));
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
        { title: "Total Revenue", value: formatCurrency(statsData.totalRevenue), icon: <BanknotesIcon className="w-6 h-6 text-green-700" />, bgColor: "bg-green-100" },
        { title: "Total Lands", value: statsData.totalLands.toString(), icon: <BuildingLibraryIcon className="w-6 h-6 text-blue-700" />, bgColor: "bg-blue-100" },
        { title: "Total Clients", value: statsData.totalClients.toString(), icon: <UsersIcon className="w-6 h-6 text-indigo-700" />, bgColor: "bg-indigo-100" },
        { title: "Active Deals", value: statsData.activeDeals.toString(), icon: <BriefcaseIcon className="w-6 h-6 text-amber-700" />, bgColor: "bg-amber-100" },
        { title: "Plots Sold", value: `${statsData.plotsSold}/${statsData.totalPlots}`, icon: <ChartBarIcon className="w-6 h-6 text-pink-700" />, bgColor: "bg-pink-100" },
        { title: "Pending Invoices", value: invoices.filter(i=>i.status === 'Pending').length.toString(), icon: <CurrencyDollarIcon className="w-6 h-6 text-sky-700" />, bgColor: "bg-sky-100" },
    ];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">CEO Hub</h1>
                <p className="text-gray-500 mt-1">Strategic overview and business management center.</p>
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Manage Staff</h3>
                    <button onClick={() => { setEditingStaff(null); setStaffModalOpen(true); }} className="bg-gray-800 text-white font-semibold py-2 px-3 text-sm rounded-lg hover:bg-gray-700 flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5" /> Add New Staff
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Role</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">{member.fullName}</div>
                                        <div className="text-gray-500">{member.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{roles.find(r => r.id === member.roleId)?.name}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggleStaffStatus(member.id)} className={`px-2 py-1 text-xs font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {member.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-1">
                                         <button onClick={() => onViewStaffActivity(member)} className="p-1 text-gray-500 hover:text-green-600" title="View Activity"><EyeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => { setEditingStaff(member); setStaffModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600" title="Edit Staff"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDeleteStaff(member.id)} className="p-1 text-gray-500 hover:text-red-600" title="Delete Staff"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <UserFormModal 
                isOpen={isStaffModalOpen}
                onClose={() => { setStaffModalOpen(false); setEditingStaff(null); }}
                onSave={handleSaveStaff}
                editingUser={editingStaff}
                roles={roles}
            />

        </div>
    );
};

export default CEOHub;