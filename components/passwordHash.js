const bcrypt = require('bcrypt');
const { db } = require('./db');
const { logError } = require('../utils/errorLogger');

async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, 11);
    } catch (err) {
        logError('server-error', `Hashing password failed: ${err.message}`);
        throw new Error('Hashing password failed');
    }
}

async function checkPassword(password, hash) {
    try {
        const status = await bcrypt.compare(password, hash);
        return { status: status, message: status ? "access granted" : "access denied" };
    } catch (err) {
        logError('server-error', `Password comparison failed: ${err.message}`);
        throw new Error('Password comparison failed');
    }
}

async function checkShutdownKey(key) {
    try {
        const hashedKeyDoc = await db.collection("codemelonAdminKeys").findOne({ id: "shutdownKey" });
        if (!hashedKeyDoc) {
            throw new Error('Shutdown key not found');
        }
        const status = await bcrypt.compare(key, hashedKeyDoc.key);
        return status;
    } catch (err) {
        logError('server-error', `Checking shutdown key failed: ${err.message}`);
        throw new Error('Checking shutdown key failed');
    }
}

module.exports = { hashPassword, checkPassword, checkShutdownKey };
