const express = require('express');
const cookieParser = require('cookie-parser');
const {signUp} = require('./functions/signUp');
const {checkCredentials} = require('./functions/signIn');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
const port = 2612;

app.post('/signup', async (req, res) => {
    const userData = req.body.info;
    const password = req.body.password;
    const response = await signUp(userData, password);
    res.json(response);
})

app.post('/signin', async (req, res) => {
    if(req.body.credentials){
        const response = await checkCredentials(req.body.credentials);
        res.json(response);
    }else{
        res.json({status: "failed", message: "Data error"});
    }
})

app.listen(port, () => {    
    console.log(`       * Welcome to codemelon API * ` );
    console.log(`    * Server is running on port ${port} * `);
})