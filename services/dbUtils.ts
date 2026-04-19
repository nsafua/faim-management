export const sanitizeData = (data: any, seen = new WeakSet()): any => {
    if (data === null || typeof data !== 'object') {
        return data === undefined ? null : data;
    }
    if (seen.has(data)) return "[Circular]";
    if (data instanceof Date) return data.toISOString();
    if (Array.isArray(data)) {
        seen.add(data);
        return data.map(item => sanitizeData(item, seen));
    }

    const sanitizedObj: any = {};
    seen.add(data);
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value !== 'function' && value !== undefined) {
            sanitizedObj[key] = sanitizeData(value, seen);
        }
    });
    return sanitizedObj;
};
