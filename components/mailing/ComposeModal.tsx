import React, { useState } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '../icons/DummyIcons';
import { Button } from '../ui/Button';
import { Staff } from '../../types';

interface ComposeModalProps {
    staff: Staff[];
    isSending: boolean;
    setActiveTab: (tab: 'inbox' | 'sent' | 'compose') => void;
    handleSendMessage: (composeData: any, pendingFiles: File[]) => Promise<void>;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
    staff,
    isSending,
    setActiveTab,
    handleSendMessage
}) => {
    const [composeData, setComposeData] = useState({ toIds: [] as string[], ccIds: [] as string[], subject: '', body: '' });
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(composeData, pendingFiles).then(() => {
            // Note: In real life we'd reset the form if the component doesn't unmount, but it will unmount because activeTab changes!
        });
    }

    return (
        <div className="w-full flex flex-col h-full bg-white dark:bg-gray-800 overflow-y-auto p-6 scrollbar-thin">
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto w-full space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white">Draft Message</h3>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setActiveTab('inbox')}>Discard</Button>
                        <Button type="submit" isLoading={isSending} icon={<PaperAirplaneIcon className="w-5 h-5 -rotate-45" />}>Send Message</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1.5">Recipients (To)*</label>
                        <select 
                            multiple 
                            className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white min-h-[120px] focus:ring-2 focus:ring-blue-500"
                            value={composeData.toIds}
                            onChange={(e) => setComposeData(p => ({ ...p, toIds: Array.from(e.target.selectedOptions).map(o => (o as HTMLOptionElement).value) }))}
                            required
                        >
                            {staff.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1 italic">Hold Ctrl/Cmd to select multiple staff members.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1.5">Subject Line*</label>
                    <input 
                        type="text" 
                        value={composeData.subject} 
                        onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))} 
                        placeholder="What is this regarding?" 
                        className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500"
                        required 
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1.5">Message Body*</label>
                    <textarea 
                        value={composeData.body} 
                        onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))} 
                        rows={10} 
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your internal message here..."
                        required 
                    />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3">Supporting Documentation</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {pendingFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black border border-blue-100 dark:border-blue-800">
                                <span className="truncate max-w-[150px]">{f.name}</span>
                                <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors"><XMarkIcon className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-100 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
                        <PaperClipIcon className="w-5 h-5 text-indigo-500" />
                        Attach Files
                        <input type="file" multiple className="sr-only" onChange={e => e.target.files && setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                    </label>
                    <p className="text-[10px] text-gray-500 mt-2">Maximum file size: 10MB per file.</p>
                </div>
            </form>
        </div>
    );
};
