
import React, { useState } from 'react';
import { CompanySettings as CompanySettingsType } from '../../types';
import { PhotoIcon, UploadIcon } from '../../components/icons/DummyIcons';
import { LoaderIcon } from '../../components/icons/LoaderIcon';
import { uploadFile } from '../../services/storageService';

interface CompanySettingsProps {
    companySettings: CompanySettingsType;
    setCompanySettings: (value: React.SetStateAction<CompanySettingsType>) => Promise<void>;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ companySettings, setCompanySettings }) => {
    const [companyData, setCompanyData] = useState({ name: companySettings.name });
    
    // App Logo States
    const [appLogoLightPreview, setAppLogoLightPreview] = useState<string | null>(companySettings.appLogoLight || null);
    const [appLogoDarkPreview, setAppLogoDarkPreview] = useState<string | null>(companySettings.appLogoDark || null);
    
    // Company Logo States
    const [companyLogoLightPreview, setCompanyLogoLightPreview] = useState<string | null>(companySettings.companyLogoLight || null);
    const [companyLogoDarkPreview, setCompanyLogoDarkPreview] = useState<string | null>(companySettings.companyLogoDark || null);

    // Favicon State
    const [faviconPreview, setFaviconPreview] = useState<string | null>(companySettings.favicon || null);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleLogoUpload = async (file: File, type: keyof CompanySettingsType, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => {
        try {
            const url = await uploadFile(file, `system/branding/${type}/${file.name}`);
            setCompanySettings(prev => ({ ...prev, [type]: url }));
            const reader = new FileReader();
            reader.onloadend = () => previewSetter(reader.result as string);
            reader.readAsDataURL(file);
        } catch (error) {
            alert(`Failed to upload logo.`);
        }
    };

    const handleSaveCompanySettings = async () => {
        setSaveStatus('saving');
        try {
            await setCompanySettings(prev => ({ ...prev, name: companyData.name }));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-4">Company Profile</h2>
            <div className="space-y-8">
                <div>
                    <label className="text-gray-700 dark:text-gray-300 font-semibold">Application Name</label>
                    <input type="text" value={companyData.name} onChange={e => setCompanyData({name: e.target.value})} className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>

                {/* App Logo Section */}
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">App Logo (Sidebar & Login Corner)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Light Mode Version</label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-16 h-16 border rounded-lg p-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                    {appLogoLightPreview ? <img src={appLogoLightPreview} className="max-h-full max-w-full object-contain" alt="App Logo Light" /> : <PhotoIcon className="w-8 h-8 text-gray-300" />}
                                </div>
                                <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                                    <UploadIcon className="w-4 h-4"/> Upload
                                    <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'appLogoLight', setAppLogoLightPreview)} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Dark Mode Version</label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-16 h-16 border rounded-lg p-2 bg-gray-900 flex items-center justify-center overflow-hidden">
                                    {appLogoDarkPreview ? <img src={appLogoDarkPreview} className="max-h-full max-w-full object-contain" alt="App Logo Dark" /> : <PhotoIcon className="w-8 h-8 text-gray-300" />}
                                </div>
                                <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                                    <UploadIcon className="w-4 h-4"/> Upload
                                    <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'appLogoDark', setAppLogoDarkPreview)} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Logo Section */}
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Company Logo (Login Center & Documents)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Light Mode Version</label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-16 h-16 border rounded-lg p-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                    {companyLogoLightPreview ? <img src={companyLogoLightPreview} className="max-h-full max-w-full object-contain" alt="Company Logo Light" /> : <PhotoIcon className="w-8 h-8 text-gray-300" />}
                                </div>
                                <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                                    <UploadIcon className="w-4 h-4"/> Upload
                                    <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'companyLogoLight', setCompanyLogoLightPreview)} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Dark Mode Version</label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-16 h-16 border rounded-lg p-2 bg-gray-900 flex items-center justify-center overflow-hidden">
                                    {companyLogoDarkPreview ? <img src={companyLogoDarkPreview} className="max-h-full max-w-full object-contain" alt="Company Logo Dark" /> : <PhotoIcon className="w-8 h-8 text-gray-300" />}
                                </div>
                                <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                                    <UploadIcon className="w-4 h-4"/> Upload
                                    <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'companyLogoDark', setCompanyLogoDarkPreview)} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Favicon Section */}
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Browser Tab Icon (Favicon)</h3>
                    <div>
                        <label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Favicon Image</label>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-12 h-12 border rounded-lg p-2 bg-white flex items-center justify-center overflow-hidden">
                                {faviconPreview ? <img src={faviconPreview} className="max-h-full max-w-full object-contain" alt="Favicon" /> : <PhotoIcon className="w-6 h-6 text-gray-300" />}
                            </div>
                            <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                                <UploadIcon className="w-4 h-4"/> Upload
                                <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'favicon', setFaviconPreview)} />
                            </label>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Recommended size: 32x32px or 64x64px (PNG/ICO).</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3 border-t dark:border-gray-700">
                    <button onClick={handleSaveCompanySettings} disabled={saveStatus === 'saving'} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50">
                        {saveStatus === 'saving' && <LoaderIcon className="w-4 h-4 animate-spin" />} Save System Branding
                    </button>
                </div>
            </div>
        </div>
    );
};
