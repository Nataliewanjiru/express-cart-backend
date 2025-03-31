
const User = require("../../models/user")
const jwt = require('jsonwebtoken');

function getUserId(req) {
  return new Promise((resolve, reject) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.error("Authentication token missing");
      return reject({ status: 401, message: "Authentication token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Invalid token:", err);
        return reject({ status: 403, message: "Invalid token" });
      }

      console.log("Decoded token:", decoded)

      try {
        const user = await User.findOne({ email: decoded.email }).select("-password");

        if (!user) {
          console.error("User not found for email:", decoded.email);
          return reject({ status: 404, message: "User not found" });
        }

        resolve(user.id);
      } catch (error) {
        console.error("Database error:", error);
        reject({ status: 500, message: error.message });
      }
    });
  });
}

module.exports = { getUserId };
