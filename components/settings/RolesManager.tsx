
import React, { useState } from 'react';
import { Role, Staff, AppModuleName } from '../../types';
import { APP_MODULES } from '../../data/mockData';
import { PlusCircleIcon, ShieldCheckIcon, XMarkIcon } from '../../components/icons/DummyIcons';
import { usePermissions } from '../../context/DataContext';

interface RolesManagerProps {
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    staff: Staff[];
}

export const RolesManager: React.FC<RolesManagerProps> = ({ roles, setRoles, staff }) => {
    const { rolePermissions, updateRolePermission, initRolePermissions } = usePermissions();
    const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });

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

    // Removed unused handleDeleteRole or implemented if needed in UI (currently not in rendered JSX of original)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white">Roles</h2>
                    <button onClick={() => { setEditingRole(null); setRoleModalOpen(true); }} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                        <PlusCircleIcon className="w-4 h-4" /> New Role
                    </button>
                </div>
                <div className="space-y-2">
                    {roles.map(role => (
                        <button key={role.id} onClick={() => setSelectedRole(role)} className={`w-full text-left p-3 rounded-xl transition-all ${selectedRole?.id === role.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            <h3 className={`font-bold ${selectedRole?.id === role.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{role.name}</h3>
                            <p className={`text-xs ${selectedRole?.id === role.id ? 'text-blue-100' : 'text-gray-500'}`}>{role.description}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {selectedRole ? (
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-b pb-4">{selectedRole.name} Module Access Control</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                    <th className="py-3">Module Name</th><th className="text-center">View</th><th className="text-center">Create</th><th className="text-center">Edit</th><th className="text-center">Delete</th><th className="text-center">Approve</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {APP_MODULES.map(module => {
                                    const permissions = rolePermissions.find(rp => rp.roleId === selectedRole.id && rp.moduleId === module.id)?.permissions || { view: false, create: false, edit: false, delete: false, approve: false };
                                    return (
                                        <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="py-4 font-bold text-gray-700 dark:text-gray-200">{module.name}</td>
                                            {['view', 'create', 'edit', 'delete', 'approve'].map((key) => (
                                                <td key={key} className="text-center py-2">
                                                    <input type="checkbox" className="form-checkbox h-4.5 w-4.5 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
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
                    <div className="text-center py-20 text-gray-400 opacity-50 flex flex-col items-center">
                        <ShieldCheckIcon className="w-16 h-16 mb-2" />
                        <p className="font-bold">Select a role to manage access permissions</p>
                    </div>
                )}
            </div>

            {isRoleModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <form onSubmit={handleSaveRole}>
                            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{editingRole ? 'Update System Role' : 'Define New System Role'}</h3>
                                <button type="button" onClick={() => setRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Official Role Title</label><input type="text" value={newRoleData.name} onChange={e => setNewRoleData({...newRoleData, name: e.target.value})} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white font-bold transition-all focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="e.g. Sales Director" /></div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Role Responsibility Description</label><textarea value={newRoleData.description} onChange={e => setNewRoleData({...newRoleData, description: e.target.value})} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none" required rows={3} placeholder="Brief summary of duties..." /></div>
                            </div>
                            <div className="p-5 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 rounded-b-lg border-t dark:border-gray-700">
                                <button type="button" onClick={() => setRoleModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Discard</button>
                                <button type="submit" className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-black uppercase tracking-widest text-sm shadow-md hover:shadow-lg transition-all active:scale-95">Save Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
