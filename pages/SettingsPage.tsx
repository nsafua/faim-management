import React, { useState, useMemo, ChangeEvent } from 'react';
import { Staff, Role, AppModuleName, CompanySettings } from '../types';
import { APP_MODULES, ROLE_PERMISSIONS } from '../data/mockData';
import { Cog6ToothIcon, ShieldCheckIcon, UsersIcon, PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, UserCircleIcon, BuildingLibraryIcon } from '../components/icons/DummyIcons';
import UserFormModal from '../components/UserFormModal';

interface SettingsPageProps {
    currentStaff: Staff;
    staff: Staff[];
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    onViewStaffActivity: (staff: Staff) => void;
    companySettings: CompanySettings;
    setCompanySettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
    onUpdateStaff: (staffId: number, details: Partial<Staff>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentStaff, staff, setStaff, roles, setRoles, onViewStaffActivity, companySettings, setCompanySettings, onUpdateStaff }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);
    
    // State for Role Permissions
    const [rolePermissions, setRolePermissions] = useState(ROLE_PERMISSIONS);

    // State for Modals
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });

    // State for local forms
    const [profileData, setProfileData] = useState({ fullName: currentStaff.fullName, email: currentStaff.email, phone: currentStaff.phone || '' });
    const [companyData, setCompanyData] = useState({ name: companySettings.name });
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(currentStaff.photo || null);
    const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(companySettings.logo || null);

    const userRole = useMemo(() => roles.find(r => r.id === currentStaff.roleId), [currentStaff, roles]);
    const canManageStaff = useMemo(() => userRole?.name === 'CEO' || userRole?.name === 'Administrator', [userRole]);
    const canManageCompany = useMemo(() => userRole?.name === 'CEO' || userRole?.name === 'Administrator', [userRole]);

    const handlePermissionChange = (moduleId: AppModuleName, permission: string, value: boolean) => {
        if (!selectedRole) return;
        setRolePermissions(prev =>
            prev.map(rp =>
                rp.roleId === selectedRole.id && rp.moduleId === moduleId
                    ? { ...rp, permissions: { ...rp.permissions, [permission]: value } }
                    : rp
            )
        );
    };

    const handleSaveRole = (e: React.FormEvent) => {
        e.preventDefault();
        const roleData = newRoleData;
        if (editingRole) {
            setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...editingRole, ...roleData } : r));
        } else {
            const newRole: Role = { id: Date.now(), ...roleData };
            setRoles(prev => [...prev, newRole]);
            const newPermissions = APP_MODULES.map(m => ({
                roleId: newRole.id,
                moduleId: m.id as AppModuleName,
                permissions: { view: false, create: false, edit: false, delete: false, approve: false }
            }));
            setRolePermissions(prev => [...prev, ...newPermissions]);
        }
        setRoleModalOpen(false);
        setEditingRole(null);
        setNewRoleData({ name: '', description: '' });
    };

    const handleDeleteRole = (roleId: number) => {
        if (window.confirm("Are you sure you want to delete this role? This cannot be undone.")) {
            if (staff.some(u => u.roleId === roleId)) {
                alert("Cannot delete role. It is currently assigned to one or more staff members.");
                return;
            }
            setRoles(prev => prev.filter(r => r.id !== roleId));
            setRolePermissions(prev => prev.filter(rp => rp.roleId !== roleId));
            if (selectedRole?.id === roleId) setSelectedRole(roles[0] || null);
        }
    };

    const handleSaveStaff = (staffData: Partial<Staff>) => {
        if(editingStaff) {
            onUpdateStaff(editingStaff.id, staffData);
        } else {
            const nameParts = staffData.fullName!.split(' ');
            const initials = (nameParts[0]?.[0] || '' + nameParts[nameParts.length - 1]?.[0] || '').toUpperCase();
            const newStaff: Staff = { 
                id: Date.now(), 
                fullName: staffData.fullName!, email: staffData.email!, phone: staffData.phone,
                password: staffData.password, roleId: staffData.roleId!, status: staffData.status!,
                lastLogin: 'Never', initials: initials
            };
            setStaff(prev => [newStaff, ...prev]);
        }
        setStaffModalOpen(false);
        setEditingStaff(null);
    }
    
    const handleDeleteStaff = (staffId: number) => {
        if (staffId === currentStaff.id) {
            alert("You cannot delete your own account.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this staff member?")) {
            setStaff(prev => prev.filter(u => u.id !== staffId));
        }
    }
    
    const handleProfileFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfilePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setProfilePhotoPreview(base64);
                onUpdateStaff(currentStaff.id, { photo: base64 });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleCompanyLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setCompanyLogoPreview(base64);
                setCompanySettings(prev => ({ ...prev, logo: base64 }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSaveCompanySettings = () => {
        setCompanySettings(prev => ({ ...prev, name: companyData.name }));
        alert('Company settings saved.');
    };

    const RolePill: React.FC<{ role: Role }> = ({ role }) => {
        const roleColors: { [key: string]: string } = {
            'CEO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Administrator': 'bg-blue-100 text-blue-800 border-blue-200',
            'Chief Accountant': 'bg-green-100 text-green-800 border-green-200',
            'Head of Sales': 'bg-purple-100 text-purple-800 border-purple-200',
        };
        const defaultColor = 'bg-gray-100 text-gray-800 border-gray-200';
        const color = roleColors[role.name] || defaultColor;
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${color}`}>{role.name}</span>
    }
    
    const tabs = [
        { id: 'profile', name: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'company', name: 'Company Settings', icon: <BuildingLibraryIcon className="w-5 h-5" />, disabled: !canManageCompany },
        { id: 'roles', name: 'Roles & Permissions', icon: <ShieldCheckIcon className="w-5 h-5" />, disabled: !canManageStaff },
        { id: 'staff', name: 'Staff Accounts', icon: <UsersIcon className="w-5 h-5" />, disabled: !canManageStaff },
    ];
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
            
            <div className="flex border-b border-gray-200">
                {tabs.map(tab => !tab.disabled && (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="font-bold text-xl text-gray-800 mb-4">Edit Your Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-1 flex flex-col items-center">
                            {profilePhotoPreview ? (
                                <img src={profilePhotoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4"><UserCircleIcon className="w-20 h-20 text-gray-400" /></div>
                            )}
                            <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Change Photo
                                <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handleProfilePhotoChange} accept="image/*" />
                            </label>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileFormChange} className="w-full mt-1 p-2 border rounded" />
                            </div>
                             <div>
                                <label>Email</label>
                                <input type="email" name="email" value={profileData.email} onChange={handleProfileFormChange} className="w-full mt-1 p-2 border rounded" />
                            </div>
                             <div>
                                <label>Phone</label>
                                <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileFormChange} className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => onUpdateStaff(currentStaff.id, profileData)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'company' && canManageCompany && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="font-bold text-xl text-gray-800 mb-4">Company Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label>Company Name</label>
                            <input type="text" value={companyData.name} onChange={e => setCompanyData({name: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                        </div>
                        <div>
                            <label>Company Logo</label>
                            <div className="mt-1 flex items-center gap-4">
                                {companyLogoPreview && <img src={companyLogoPreview} alt="Logo" className="h-16 w-auto bg-gray-100 p-1 border rounded" />}
                                <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Upload Logo
                                    <input id="logo-upload" name="logo" type="file" className="sr-only" onChange={handleCompanyLogoChange} accept="image/*" />
                                </label>
                            </div>
                        </div>
                         <div className="flex justify-end">
                            <button onClick={handleSaveCompanySettings} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save Company Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'roles' && canManageStaff && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-gray-800">Roles</h2>
                            <button onClick={() => { setEditingRole(null); setNewRoleData({name: '', description: ''}); setRoleModalOpen(true); }} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                <PlusCircleIcon className="w-5 h-5" /> New Role
                            </button>
                        </div>
                        <div className="space-y-2">
                            {roles.map(role => (
                                <button key={role.id} onClick={() => setSelectedRole(role)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedRole?.id === role.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                                    <p className="text-sm text-gray-500">{role.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                        {selectedRole ? (
                            <div>
                                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                                    <div>
                                        <h2 className="font-bold text-xl text-gray-800" style={{color: '#0047AB'}}>{selectedRole.name} Permissions</h2>
                                        <p className="text-sm text-gray-500">Manage access for the {selectedRole.name} role.</p>
                                    </div>
                                    <div>
                                        <button onClick={() => {setEditingRole(selectedRole); setNewRoleData({name: selectedRole.name, description: selectedRole.description}); setRoleModalOpen(true)}} className="p-2 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                        {!selectedRole.isDefault && <button onClick={() => handleDeleteRole(selectedRole.id)} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>}
                                    </div>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 font-semibold">
                                            <th className="py-2">Module</th>
                                            <th className="text-center py-2">View</th><th className="text-center py-2">Create</th>
                                            <th className="text-center py-2">Edit</th><th className="text-center py-2">Delete</th>
                                            <th className="text-center py-2">Approve</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {APP_MODULES.map(module => {
                                            const permissions = rolePermissions.find(rp => rp.roleId === selectedRole.id && rp.moduleId === module.id)?.permissions;
                                            if (!permissions) return null;
                                            return (
                                                <tr key={module.id} className="border-t">
                                                    <td className="py-3 font-semibold text-gray-700">{module.name}</td>
                                                    {Object.keys(permissions).map(key => (
                                                        <td key={key} className="text-center py-2">
                                                            <input type="checkbox" className="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                                                checked={permissions[key as keyof typeof permissions]}
                                                                onChange={(e) => handlePermissionChange(module.id as AppModuleName, key, e.target.checked)} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20"><p className="text-gray-500">Select a role to manage permissions.</p></div>
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'staff' && canManageStaff && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xl text-gray-800" style={{color: '#0047AB'}}>Manage Staff Accounts</h2>
                        <button onClick={() => {setEditingStaff(null); setStaffModalOpen(true);}} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <PlusCircleIcon className="w-5 h-5" /> Create New Staff
                        </button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Last Login</th><th className="px-4 py-2">Actions</th></tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        {member.photo ? <img src={member.photo} alt="P" className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">{member.initials}</div>}
                                        <div>
                                            <div className="font-semibold text-gray-900">{member.fullName}</div>
                                            <div className="text-gray-500">{member.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><RolePill role={roles.find(r => r.id === member.roleId)!} /></td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{member.status}</span></td>
                                    <td className="px-4 py-3 text-gray-500">{member.lastLogin}</td>
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
            )}
            
            <UserFormModal 
                isOpen={isStaffModalOpen}
                onClose={() => { setStaffModalOpen(false); setEditingStaff(null); }}
                onSave={handleSaveStaff}
                editingUser={editingStaff}
                roles={roles}
            />

            {isRoleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <form onSubmit={handleSaveRole}>
                            <div className="flex justify-between items-center p-4 border-b"><h3 className="text-lg font-bold">{editingRole ? 'Edit Role' : 'Create New Role'}</h3><button type="button" onClick={() => setRoleModalOpen(false)}>&times;</button></div>
                            <div className="p-6 space-y-4">
                                <div><label>Role Name</label><input type="text" value={newRoleData.name} onChange={e => setNewRoleData({...newRoleData, name: e.target.value})} className="w-full mt-1 p-2 border rounded" required /></div>
                                <div><label>Description</label><textarea value={newRoleData.description} onChange={e => setNewRoleData({...newRoleData, description: e.target.value})} className="w-full mt-1 p-2 border rounded" required /></div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-2"><button type="button" onClick={() => setRoleModalOpen(false)}>Cancel</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">{editingRole ? 'Save Changes' : 'Create Role'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;