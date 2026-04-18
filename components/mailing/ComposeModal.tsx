import React, { useState, useRef, useEffect } from 'react';
import { Staff, Role } from '../../types';
import { XMarkIcon, PaperClipIcon, PaperAirplaneIcon, ChevronDownIcon, CheckCircleIcon } from '../icons/DummyIcons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { uploadFile } from '../../services/storageService';

export interface ComposeInitialData {
    recipientIds?: string[];
    subject?: string;
    body?: string;
    attachments?: { name: string; url: string; type: string; size: number }[];
}

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff[];
    roles: Role[];
    onSend: (data: any) => void;
    initialData?: ComposeInitialData;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, staff, roles, onSend, initialData }) => {
    const [targetType, setTargetType] = useState<'individual' | 'group'>('individual');
    const [recipientIds, setRecipientIds] = useState<string[]>([]);
    const [groupIds, setGroupIds] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [initialAttachments, setInitialAttachments] = useState<{ name: string; url: string; type: string; size: number }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Dropdown State
    const [isRecipientDropdownOpen, setRecipientDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initialize state when modal opens, potentially with reply or statement data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setRecipientIds(initialData.recipientIds || []);
                setSubject(initialData.subject || '');
                setBody(initialData.body || '');
                setInitialAttachments(initialData.attachments || []);
                setTargetType('individual');
                setGroupIds([]);
            } else {
                setRecipientIds([]);
                setSubject('');
                setBody('');
                setInitialAttachments([]);
                setGroupIds([]);
                setTargetType('individual');
            }
            setPendingFiles([]);
        }
    }, [isOpen, initialData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setRecipientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const toggleRecipient = (id: string) => {
        setRecipientIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const uploadedFiles = await Promise.all(
                pendingFiles.map(async (file) => {
                    const url = await uploadFile(file, `internal_mail/tmp/${Date.now()}_${file.name}`);
                    return { name: file.name, url, size: file.size, type: file.type };
                })
            );

            // Merge with system-generated attachments (initialAttachments)
            const attachmentData = [...initialAttachments, ...uploadedFiles];

            // Resolve recipients if group is selected
            let finalRecipientIds = [...recipientIds];
            if (targetType === 'group') {
                if (groupIds.includes('ALL_STAFF')) {
                    finalRecipientIds = staff.map(s => s.id);
                } else {
                    finalRecipientIds = staff.filter(s => groupIds.includes(s.roleId)).map(s => s.id);
                }
            }

            // Basic validation
            if (finalRecipientIds.length === 0 && groupIds.length === 0) {
                alert("Please select at least one recipient.");
                setIsProcessing(false);
                return;
            }

            onSend({ recipientIds: finalRecipientIds, groupIds, subject, body, attachments: attachmentData });
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex justify-center items-center p-4 backdrop-blur-md">
            {/* Direct div container to control flex layout without Card padding interference */}
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    {/* Fixed Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 shrink-0">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Draft Correspondence</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                    
                    {/* Scrollable Content Area */}
                    <div className="p-6 space-y-5 overflow-y-auto scrollbar-thin flex-grow bg-white dark:bg-gray-800 min-h-0">
                        <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <button type="button" onClick={() => setTargetType('individual')} className={`text-xs font-black uppercase tracking-widest pb-1 ${targetType === 'individual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>To Individual</button>
                            <button type="button" onClick={() => setTargetType('group')} className={`text-xs font-black uppercase tracking-widest pb-1 ${targetType === 'group' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>To Group</button>
                        </div>

                        {targetType === 'individual' ? (
                            <div className="space-y-1 relative" ref={dropdownRef}>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Recipients*</label>
                                <button
                                    type="button"
                                    onClick={() => setRecipientDropdownOpen(!isRecipientDropdownOpen)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-left flex justify-between items-center hover:border-blue-500 transition-colors"
                                >
                                    <span className={`truncate ${recipientIds.length === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {recipientIds.length > 0
                                            ? `${recipientIds.length} Recipient${recipientIds.length > 1 ? 's' : ''} Selected`
                                            : 'Choose staff members...'}
                                    </span>
                                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isRecipientDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isRecipientDropdownOpen && (
                                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin">
                                        {staff.map(s => (
                                            <div 
                                                key={s.id} 
                                                onClick={() => toggleRecipient(s.id)} 
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${recipientIds.includes(s.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                                        {recipientIds.includes(s.id) && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{s.fullName} ({s.email})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {recipientIds.map(id => {
                                        const user = staff.find(s => s.id === id);
                                        if (!user) return null;
                                        return (
                                            <Badge key={id} variant="neutral" className="flex items-center gap-1">
                                                {user.fullName}
                                                <button type="button" onClick={() => toggleRecipient(id)} className="hover:text-red-500"><XMarkIcon className="w-3.5 h-3.5" /></button>
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select User Groups*</label>
                                <select 
                                    multiple 
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500"
                                    value={groupIds}
                                    onChange={(e) => setGroupIds(Array.from(e.target.selectedOptions).map(o => (o as HTMLOptionElement).value))}
                                >
                                    <option value="ALL_STAFF">ALL STAFF</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>DEPT: {r.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        )}

                        <Input label="Subject Line*" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Main purpose of message..." required />

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Body* (Rich Text Supported)</label>
                            <textarea 
                                value={body} 
                                onChange={e => setBody(e.target.value)} 
                                rows={8} 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your internal message here..."
                                required 
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Internal Attachments</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {/* System-Generated Attachments (Pre-filled) */}
                                {initialAttachments.map((f, i) => (
                                    <Badge key={`init-${i}`} variant="success" className="flex items-center gap-2 font-bold px-3 py-1.5 ring-1 ring-green-200">
                                        <span className="truncate max-w-[150px]">{f.name} (Auto)</span>
                                        <button type="button" onClick={() => setInitialAttachments(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors"><XMarkIcon className="w-3.5 h-3.5" /></button>
                                    </Badge>
                                ))}
                                
                                {/* User-Uploaded Files */}
                                {pendingFiles.map((f, i) => (
                                    <Badge key={`pending-${i}`} variant="info" className="flex items-center gap-2 font-bold px-3 py-1.5">
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500"><XMarkIcon className="w-3.5 h-3.5" /></button>
                                    </Badge>
                                ))}
                            </div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
                                <PaperClipIcon className="w-4 h-4 text-blue-600" /> Add Resource
                                <input type="file" multiple className="sr-only" onChange={e => e.target.files && setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                            </label>
                        </div>
                    </div>

                    {/* Fixed Footer with Send Button */}
                    <div className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isProcessing} icon={<PaperAirplaneIcon className="w-5 h-5 -rotate-45" />}>Send Message</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
