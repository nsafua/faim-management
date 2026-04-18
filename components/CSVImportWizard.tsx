
import React, { useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { UploadIcon, DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/DummyIcons';
import { useCSVImport } from '../hooks/useCSVImport';

interface CSVImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  requiredHeaders: string[];
  sampleHeaders: string;
  sampleData: string;
  wizardTitle: string;
}

const CSVImportWizard: React.FC<CSVImportWizardProps> = ({ isOpen, onClose, onImport, requiredHeaders, sampleHeaders, sampleData, wizardTitle }) => {
    const {
        step,
        file,
        parsedData,
        validationResults,
        errors,
        isLoading,
        resetWizard,
        handleFileChange,
        handleNext,
        handleBack,
        handleConfirmImport,
        downloadSampleCSV
    } = useCSVImport(requiredHeaders, onImport);

    const handleClose = useCallback(() => {
        resetWizard();
        onClose();
    }, [resetWizard, onClose]);

    const handleDownloadSample = () => {
        downloadSampleCSV(sampleHeaders, sampleData);
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transform transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{wizardTitle}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow bg-gray-50 dark:bg-gray-900">
                   {step === 1 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Download Sample & Prepare Your File</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                To import data, you need a CSV file with specific columns. Download our sample file to see the required format.
                            </p>
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300">File Columns:</h4>
                                <div className="text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-1 overflow-x-auto">
                                    <code className="font-mono whitespace-nowrap">{sampleHeaders.split(',').join(', ')}</code>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">* Fields marked as required in the client form must not be empty.</p>
                            </div>
                            <div className="mt-6">
                                <button onClick={handleDownloadSample} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Download Sample CSV
                                </button>
                            </div>
                        </div>
                   )}
                   {step === 2 && (
                       <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Upload Your CSV File</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Drag and drop your file below or click to select the file from your computer.
                            </p>
                            <div className="mt-6 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv,text/csv,application/vnd.ms-excel" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">CSV file up to 5MB</p>
                                </div>
                            </div>
                            {file && (
                                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Selected file: {file.name}
                                </div>
                            )}
                            {errors.length > 0 && <div className="mt-4 text-sm text-red-600 dark:text-red-400">{errors[0]}</div>}
                        </div>
                   )}
                   {step === 3 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 3: Preview and Confirm Import</h3>
                             <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Review the data below. We'll import <span className="font-bold text-green-600 dark:text-green-400">{parsedData.length}</span> valid records.
                                <span className="font-bold text-red-600 dark:text-red-400"> {validationResults.length - parsedData.length}</span> records with errors will be skipped.
                            </p>
                            {errors.length > 0 && (
                                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5" /> Import Warnings</h4>
                                    <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-200 mt-2 max-h-24 overflow-y-auto">
                                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto max-h-80">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                            {Object.keys(validationResults[0]?.data || {}).slice(0, 5).map(key => <th key={key} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{key}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {validationResults.slice(0, 20).map((result, index) => (
                                            <tr key={index} className={result.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}>
                                                <td className="px-4 py-2">
                                                    {result.errors.length > 0 ? (
                                                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400" title={result.errors.join('\n')}>
                                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">Error</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">OK</span>
                                                        </div>
                                                    )}
                                                </td>
                                                {Object.values(result.data).slice(0, 5).map((val: any, i) => <td key={i} className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{val}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {validationResults.length > 20 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">... and {validationResults.length - 20} more rows.</p>}
                        </div>
                   )}
                   {step === 4 && (
                       <div className="text-center py-10">
                            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Import Successful!</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                We have successfully queued <span className="font-bold">{parsedData.length}</span> records for background import.
                            </p>
                        </div>
                   )}
                </div>
                
                <div className="flex justify-between items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
                    <div>
                        {step > 1 && step < 4 && (
                            <button onClick={handleBack} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                <ChevronLeftIcon className="w-5 h-5" /> Back
                            </button>
                        )}
                    </div>
                    <div>
                        {step < 3 && (
                            <button onClick={handleNext} disabled={(step === 2 && !file) || isLoading} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
                                {isLoading ? 'Processing...' : `Next`} <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        )}
                        {step === 3 && (
                            <button onClick={handleConfirmImport} disabled={parsedData.length === 0 || isLoading} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                                {isLoading ? 'Importing...' : `Confirm & Import ${parsedData.length} Records`}
                            </button>
                        )}
                        {step === 4 && (
                             <button onClick={handleClose} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                                Finish
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CSVImportWizard;
