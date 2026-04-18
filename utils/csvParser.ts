export const parseCSVLine = (text: string) => {
    const result = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
            // Handle escaped quotes ("") inside a quoted string if needed, 
            // but primarily toggle quote state
            if (inQuotes && text[i + 1] === '"') {
                cell += '"';
                i++; // skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of cell
            result.push(cell.trim());
            cell = '';
        } else {
            cell += char;
        }
    }
    // Push the last cell
    result.push(cell.trim());
    return result;
};
