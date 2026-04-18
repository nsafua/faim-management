import { useState, useCallback, ChangeEvent } from 'react';
import { validateCSVRows } from '../utils/validators';

export const useCSVImport = (requiredHeaders: string[], onImport: (data: any[]) => void) => {
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (
                selectedFile.type === 'text/csv' ||
                selectedFile.name.endsWith('.csv') ||
                selectedFile.type === 'application/vnd.ms-excel'
            ) {
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
                // Split by newline, filter empty lines
                const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');

                if (lines.length < 2) {
                    setErrors(['CSV file must have a header row and at least one data row.']);
                    setIsLoading(false);
                    return;
                }

                const { validatedData, missingHeaders } = validateCSVRows(lines, requiredHeaders);
                const localErrors: string[] = [];

                if (missingHeaders.length > 0) {
                    localErrors.push(
                        `Warning: Missing required columns: ${missingHeaders.join(', ')}. These fields will be blank.`
                    );
                }

                const validData = validatedData.filter((v) => v.errors.length === 0).map((v) => v.data);
                const invalidRowCount = validatedData.length - validData.length;

                if (invalidRowCount > 0) {
                    localErrors.push(`Found issues in ${invalidRowCount} row(s). These rows will be skipped.`);
                } else if (validData.length === 0) {
                    localErrors.push('No valid data rows found to import.');
                }

                setValidationResults(validatedData);
                setParsedData(validData);
                setErrors(localErrors);
                setStep(3);
            } catch (error) {
                console.error(error);
                setErrors(['An unexpected error occurred while parsing the file. Please check CSV format.']);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setErrors(['Failed to read the file.']);
            setIsLoading(false);
        };
        reader.readAsText(file);
    }, [file, requiredHeaders]);

    const handleNext = () => {
        if (step === 2 && file) {
            processFile();
        } else {
            setStep((s) => s + 1);
        }
    };

    const handleBack = () => setStep((s) => s - 1);

    const handleConfirmImport = () => {
        setIsLoading(true);
        // Using setTimeout to allow UI to update before heavy processing
        setTimeout(() => {
            onImport(parsedData);
            setStep(4);
            setIsLoading(false);
        }, 100);
    };

    const downloadSampleCSV = (sampleHeaders: string, sampleData: string) => {
        const csvContent = `${sampleHeaders}\n${sampleData}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'faim_import_sample.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return {
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
        downloadSampleCSV,
        setStep
    };
};
