import { parseCSVLine } from '../utils/csvParser';

export const validateCSVRows = (
    lines: string[],
    requiredHeaders: string[]
): {
    header: string[];
    validatedData: { data: { [key: string]: string }; errors: string[] }[];
    missingHeaders: string[];
} => {
    // Parse headers (strip BOM if present and quotes)
    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const header = parseCSVLine(headerLine).map(h => h.replace(/^"|"$/g, '').trim());

    const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));
    
    const validatedData: { data: { [key: string]: string }; errors: string[] }[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        // Skip empty rows that might happen due to trailing newlines
        if (values.length === 1 && values[0] === '') continue;

        const rowErrors: string[] = [];
        const rowData: { [key: string]: string } = {};
        
        header.forEach((h, index) => {
            // Clean up quotes from values if they exist
            rowData[h] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
        });

        // Row-level validation
        requiredHeaders.forEach(rh => {
            if (!rowData[rh] || rowData[rh].trim() === '') {
                rowErrors.push(`Missing required field: '${rh}'.`);
            }
        });

        // Basic format validation
        if (rowData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(rowData.email)) {
            rowErrors.push(`Invalid email format for '${rowData.email}'.`);
        }

        validatedData.push({ data: rowData, errors: rowErrors });
    }

    return { header, validatedData, missingHeaders };
};
