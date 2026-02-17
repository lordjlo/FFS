
/**
 * Retrieves the list of admin emails from environment variables.
 * Supports comma-separated values in NEXT_PUBLIC_ADMIN_EMAIL.
 * @returns {string[]} Array of admin email addresses
 */
export function getAdmins() {
    const adminEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';
    return adminEnv
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
}

/**
 * Checks if a given email belongs to an admin.
 * @param {string} email 
 * @returns {boolean}
 */
export function isAdmin(email) {
    if (!email) return false;
    const admins = getAdmins();
    return admins.includes(email);
}
