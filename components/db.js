const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const mongoURI = "mongodb://localhost:27017/codemelon";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("   * Connected to Codemelon database! * "))
  .catch(err => console.error("Connection error", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

function checkDbConnection() {
    const state = mongoose.connection.readyState;
    switch (state) {
      case 0:
        return ({status: "failed", message: "Database connection failed."})
      case 1:
        return ({status: "success", message: "Database connection successful."})
      case 2:
        return ({status: "failed", message: "Database is connecting."})
      case 3:
        return ({status: "failed", message: "Database connection is disconnecting."})
      default:
        return ({status: "failed", message: "Unknown database connection state."})
    }
  }

async function createUser(user) {
  if (checkDbConnection().status === "failed") {
    return ({status: "server-error", message: checkDbConnection().message});
  }
  user.uid = uuidv4();
  try {
    const existingUsers = await db.collection("codemelonUsers").find({ email: user.email }).toArray();
    
    if (existingUsers.length > 0) {
      return r({status: "client-error", message: "User with this email already exists"});
    }
    
    await db.collection("codemelonUsers").insertOne(user);
    return ({status: "success", message: "User inserted successfully", uid: user.uid});
  } catch (err) {
    return ({status: "server-error", message: err.message})
  }
}

async function getUserByEmail(email){
    if (checkDbConnection().status === "failed") {
        return ({status: "server-error", message: checkDbConnection().message});
    }
    try{
        const user = await db.collection("codemelonUsers").findOne({email: email});
        if (user == null){
            return ({status: "not-found", message: "User not found"})
        }else{
            return ({status: "found", uid: user.uid});
        }
    }catch (err) {
        return ({status: "server-error", message: err.message});
    }
}

async function getUserByUid(uid){
    if (checkDbConnection().status === "failed") {
        return ({status: "server-error", message: checkDbConnection().message});
    }
    try{
        const user = await db.collection("codemelonUsers").findOne({uid: uid});
        if (user == null){
            return ({status: "not-found", message: "User not found"})
        }else{
            return ({status: "found", email: user.email});
        }
    }catch (err) {
        return ({status: "server-error", message: err.message});
    }
}

async function getUserByName(username){
    if (checkDbConnection().status === "failed") {
        return ({status: "server-error", message: checkDbConnection().message});
    }
    try{
        const user = await db.collection("codemelonUsers").findOne({username: username});
        if (user == null){
            return ({status: "not-found", message: "User not found"})
        }else{
            return ({status: "found", uid: user.uid});
        }
    }catch (err) {
        return ({status: "server-error", message: err.message});
    }
}

async function updateUser(req, res, next) {
    const dbStatus = await checkDbConnection();
    if (dbStatus.status === "failed") {
      return res.status(500).json({ status: "server-error", message: dbStatus.message });
    }
  
    const updatedInfo = req.body.updatedInfo;
    
    try {
      const existingUser = await db.collection("codemelonUsers").findOne({ email: updatedInfo.email });
  
      if (!existingUser) {
        return res.status(404).json({ status: "client-error", message: "User not found" });
      }
  
      // Prevent changing email and uid
      if (updatedInfo.email && updatedInfo.email !== existingUser.email) {
        return res.status(400).json({ status: "client-error", message: "Email cannot be changed" });
      }
  
      if (updatedInfo.uid && updatedInfo.uid !== existingUser.uid) {
        return res.status(400).json({ status: "client-error", message: "UID cannot be changed" });
      }
  
      // Check if new username is available
      if (updatedInfo.username && updatedInfo.username !== existingUser.username) {
        const usernameTaken = await getUserByName(updatedInfo.username);
        if (usernameTaken.status == "found") {
          return res.status(400).json({ status: "client-error", message: "Username is already taken" });
        }
      }
  
      const mergedInfo = { ...existingUser, ...updatedInfo };
  
      await db.collection("codemelonUsers").updateOne({ email: existingUser.email }, { $set: mergedInfo });
      res.json({ status: "success", message: "User updated successfully" });
    } catch (err) {
      res.status(500).json({ status: "server-error", message: err.message });
    }
    
    next();
  }

module.exports = { createUser, getUserByEmail, updateUser, getUserByUid, getUserByName};
