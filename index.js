const express = require('express');
const {createUser, getUserByEmail, updateUser} = require('./components/db');
const { get } = require('mongoose');
const { createToken, verifyToken } = require('./components/jwt');

const app = express();
app.use(express.json());
const port = 2612;

app.post('/signup', async (req, res) => {
    const userInfo = req.body.info;
    const user = await createUser(userInfo);
})

app.listen(port, () => {    
    console.log(`       * Welcome to codemelon API * ` );
    console.log(`    * Server is running on port ${port} * `);
})