
import React, { useState, useMemo, ChangeEvent } from 'react';
import { Staff, Role, AppModuleName, CompanySettings } from '../types';
import { APP_MODULES } from '../data/mockData';
import { ShieldCheckIcon, UsersIcon, PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, UserCircleIcon, BuildingLibraryIcon, UploadIcon } from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import UserFormModal from '../components/UserFormModal';
import { PhoneInput } from '../components/ui/PhoneInput';
import { EmailInput } from '../components/ui/EmailInput';
import { usePermissions } from '../context/DataContext';
import { useStaff, useRoles, useCompanySettings } from '../hooks/useAppData';
import { uploadFile } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface SettingsPageProps {
    currentStaff: Staff;
    staff: Staff[];
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    onViewStaffActivity: (staff: Staff) => void;
    companySettings: CompanySettings;
    setCompanySettings: (value: React.SetStateAction<CompanySettings>) => Promise<void>;
    onUpdateStaff: (id: string, details: Partial<Staff>) => Promise<void>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentStaff, staff, roles, setRoles, onViewStaffActivity, companySettings, setCompanySettings, onUpdateStaff }) => {
    // Use hooks directly inside component to ensure access to actions
    const { saveStaff, deleteStaff } = useStaff();
    const { rolePermissions, updateRolePermission, initRolePermissions } = usePermissions();
    const { updateCurrentUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);
    
    // State for Modals
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });
    
    // State for Delete Confirmation
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

    // State for local forms
    const [profileData, setProfileData] = useState({ fullName: currentStaff.fullName, email: currentStaff.email, phone: currentStaff.phone || '' });
    const [companyData, setCompanyData] = useState({ name: companySettings.name });
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(currentStaff.photo || null);
    
    // State for Company Settings Logos
    const [appLogoLightPreview, setAppLogoLightPreview] = useState<string | null>(companySettings.appLogoLight || null);
    const [appLogoDarkPreview, setAppLogoDarkPreview] = useState<string | null>(companySettings.appLogoDark || null);
    const [companyLogoLightPreview, setCompanyLogoLightPreview] = useState<string | null>(companySettings.companyLogoLight || null);
    const [companyLogoDarkPreview, setCompanyLogoDarkPreview] = useState<string | null>(companySettings.companyLogoDark || null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(companySettings.favicon || null);

    // Save Status State
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    // Profile Save State
    const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [profileSaveMessage, setProfileSaveMessage] = useState('');

    const userRole = useMemo(() => roles.find(r => r.id === currentStaff.roleId), [currentStaff, roles]);
    const canManageStaff = useMemo(() => userRole?.name === 'CEO' || userRole?.name === 'Administrator', [userRole]);
    const canManageCompany = useMemo(() => userRole?.name === 'CEO' || userRole?.name === 'Administrator', [userRole]);

    const handlePermissionChange = async (moduleId: AppModuleName, permission: string, value: boolean) => {
        if (!selectedRole) return;
        await updateRolePermission(selectedRole.id, moduleId, permission, value);
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        const roleData = newRoleData;
        if (editingRole) {
            setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...editingRole, ...roleData } : r));
        } else {
            const newRoleId = roleData.name;
            const newRole: Role = { id: newRoleId, ...roleData };
            setRoles(prev => [...prev, newRole]); 
            await initRolePermissions(newRoleId);
        }
        setRoleModalOpen(false);
        setEditingRole(null);
        setNewRoleData({ name: '', description: '' });
    };

    const handleDeleteRole = (roleId: string) => {
        if (window.confirm("Are you sure you want to delete this role? This cannot be undone.")) {
            if (staff.some(u => u.roleId === roleId)) {
                alert("Cannot delete role. It is currently assigned to one or more staff members.");
                return;
            }
            setRoles(prev => prev.filter(r => r.id !== roleId));
            if (selectedRole?.id === roleId) setSelectedRole(roles[0] || null);
        }
    };

    const handleSaveStaff = async (staffData: Partial<Staff>) => {
        try {
            if(editingStaff) {
                await onUpdateStaff(editingStaff.id, staffData);
            } else {
                const nameParts = staffData.fullName!.split(' ');
                const initials = (nameParts[0]?.[0] || '' + nameParts[nameParts.length - 1]?.[0] || '').toUpperCase();
                
                const newStaff: Staff = { 
                    id: String(Date.now()), 
                    fullName: staffData.fullName!, email: staffData.email!, phone: staffData.phone,
                    password: staffData.password, roleId: staffData.roleId!, status: staffData.status!,
                    lastLogin: 'Never', initials: initials
                };
                await saveStaff(newStaff);
            }
            setStaffModalOpen(false);
            setEditingStaff(null);
        } catch (error: any) {
            alert(`Error saving staff: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Initiate delete flow
    const handleDeleteClick = (staffMember: Staff) => {
        if (staffMember.id === currentStaff.id) {
            alert("You cannot delete your own account.");
            return;
        }
        setStaffToDelete(staffMember);
    }

    // Execute delete
    const confirmDeleteStaff = async () => {
        if (staffToDelete) {
            await deleteStaff(staffToDelete.id);
            setStaffToDelete(null);
        }
    }
    
    const handleProfileFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfilePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                // Optimistic UI update for preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfilePhotoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                const url = await uploadFile(file, `staff/${currentStaff.id}/profile/${file.name}`);
                await onUpdateStaff(currentStaff.id, { photo: url });
                updateCurrentUser({ photo: url }); // Update global AuthContext state for Header
                
                // Ensure preview stays in sync if upload returns a specific URL
                setProfilePhotoPreview(url); 
            } catch (error) {
                console.error("Profile photo upload failed:", error);
                alert("Failed to upload profile photo.");
            }
        }
    };

    const handleSaveProfile = async () => {
        setProfileSaveStatus('saving');
        setProfileSaveMessage('');
        try {
            await onUpdateStaff(currentStaff.id, profileData);
            updateCurrentUser(profileData); // Update global AuthContext state
            setProfileSaveStatus('success');
            setProfileSaveMessage('Profile updated successfully!');
            setTimeout(() => {
                setProfileSaveStatus('idle');
                setProfileSaveMessage('');
            }, 3000);
        } catch (error) {
            setProfileSaveStatus('error');
            setProfileSaveMessage('Failed to update profile.');
            setTimeout(() => {
                setProfileSaveStatus('idle');
                setProfileSaveMessage('');
            }, 3000);
        }
    };
    
    const handleLogoUpload = async (file: File, type: keyof CompanySettings, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => {
        try {
            const reader = new FileReader();
            reader.onloadend = () => previewSetter(reader.result as string);
            reader.readAsDataURL(file);

            const url = await uploadFile(file, `system/branding/${type}/${file.name}`);
            setCompanySettings(prev => ({ ...prev, [type]: url }));
        } catch (error) {
            console.error(`Failed to upload ${type}:`, error);
            alert(`Failed to upload logo.`);
        }
    };

    const handleSaveCompanySettings = async () => {
        setSaveStatus('saving');
        setSaveMessage('');
        try {
            await setCompanySettings(prev => ({ ...prev, name: companyData.name }));
            setSaveStatus('success');
            setSaveMessage('Saved successfully');
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage('');
            }, 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            setSaveStatus('error');
            setSaveMessage('Save unsuccessful');
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage('');
            }, 3000);
        }
    };

    const RolePill: React.FC<{ role: Role }> = ({ role }) => {
        const roleColors: { [key: string]: string } = {
            'CEO': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
            'Administrator': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            'Chief Accountant': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
            'Head of Sales': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        };
        const defaultColor = 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        const color = role ? (roleColors[role.name] || defaultColor) : defaultColor;
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${color}`}>{role ? role.name : 'Unknown Role'}</span>
    }
    
    const tabs = [
        { id: 'profile', name: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'company', name: 'Company Settings', icon: <BuildingLibraryIcon className="w-5 h-5" />, disabled: !canManageCompany },
        { id: 'roles', name: 'Roles & Permissions', icon: <ShieldCheckIcon className="w-5 h-5" />, disabled: !canManageStaff },
        { id: 'staff', name: 'Staff Accounts', icon: <UsersIcon className="w-5 h-5" />, disabled: !canManageStaff },
    ];
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">System Settings</h1>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => !tab.disabled && (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}>
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-4">Edit Your Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-1 flex flex-col items-center">
                            {profilePhotoPreview ? (
                                <img src={profilePhotoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-100 dark:border-gray-700" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4"><UserCircleIcon className="w-20 h-20 text-gray-400 dark:text-gray-500" /></div>
                            )}
                            <label htmlFor="photo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                Change Photo
                                <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handleProfilePhotoChange} accept="image/*" />
                            </label>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileFormChange} className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded" />
                            </div>
                             <div>
                                <EmailInput label="Email" name="email" value={profileData.email} onChange={(val) => setProfileData(prev => ({...prev, email: val}))} />
                            </div>
                             <div>
                                <PhoneInput label="Phone" name="phone" value={profileData.phone} onChange={(val) => setProfileData(prev => ({...prev, phone: val}))} />
                            </div>
                            <div className="flex justify-end items-center gap-3 mt-4">
                                {profileSaveMessage && (
                                    <span className={`text-sm font-medium ${profileSaveStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {profileSaveMessage}
                                    </span>
                                )}
                                <button 
                                    onClick={handleSaveProfile} 
                                    disabled={profileSaveStatus === 'saving'}
                                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-800"
                                >
                                    {profileSaveStatus === 'saving' && <LoaderIcon className="w-4 h-4 animate-spin" />}
                                    {profileSaveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Company Tab */}
            {activeTab === 'company' && canManageCompany && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-4">Company Profile</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-gray-700 dark:text-gray-300 font-semibold">Application Name</label>
                                <input type="text" value={companyData.name} onChange={e => setCompanyData({name: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded" placeholder="e.g. FAIM ERP" />
                            </div>
                            
                            {/* App Logos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-semibold">App Logo (Light Mode)</label>
                                    <p className="text-xs text-gray-500 mb-2">Used on light backgrounds (e.g. login top-left)</p>
                                    <div className="flex items-center gap-4">
                                        {appLogoLightPreview && <img src={appLogoLightPreview} alt="App Logo Light" className="h-16 w-auto bg-gray-100 p-2 border rounded" />}
                                        <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                            <UploadIcon className="w-4 h-4"/> Upload
                                            <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'appLogoLight', setAppLogoLightPreview)} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-semibold">App Logo (Dark Mode)</label>
                                    <p className="text-xs text-gray-500 mb-2">Used on dark backgrounds (e.g. sidebar, dark mode)</p>
                                    <div className="flex items-center gap-4">
                                        {appLogoDarkPreview && <img src={appLogoDarkPreview} alt="App Logo Dark" className="h-16 w-auto bg-gray-900 p-2 border rounded" />}
                                        <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                            <UploadIcon className="w-4 h-4"/> Upload
                                            <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'appLogoDark', setAppLogoDarkPreview)} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Company Logos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-semibold">Company Logo (Light Mode)</label>
                                    <p className="text-xs text-gray-500 mb-2">Displayed in center of login screen (Light Theme)</p>
                                    <div className="flex items-center gap-4">
                                        {companyLogoLightPreview && <img src={companyLogoLightPreview} alt="Company Logo Light" className="h-16 w-auto bg-gray-100 p-2 border rounded" />}
                                        <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                            <UploadIcon className="w-4 h-4"/> Upload
                                            <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'companyLogoLight', setCompanyLogoLightPreview)} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-semibold">Company Logo (Dark Mode)</label>
                                    <p className="text-xs text-gray-500 mb-2">Displayed in center of login screen (Dark Theme)</p>
                                    <div className="flex items-center gap-4">
                                        {companyLogoDarkPreview && <img src={companyLogoDarkPreview} alt="Company Logo Dark" className="h-16 w-auto bg-gray-900 p-2 border rounded" />}
                                        <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                            <UploadIcon className="w-4 h-4"/> Upload
                                            <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'companyLogoDark', setCompanyLogoDarkPreview)} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Favicon */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-gray-700 dark:text-gray-300 font-semibold">Favicon</label>
                                    <p className="text-xs text-gray-500 mb-2">Icon displayed in browser tabs (32x32px recommended)</p>
                                    <div className="flex items-center gap-4">
                                        {faviconPreview && <img src={faviconPreview} alt="Favicon" className="h-8 w-8 object-contain bg-gray-100 p-1 border rounded" />}
                                        <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                            <UploadIcon className="w-4 h-4"/> Upload
                                            <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'favicon', setFaviconPreview)} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 items-center gap-3">
                                {saveMessage && (
                                    <span className={`text-sm font-medium ${saveStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {saveMessage}
                                    </span>
                                )}
                                <button onClick={handleSaveCompanySettings} disabled={saveStatus === 'saving'} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-800">
                                    {saveStatus === 'saving' && <LoaderIcon className="w-4 h-4 animate-spin" />}
                                    {saveStatus === 'saving' ? 'Saving...' : 'Save Company Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && canManageStaff && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Roles</h2>
                            <button onClick={() => { setEditingRole(null); setNewRoleData({name: '', description: ''}); setRoleModalOpen(true); }} className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                <PlusCircleIcon className="w-5 h-5" /> New Role
                            </button>
                        </div>
                        <div className="space-y-2">
                            {roles.map(role => (
                                <button key={role.id} onClick={() => setSelectedRole(role)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedRole?.id === role.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        {selectedRole ? (
                            <div>
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div>
                                        <h2 className="font-bold text-xl text-gray-800 dark:text-white" style={{color: ''}}>{selectedRole.name} Permissions</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage access for the {selectedRole.name} role.</p>
                                    </div>
                                    <div>
                                        <button onClick={() => {setEditingRole(selectedRole); setNewRoleData({name: selectedRole.name, description: selectedRole.description}); setRoleModalOpen(true)}} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"><PencilIcon className="w-5 h-5" /></button>
                                        {!selectedRole.isDefault && <button onClick={() => handleDeleteRole(selectedRole.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>}
                                    </div>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 dark:text-gray-400 font-semibold">
                                            <th className="py-2">Module</th>
                                            <th className="text-center py-2">View</th><th className="text-center py-2">Create</th>
                                            <th className="text-center py-2">Edit</th><th className="text-center py-2">Delete</th>
                                            <th className="text-center py-2">Approve</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {APP_MODULES.map(module => {
                                            const permissions = rolePermissions.find(rp => rp.roleId === selectedRole.id && rp.moduleId === module.id)?.permissions;
                                            const effectivePermissions = permissions || { view: false, create: false, edit: false, delete: false, approve: false };
                                            
                                            return (
                                                <tr key={module.id} className="">
                                                    <td className="py-3 font-semibold text-gray-700 dark:text-gray-200">{module.name}</td>
                                                    {['view', 'create', 'edit', 'delete', 'approve'].map((key) => (
                                                        <td key={key} className="text-center py-2">
                                                            <input type="checkbox" className="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                                                checked={effectivePermissions[key as keyof typeof effectivePermissions]}
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
                            <div className="text-center py-20"><p className="text-gray-500 dark:text-gray-400">Select a role to manage permissions.</p></div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Staff Tab */}
            {activeTab === 'staff' && canManageStaff && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xl text-gray-800 dark:text-white" style={{color: ''}}>Manage Staff Accounts</h2>
                        <button onClick={() => {setEditingStaff(null); setStaffModalOpen(true);}} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                            <PlusCircleIcon className="w-5 h-5" /> Create New Staff
                        </button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                            <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Last Login</th><th className="px-4 py-2">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {staff.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        {member.photo ? <img src={member.photo} alt="P" className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-200">{member.initials}</div>}
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{member.fullName}</div>
                                            <div className="text-gray-500 dark:text-gray-400">{member.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><RolePill role={roles.find(r => r.id === member.roleId)!} /></td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{member.status}</span></td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{member.lastLogin}</td>
                                    <td className="px-4 py-3 flex items-center gap-1">
                                        <button onClick={() => onViewStaffActivity(member)} className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title="View Activity"><EyeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => { setEditingStaff(member); setStaffModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Edit Staff"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDeleteClick(member)} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete Staff"><TrashIcon className="w-5 h-5" /></button>
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

            {/* Custom Delete Confirmation Modal */}
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

            {isRoleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSaveRole}>
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-bold text-gray-800 dark:text-white">{editingRole ? 'Edit Role' : 'Create New Role'}</h3><button type="button" onClick={() => setRoleModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">&times;</button></div>
                            <div className="p-6 space-y-4">
                                <div><label className="text-gray-700 dark:text-gray-300">Role Name</label><input type="text" value={newRoleData.name} onChange={e => setNewRoleData({...newRoleData, name: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded" required /></div>
                                <div><label className="text-gray-700 dark:text-gray-300">Description</label><textarea value={newRoleData.description} onChange={e => setNewRoleData({...newRoleData, description: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded" required /></div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 rounded-b-lg"><button type="button" onClick={() => setRoleModalOpen(false)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded">Cancel</button><button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">{editingRole ? 'Save Changes' : 'Create Role'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
