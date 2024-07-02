const express = require('express');
const {createUser, getUserByEmail, updateUser} = require('./components/db');
const { get } = require('mongoose');
const bcrypt = require('bcrypt');
const { createToken, verifyToken } = require('./components/jwt');
const { hashPassword, checkPassword } = require('./components/passwordHash');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
const port = 2612;

app.post('/signup', async (req, res) => {

})

app.listen(port, () => {    
    console.log(`       * Welcome to codemelon API * ` );
    console.log(`    * Server is running on port ${port} * `);
})