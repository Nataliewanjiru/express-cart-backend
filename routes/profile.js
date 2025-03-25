const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const jwt = require('jsonwebtoken');

// Get User Profile (Protected Route)
router.get('/profile', async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      // Find the user by username (or ID) from the decoded token
      const user = await User.findOne({ email: decoded.email }).select('-password').populate("groups");; // Exclude password
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({message:user});
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/searchprofile", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const users = await User.find({ name: new RegExp(name, "i") }).select("name email profilePicture");
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;