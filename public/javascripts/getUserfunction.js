
const User = require("../../models/user")
const jwt = require('jsonwebtoken');


function getUserId(req) {
    return new Promise((resolve, reject) => {
      // Extract token
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return reject({ status: 401, message: "Authentication token missing" });
      }
  
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          return reject({ status: 403, message: "Invalid token" });
        }
  
        try {
          const user = await User.findOne({ email: decoded.email }).select("-password");
          if (!user) {
            return reject({ status: 404, message: "User not found" });
          }
  
          resolve(user.id); 
        } catch (error) {
          reject({ status: 500, message: error.message });
        }
      });
    });
  }
  
  module.exports = { getUserId };
