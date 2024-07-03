const express = require('express');
const cookieParser = require('cookie-parser');
const { signUp } = require('./functions/signUp');
const { checkCredentials } = require('./functions/signIn');
const { shutdownServer } = require('./functions/scary');
const { checkShutdownKey } = require('./components/passwordHash');
const { logError } = require('./utils/errorLogger');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
const port = 2612;

app.post('/signup', async (req, res) => {
    try {
        if(!req.body.info){
            logError('client-error', "missing arguments");
            res.status(400).json({ status: "failed", message: "missing info" });
        }
        const userData = req.body.info;
        const password = req.body.password;
        const response = await signUp(userData, password);
        res.json(response);
    } catch (err) {
        logError('server-error', err.message);
        res.status(500).json({ status: "server-error", message: "Internal Server Error" });
    }
});

app.post('/signin', async (req, res) => {
    try {
        if (req.body.credentials) {
            const response = await checkCredentials(req.body.credentials);
            res.json(response);
        } else {
            logError('client-error', "missing arguments");
            res.json({ status: "failed", message: "Data error" });
        }
    } catch (err) {
        logError('server-error', err.message);
        res.status(500).json({ status: "server-error", message: "Internal Server Error" });
    }
});

app.get('/server-report', (req, res) => {
    try {
        const filePath = path.join(__dirname, '/reports/serverError.json');
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('No server reports available.');
        }
    } catch (err) {
        logError('server-error', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/client-report', (req, res) => {
    try {
        const filePath = path.join(__dirname, '/reports/clientError.json');
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('No client reports available.');
        }
    } catch (err) {
        logError('server-error', err.message);
        res.status(500).send('Internal Server Error');
    }
});

let server = app.listen(port, () => {
    console.log(`       * Welcome to codemelon API * `);
    console.log(`    * Server is running on port ${port} * `);
});

app.post('/shutdown', async (req, res) => {
    try {
        const key = req.body.key;
        if (!key) {
            return res.json({ status: "failed", message: "No key provided" });
        }
        const result = await checkShutdownKey(key);
        if (result) {
            res.json({ status: "success", message: "Server is shutting down" });
            await shutdownServer(server);
        } else {
            res.json({ status: "failed", message: "Invalid key" });
        }
    } catch (err) {
        logError('server-error', err.message);
        res.status(500).json({ status: "server-error", message: "Internal Server Error" });
    }
});

module.exports = {app, server}