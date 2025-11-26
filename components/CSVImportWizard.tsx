import React, { useState, useCallback, ChangeEvent } from 'react';
import { XIcon } from './icons/XIcon';
import { UploadIcon, DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/DummyIcons';

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
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validationResults, setValidationResults] = useState<{ data: any; errors: string[] }[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const resetWizard = useCallback(() => {
        setStep(1);
        setFile(null);
        setParsedData([]);
        setValidationResults([]);
        setErrors([]);
        setIsLoading(false);
    }, []);

    const handleClose = useCallback(() => {
        resetWizard();
        onClose();
    }, [resetWizard, onClose]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                 setFile(selectedFile);
                 setErrors([]);
            } else {
                setErrors(['Invalid file type. Please upload a .csv file.']);
                setFile(null);
            }
        }
    };

    const processFile = useCallback(() => {
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    setErrors(['CSV file must have a header row and at least one data row.']);
                    setIsLoading(false);
                    return;
                }
                const header = lines[0].split(',').map(h => h.trim());
                const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));
                const localErrors: string[] = [];

                if (missingHeaders.length > 0) {
                    localErrors.push(`Warning: Missing required columns in CSV: ${missingHeaders.join(', ')}. These fields will be blank for all rows.`);
                }

                const validatedData = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const rowErrors: string[] = [];
                    
                    const rowData: { [key: string]: string } = {};
                    header.forEach((h, index) => {
                        rowData[h] = values[index]?.trim() || '';
                    });

                    // Row-level validation
                    requiredHeaders.forEach(rh => {
                        if (!rowData[rh] || rowData[rh].trim() === '') {
                            rowErrors.push(`Missing required field: '${rh}'.`);
                        }
                    });

                    if (rowData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(rowData.email)) {
                        rowErrors.push(`Invalid email format for '${rowData.email}'.`);
                    }

                    if (rowData.telephone && !/^\d{9,10}$/.test(rowData.telephone)) {
                        rowErrors.push(`Invalid phone number format for '${rowData.telephone}'. Must be 9-10 digits.`);
                    }

                    validatedData.push({ data: rowData, errors: rowErrors });
                }

                const validData = validatedData.filter(v => v.errors.length === 0).map(v => v.data);
                const invalidRowCount = validatedData.length - validData.length;

                if (invalidRowCount > 0) {
                    localErrors.push(`Found issues in ${invalidRowCount} row(s). These rows will be skipped.`);
                }
                
                setValidationResults(validatedData);
                setParsedData(validData);
                setErrors(localErrors);
                setStep(3);

            } catch (error) {
                 setErrors(['An unexpected error occurred while parsing the file.']);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
             setErrors(['Failed to read the file.']);
             setIsLoading(false);
        }
        reader.readAsText(file);
    }, [file, requiredHeaders]);

    const handleNext = () => {
        if (step === 2 && file) {
            processFile();
        } else {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => setStep(s => s - 1);

    const handleConfirmImport = () => {
        setIsLoading(true);
        onImport(parsedData);
        setStep(4);
        setIsLoading(false);
    };

    const downloadSampleCSV = () => {
        const csvContent = `${sampleHeaders}\n${sampleData}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "faim_import_sample.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transform transition-all">
                <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">{wizardTitle}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                   {step === 1 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Step 1: Download Sample & Prepare Your File</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                To import data, you need a CSV file with specific columns. Download our sample file to see the required format.
                            </p>
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-800">File Columns:</h4>
                                <div className="text-sm text-blue-700 mt-2 space-y-1 overflow-x-auto">
                                    <code className="font-mono whitespace-nowrap">{sampleHeaders.split(',').join(', ')}</code>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">* Fields marked as required in the client form must not be empty.</p>
                            </div>
                            <div className="mt-6">
                                <button onClick={downloadSampleCSV} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Download Sample CSV
                                </button>
                            </div>
                        </div>
                   )}
                   {step === 2 && (
                       <div>
                            <h3 className="text-lg font-semibold text-gray-900">Step 2: Upload Your CSV File</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Drag and drop your file below or click to select the file from your computer.
                            </p>
                            <div className="mt-6 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv,text/csv" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">CSV file up to 5MB</p>
                                </div>
                            </div>
                            {file && (
                                <div className="mt-4 p-3 bg-gray-100 rounded-md border text-sm font-medium text-gray-700">
                                    Selected file: {file.name}
                                </div>
                            )}
                            {errors.length > 0 && <div className="mt-4 text-sm text-red-600">{errors[0]}</div>}
                        </div>
                   )}
                   {step === 3 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Step 3: Preview and Confirm Import</h3>
                             <p className="mt-2 text-sm text-gray-600">
                                Review the data below. We'll import <span className="font-bold text-green-600">{parsedData.length}</span> valid records.
                                <span className="font-bold text-red-600"> {validationResults.length - parsedData.length}</span> records with errors will be skipped.
                            </p>
                            {errors.length > 0 && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-semibold text-yellow-800 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5" /> Import Warnings</h4>
                                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 max-h-24 overflow-y-auto">
                                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-4 border rounded-lg overflow-x-auto max-h-80">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold text-gray-600">Status</th>
                                            {Object.keys(validationResults[0]?.data || {}).map(key => <th key={key} className="px-4 py-2 font-semibold text-gray-600 whitespace-nowrap">{key}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {validationResults.slice(0, 10).map((result, index) => (
                                            <tr key={index} className={result.errors.length > 0 ? 'bg-red-50' : 'bg-green-50'}>
                                                <td className="px-4 py-2">
                                                    {result.errors.length > 0 ? (
                                                        <div className="flex items-center gap-1 text-red-600" title={result.errors.join('\n')}>
                                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">Error</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">OK</span>
                                                        </div>
                                                    )}
                                                </td>
                                                {Object.values(result.data).map((val: any, i) => <td key={i} className="px-4 py-2 whitespace-nowrap">{val}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {validationResults.length > 10 && <p className="text-xs text-gray-500 mt-2 text-center">... and {validationResults.length - 10} more rows.</p>}
                        </div>
                   )}
                   {step === 4 && (
                       <div className="text-center py-10">
                            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">Import Successful!</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                We have successfully added <span className="font-bold">{parsedData.length}</span> records. You can now close this window.
                            </p>
                        </div>
                   )}
                </div>
                
                <div className="flex justify-between items-center p-5 border-t bg-white rounded-b-lg">
                    <div>
                        {step > 1 && step < 4 && (
                            <button onClick={handleBack} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2">
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