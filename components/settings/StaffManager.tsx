
import React, { useState } from 'react';
import { Staff, Role } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon } from '../../components/icons/DummyIcons';
import { Badge } from '../../components/ui/Badge';
import UserFormModal from '../../components/UserFormModal';
import { registerStaffAccount, normalizeEmail } from '../../services/authService';
import { useStaff } from '../../hooks/useAppData';

interface StaffManagerProps {
    staff: Staff[];
    roles: Role[];
    onUpdateStaff: (id: string, details: Partial<Staff>) => Promise<void>;
    onViewStaffActivity: (staff: Staff) => void;
    setActionFeedback: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
}

const RolePill: React.FC<{ role?: Role }> = ({ role }) => {
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full border bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800`}>{role ? role.name : 'Unknown Role'}</span>
}

export const StaffManager: React.FC<StaffManagerProps> = ({ staff, roles, onUpdateStaff, onViewStaffActivity, setActionFeedback }) => {
    const { deleteStaff } = useStaff();
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
    const [isSavingStaff, setIsSavingStaff] = useState(false);

    const handleSaveStaff = async (staffData: Partial<Staff>) => {
        setIsSavingStaff(true);
        setActionFeedback(null);
        try {
            if (editingStaff) {
                await onUpdateStaff(editingStaff.id, staffData);
                setActionFeedback({ type: 'success', message: 'Staff account updated successfully.' });
            } else {
                await registerStaffAccount({
                    email: normalizeEmail(staffData.email!),
                    password: staffData.password!,
                    fullName: staffData.fullName!,
                    roleId: staffData.roleId!,
                    phone: staffData.phone
                });
                setActionFeedback({ type: 'success', message: 'New staff account created successfully.' });
            }
            setStaffModalOpen(false);
            setEditingStaff(null);
        } catch (error: any) {
            console.error("Staff save error:", error);
            const errMsg = error.message || 'System failed to synchronize account.';
            setActionFeedback({ type: 'error', message: errMsg });
            alert(`Error: ${errMsg}`);
        } finally {
            setIsSavingStaff(false);
        }
    }

    const confirmDeleteStaff = async () => {
        if (!staffToDelete) return;
        try {
            await deleteStaff(staffToDelete.id);
            setActionFeedback({ type: 'success', message: 'Staff account removed.' });
            setStaffToDelete(null);
        } catch (error) {
            alert("Failed to delete staff account.");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="font-bold text-xl text-gray-800 dark:text-white">Staff Management</h2>
                <button onClick={() => {setEditingStaff(null); setStaffModalOpen(true);}} className="bg-blue-600 text-white font-black uppercase tracking-widest text-xs py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
                    <PlusCircleIcon className="w-5 h-5" /> Register New Account
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 border-b dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px]">Staff Member</th>
                            <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px]">Role / Department</th>
                            <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px]">Account Status</th>
                            <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {staff.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-4 flex items-center gap-4">
                                    {member.photo ? <img src={member.photo} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" alt={member.fullName}/> : <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-black text-sm">{member.initials}</div>}
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{member.fullName}</div>
                                        <div className="text-xs text-gray-500 font-medium">{member.email}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <RolePill role={roles.find(r => r.id === member.roleId)} />
                                </td>
                                <td className="px-4 py-4">
                                    <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>{member.status}</Badge>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => onViewStaffActivity(member)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Activity Logs"><EyeIcon className="w-5 h-5"/></button>
                                        <button onClick={() => { setEditingStaff(member); setStaffModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit Profile"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setStaffToDelete(member)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Account"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserFormModal 
                isOpen={isStaffModalOpen}
                onClose={() => { setStaffModalOpen(false); setEditingStaff(null); }}
                onSave={handleSaveStaff}
                editingUser={editingStaff}
                roles={roles}
            />

            {staffToDelete && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                            <TrashIcon className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-black text-center text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Delete Account?</h3>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">You are about to remove <strong>{staffToDelete.fullName}</strong>. Access will be revoked immediately and this action is permanent.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDeleteStaff} className="w-full py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">Confirm Deletion</button>
                            <button onClick={() => setStaffToDelete(null)} className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors hover:bg-gray-200 text-sm">Keep Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
