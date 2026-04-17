export const formatLog = (data) => {
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
};

export const generateResonanceKey = (query) => {
    return `resonance:${query.trim().toLowerCase().replace(/\s+/g, '_')}`;
};

