
import React, { useState, ChangeEvent } from 'react';
import { Staff } from '../../types';
import { UserCircleIcon, CheckCircleIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '../../components/icons/DummyIcons';
import { LoaderIcon } from '../../components/icons/LoaderIcon';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { EmailInput } from '../../components/ui/EmailInput';
import { useAuth } from '../../context/AuthContext';
import { uploadFile } from '../../services/storageService';
import { auth } from '../../services/firebase';
// @ts-ignore
import { updatePassword } from 'firebase/auth';

interface ProfileSettingsProps {
    currentStaff: Staff;
    onUpdateStaff: (id: string, details: Partial<Staff>) => Promise<void>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentStaff, onUpdateStaff }) => {
    const { updateCurrentUser } = useAuth();
    const [profileData, setProfileData] = useState({ 
        fullName: currentStaff.fullName, 
        email: currentStaff.email, 
        phone: currentStaff.phone || '' 
    });
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(currentStaff.photo || null);
    const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [profileSaveMessage, setProfileSaveMessage] = useState('');

    const handleProfileFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfilePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const url = await uploadFile(file, `staff/${currentStaff.id}/profile/${file.name}`);
                await onUpdateStaff(currentStaff.id, { photo: url });
                updateCurrentUser({ photo: url });
                setProfilePhotoPreview(url); 
            } catch (error) {
                alert("Failed to upload photo.");
            }
        }
    };

    const handleSaveProfile = async () => {
        setProfileSaveStatus('saving');
        setProfileSaveMessage('');
        try {
            // 1. Update Profile Details in Firestore
            await onUpdateStaff(currentStaff.id, profileData);
            updateCurrentUser(profileData);

            // 2. Update Password in Auth (if provided)
            if (newPassword.trim()) {
                if (newPassword.length < 6) {
                    throw new Error("Password must be at least 6 characters.");
                }
                if (auth.currentUser) {
                    await updatePassword(auth.currentUser, newPassword);
                }
            }

            setProfileSaveStatus('success');
            setProfileSaveMessage('Profile details saved successfully.');
            setNewPassword(''); // Clear password field on success
            setTimeout(() => {
                setProfileSaveStatus('idle');
                setProfileSaveMessage('');
            }, 3000);
        } catch (error: any) {
            setProfileSaveStatus('error');
            if (error.code === 'auth/requires-recent-login') {
                setProfileSaveMessage('Security: Please log out and log in again to change your password.');
            } else {
                setProfileSaveMessage(error.message || 'Update failed.');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-4">Edit Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 flex flex-col items-center">
                    {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-100 dark:border-gray-700 shadow-sm" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 border-4 border-gray-100 dark:border-gray-700"><UserCircleIcon className="w-20 h-20 text-gray-400 dark:text-gray-500" /></div>
                    )}
                    <label htmlFor="photo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Change Photo
                        <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handleProfilePhotoChange} accept="image/*" />
                    </label>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
                        <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileFormChange} className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                        <EmailInput label="Email" name="email" value={profileData.email} onChange={(val) => setProfileData(prev => ({...prev, email: val}))} />
                    </div>
                    <div>
                        <PhoneInput label="Phone" name="phone" value={profileData.phone} onChange={(val) => setProfileData(prev => ({...prev, phone: val}))} />
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                            <LockClosedIcon className="w-4 h-4 text-gray-400" />
                            Change Password
                        </label>
                        <div className="relative mt-1">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="Enter new password to update"
                                className="w-full p-2.5 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 italic">Leave blank to keep current password.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4 pt-4 border-t dark:border-gray-700">
                        {profileSaveMessage && (
                            <span className={`text-sm font-medium flex items-center gap-1 ${profileSaveStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {profileSaveStatus === 'error' ? '!' : <CheckCircleIcon className="w-4 h-4" />} {profileSaveMessage}
                            </span>
                        )}
                        <button onClick={handleSaveProfile} disabled={profileSaveStatus === 'saving'} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-all disabled:opacity-50">
                            {profileSaveStatus === 'saving' && <LoaderIcon className="w-4 h-4 animate-spin" />} Update Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
