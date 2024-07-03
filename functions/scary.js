const { logError } = require('../utils/errorLogger');

async function shutdownServer(server) {
    try {
        server.close(() => {
            console.log("Server closed");
        });
    } catch (err) {
        logError('server-error', `Server shutdown failed: ${err.message}`);
        throw new Error('Server shutdown failed');
    }
}

module.exports = { shutdownServer };
