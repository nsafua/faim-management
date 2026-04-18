import React from 'react';
import { LockClosedIcon, ArrowPathIcon, UploadIcon } from '../icons/DummyIcons';
import { UploadState } from '../../hooks/useRefundRequestState';

interface FileUploadFieldProps {
    label: string;
    state: UploadState;
    setter: React.Dispatch<React.SetStateAction<UploadState>>;
    isSubmitting: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({ label, state, setter, isSubmitting }) => {
    const isUploading = state.status === 'uploading';
    const isSuccess = state.status === 'success';
    const isFailed = state.status === 'failed';

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase block">{label}*</label>
            <div className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${
                isFailed ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                isSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-blue-400'
            }`}>
                {isUploading ? (
                    <div className="text-center p-4">
                        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-xs font-bold text-blue-600">Uploading {state.progress}%...</p>
                    </div>
                ) : isSuccess ? (
                    <div className="text-center p-4">
                        <LockClosedIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-green-600 truncate max-w-[180px]">{state.file?.name}</p>
                        <button type="button" onClick={() => setter({ file: null, status: 'idle', progress: 0, url: null, error: null })} className="text-[10px] text-gray-400 underline mt-1">Remove</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center cursor-pointer" onClick={() => !isSubmitting && document.getElementById(`file-${label}`)?.click()}>
                        <UploadIcon className={`w-8 h-8 mb-2 ${isFailed ? 'text-red-400' : 'text-gray-400'}`} />
                        <p className="text-[10px] font-bold text-gray-500">{state.file ? state.file.name : 'Select PDF File'}</p>
                        {isFailed && <button type="button" className="text-[10px] text-red-600 font-black uppercase mt-1">Retry Upload</button>}
                    </div>
                )}
                <input 
                    id={`file-${label}`}
                    type="file" 
                    className="hidden" 
                    accept="application/pdf" 
                    disabled={isSubmitting || isUploading}
                    onChange={e => setter({ ...state, file: e.target.files?.[0] || null, status: 'idle', error: null })} 
                />
            </div>
            {state.error && <p className="text-[10px] text-red-600 font-bold">{state.error}</p>}
        </div>
    );
};
