export const validateInput = (payload) => {
    if (!payload.query || payload.query.length < 2) {
        return { valid: false, error: "Query too short for resonance." };
    }
    return { valid: true };
};

export const checkAdminAccess = (payload) => {
    return payload.trustZone === 'admin' && payload.identityHash;
};

