
import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { UploadIcon, UserCheckIcon } from './icons/DummyIcons';
import { Card } from './ui/Card';
import { uploadFile } from '../services/storageService';

interface DocumentPickupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pickupData: { finalPickupDate: string; pickupPersonName: string; idCardUrl: string }) => Promise<void>;
    clientName: string;
    clientId: number;
}

const DocumentPickupModal: React.FC<DocumentPickupModalProps> = ({ isOpen, onClose, onConfirm, clientName, clientId }) => {
    const [finalPickupDate, setFinalPickupDate] = useState(new Date().toISOString().split('T')[0]);
    const [pickupPersonName, setPickupPersonName] = useState('');
    const [idFile, setIdFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idFile) {
            alert("Please upload the client's ID card image.");
            return;
        }

        setIsProcessing(true);
        try {
            const path = `clients/${clientId}/pickup/${Date.now()}_${idFile.name}`;
            const idCardUrl = await uploadFile(idFile, path);
            await onConfirm({ finalPickupDate, pickupPersonName, idCardUrl });
            onClose();
        } catch (error) {
            console.error("Pickup save failed:", error);
            alert("Failed to process pickup. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserCheckIcon className="w-5 h-5 text-amber-500" />
                            Document Pickup
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                        <div className="text-sm text-gray-500 mb-2">
                            Recording collection for <span className="font-bold text-gray-800 dark:text-white">{clientName}</span>
                        </div>
                        
                        <Input 
                            label="Final Pick-up Date" 
                            type="date" 
                            value={finalPickupDate} 
                            onChange={e => setFinalPickupDate(e.target.value)} 
                            required 
                        />
                        
                        <Input 
                            label="Pick-up Person Name" 
                            placeholder="Full name of person collecting" 
                            value={pickupPersonName} 
                            onChange={e => setPickupPersonName(e.target.value)} 
                            required 
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload ID Card Image</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadIcon className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                        {idFile ? idFile.name : 'Select ID Scan/Photo'}
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={e => setIdFile(e.target.files?.[0] || null)} 
                                    accept="image/*" 
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                        <Button type="submit" variant="primary" className="bg-amber-600 hover:bg-amber-700 border-amber-600" isLoading={isProcessing}>
                            Record Collection
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default DocumentPickupModal;
