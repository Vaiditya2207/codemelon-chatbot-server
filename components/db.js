const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const mongoURI = "mongodb://localhost:27017/codemelon";

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("   * Connected to Codemelon database! * "))
  .catch(err => console.error("Connection error", err));
// Handle connection errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

/**
 * Check the current state of the MongoDB connection.
 * @returns {Object} - The connection status and a corresponding message.
 */
function checkDbConnection() {
    const state = mongoose.connection.readyState;
    switch (state) {
      case 0:
        return {status: "failed", message: "Database connection failed."};
      case 1:
        return {status: "success", message: "Database connection successful."};
      case 2:
        return {status: "failed", message: "Database is connecting."};
      case 3:
        return {status: "failed", message: "Database connection is disconnecting."};
      default:
        return {status: "failed", message: "Unknown database connection state."};
    }
}

/**
 * Create a new user in the database.
 * @param {Object} user - The user object containing user details.
 * @param {String} password - The hashed password of the user.
 * @returns {Object} - The status of the user creation process and a message.
 */
async function createUser(user, password) {
  const dbStatus = checkDbConnection();
  if (dbStatus.status === "failed") {
    return {status: "server-error", message: dbStatus.message};
  }
  
  user.uid = uuidv4(); // Assign a unique identifier to the user.
  try {
    const existingUsers = await db.collection("codemelonUsers").find({ email: user.email }).toArray();
    
    if (existingUsers.length > 0) {
      return {status: "client-error", message: "User with this email already exists"};
    }
    
    // Insert user details and credentials into the database.
    await db.collection("codemelonUsers").insertOne(user);
    await db.collection("codemelonCredentials").insertOne({ uid: user.uid, username: user.username, email: user.email, password });
    return {status: "success", message: "User inserted successfully", uid: user.uid};
  } catch (err) {
    return {status: "server-error", message: err.message};
  }
}

/**
 * Retrieve a user by email from the specified database collection.
 * @param {String} email - The email of the user to retrieve.
 * @param {String} database - The name of the database collection.
 * @returns {Object} - The status of the retrieval process and the user data or an error message.
 */
async function getUserByEmail(email, database) {
    const dbStatus = checkDbConnection();
    if (dbStatus.status === "failed") {
        return {status: "server-error", message: dbStatus.message};
    }
    try {
        const user = await db.collection(database).findOne({ email });
        if (!user) {
            return {status: "not-found", message: "User not found"};
        }
        return {status: "found", user};
    } catch (err) {
        return {status: "server-error", message: err.message};
    }
}

/**
 * Retrieve a user by UID from the specified database collection.
 * @param {String} uid - The UID of the user to retrieve.
 * @param {String} database - The name of the database collection.
 * @returns {Object} - The status of the retrieval process and the user data or an error message.
 */
async function getUserByUid(uid, database) {
    const dbStatus = checkDbConnection();
    if (dbStatus.status === "failed") {
        return {status: "server-error", message: dbStatus.message};
    }
    try {
        const user = await db.collection(database).findOne({ uid });
        if (!user) {
            return {status: "not-found", message: "User not found"};
        }
        return {status: "found", user};
    } catch (err) {
        return {status: "server-error", message: err.message};
    }
}

/**
 * Retrieve a user by username from the specified database collection.
 * @param {String} username - The username of the user to retrieve.
 * @param {String} database - The name of the database collection.
 * @returns {Object} - The status of the retrieval process and the user data or an error message.
 */
async function getUserByName(username, database) {
    const dbStatus = checkDbConnection();
    if (dbStatus.status === "failed") {
        return {status: "server-error", message: dbStatus.message};
    }
    try {
        const user = await db.collection(database).findOne({ username });
        if (!user) {
            return {status: "not-found", message: "User not found"};
        }
        return {status: "found", user};
    } catch (err) {
        return {status: "server-error", message: err.message};
    }
}

/**
 * Update user information in the database.
 * @param {Object} req - The request object containing updated user information.
 * @param {Object} res - The response object to send the result.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
async function updateUser(req, res, next) {
    const dbStatus = checkDbConnection();
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
        const usernameTaken = await getUserByName(updatedInfo.username, "codemelonUsers");
        if (usernameTaken.status === "found") {
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

module.exports = { createUser, getUserByEmail, updateUser, getUserByUid, getUserByName, db};
