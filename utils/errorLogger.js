const fs = require('fs');
const path = require('path');

function logError(status, message) {
    const error = new Error(message);
    Error.captureStackTrace(error);

    const stack = error.stack.split('\n').slice(1); // Remove the first line (which is the error message itself)
    const callingFrame = stack[0].trim().match(/\(([^)]+)\)/)[1]; // Extract the file path and line number
    const [filePath, lineNumber] = callingFrame.split(':');
    const fileName = path.basename(filePath);

    const newError = {
        module: fileName,
        status: "not-solved",
        message,
        time: new Date(),
        lineNumber: parseInt(lineNumber)
    };

    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    const errorFilePath = path.join(reportsDir, status === "server-error" ? "serverError.json" : "clientError.json");

    // Read the current file content
    let errorLog = [];
    if (fs.existsSync(errorFilePath)) {
        const fileContent = fs.readFileSync(errorFilePath, 'utf-8');
        if (fileContent.trim()) { // Check if file is not empty
            try {
                errorLog = JSON.parse(fileContent);
            } catch (e) {
                console.error("Failed to parse JSON content:", e);
            }
        }
    }

    // Append the new error to the array with a unique key
    const newKey = errorLog.length + 1;
    errorLog.push({ key: newKey, ...newError });

    // Write the updated array back to the file
    fs.writeFileSync(errorFilePath, JSON.stringify(errorLog, null, 2));
}

module.exports = { logError };

