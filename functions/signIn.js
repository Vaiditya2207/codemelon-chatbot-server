const {getUserByName, getUserByEmail} = require('../components/db');
const {checkPassword} = require('../components/passwordHash');
async function checkCredentials(credentials){
    if (credentials.username && credentials.password){
        const user = await getUserByName(credentials.username, "codemelonCredentials");
        console.log(user);
        if (user.status === "found"){
            const response = await checkPassword(credentials.password, user.user.password);
            return response;
        }else{
            return {status: "failed", message: "User not found"};
        }
    }else if(credentials.email && credentials.password){
        const user = await getUserByEmail(credentials.email, "codemelonCredentials");
        console.log(user);
        if (user.status === "found"){
            const response = await checkPassword(credentials.password, user.user.password);
            return response;
        }else{
            return {status: "failed", message: "User not found"};
        }
    }else{
        return {status: "failed", message: "Please check your credentials"};
    }
}
module.exports = { checkCredentials };
