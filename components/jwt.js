const jwt = require('jsonwebtoken');

function createToken(user){
    return jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '10d' });
}

function verifyToken(token){
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
}

module.exports = { createToken, verifyToken };