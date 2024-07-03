const { createUser } = require('../components/db');
const { hashPassword } = require('../components/passwordHash');
const { logError } = require('../utils/errorLogger');

async function signUp(userData, password) {
    try {
        const hashedPassword = await hashPassword(password);
        const info = await createUser(userData, hashedPassword);
        if (info.status === "success") {
            return { status: "success", message: "User created successfully", uid: info.uid };
        } else {
            logError(info.status, info.message);
            return { status: "failed", message: "User creation failed" };
        }
    } catch (err) {
        logError('server-error', err.message);
        return { status: "server-error", message: "Sorry, we can't proceed with your application right now!" };
    }
}

module.exports = { signUp };
