const bcrypt = require('bcrypt');

function hashPassword(password){
    return bcrypt.hashSync(password, 11);
}

function checkPassword(password, hash){
    const status = bcrypt.compareSync(password, hash);
    return ({status : status, message: status ? "acess granted" : "access denied"});
}


module.exports = {hashPassword, checkPassword};