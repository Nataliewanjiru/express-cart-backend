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
      const user = await User.findOne({ email: decoded.email }).select('-password'); // Exclude password
console.log(user)
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

module.exports = router;