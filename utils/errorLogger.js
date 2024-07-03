// utils/errorLogger.js
const fs = require('fs');
const path = require('path');

function logError(status, message) {
    const data = JSON.stringify({
        status: "not-solved",
        message,
        time: new Date()
    });

    const reportsDir = path.join(__dirname, '../reports');
    const filePath = path.join(reportsDir, status === "server-error" ? "serverError.json" : "clientError.json");

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    fs.appendFileSync(filePath, data + '\n');
}

module.exports = { logError };
