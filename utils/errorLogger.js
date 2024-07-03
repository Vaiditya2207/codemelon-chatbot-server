// utils/errorLogger.js
const fs = require('fs');
const path = require('path');

function logError(status, message) {
    const error = new Error(message);
    Error.captureStackTrace(error);

    const stack = error.stack.split('\n').slice(1); // Remove the first line (which is the error message itself)
    const callingFrame = stack[0].trim().match(/\(([^)]+)\)/)[1]; // Extract the file path and line number
    const [filePath, lineNumber] = callingFrame.split(':');
    const fileName = path.basename(filePath);

    const data = JSON.stringify({
        module: fileName,
        status: "not-solved",
        message,
        time: new Date(),
        lineNumber: parseInt(lineNumber)
    });

    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    const errorFilePath = path.join(reportsDir, status === "server-error" ? "serverError.json" : "clientError.json");
    fs.appendFileSync(errorFilePath, data + '\n');
}

module.exports = { logError };
