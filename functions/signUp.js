const fs = require('fs');
const path = require('path');
const { createUser } = require('../components/db');
const { hashPassword } = require('../components/passwordHash');

async function signUp(userData, password) {
    try {
        const hashedPassword = await hashPassword(password);
        const info = await createUser(userData, hashedPassword);

        if (info.status === "success") {
            return { status: "success", message: "User created successfully", uid: info.uid };
        } else {
            const data = JSON.stringify({
                status: "not-solved",
                message: info.message,
                time: new Date()
            });
            const reportsDir = path.join(__dirname, '../reports');
            const filePath = path.join(reportsDir, info.status === "server-error" ? "serverError.json" : "clientError.json");

            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir);
            }

            fs.appendFileSync(filePath, data + '\n');
            return { status: "failed", message: "User creation failed" };
        }
    } catch (err) {
        const data = JSON.stringify({
            status: "not-solved",
            message: err.message,
            time: new Date()
        });

        const reportsDir = path.join(__dirname, '../reports');
        const filePath = path.join(reportsDir, 'serverError.json');

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        fs.appendFileSync(filePath, data + '\n');
        return { status: "server-error", message: "Sorry, we can't proceed with your application right now!" };
    }
}

module.exports = { signUp };
