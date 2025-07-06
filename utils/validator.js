function validateUID(uid) {
    if (!uid) {
        return { isValid: false, error: 'UID is required' };
    }
    
    if (!/^\d+$/.test(uid)) {
        return { isValid: false, error: 'UID must be numeric' };
    }
    
    if (uid.length < 8 || uid.length > 12) {
        return { isValid: false, error: 'UID must be 8-12 digits long' };
    }
    
    return { isValid: true };
}

function validateBackground(bgId) {
    const validBackgrounds = [1, 2, 3];
    const id = parseInt(bgId);
    
    if (isNaN(id) || !validBackgrounds.includes(id)) {
        return { isValid: false, error: 'Invalid background ID. Use 1, 2, or 3' };
    }
    
    return { isValid: true, bgId: id };
}

module.exports = {
    validateUID,
    validateBackground
};