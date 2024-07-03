const jwt = require('jsonwebtoken');
const { logError } = require('../utils/errorLogger');

function createToken(user) {
    try {
        return jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '10d' });
    } catch (err) {
        logError('server-error', `Token creation failed: ${err.message}`);
        throw new Error('Token creation failed');
    }
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        logError('server-error', `Token verification failed: ${err.message}`);
        throw new Error('Token verification failed');
    }
}

module.exports = { createToken, verifyToken };
