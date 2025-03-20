const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { firstname,lastname,email,username, password } = req.body;
    console.log(username)
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({ firstname,lastname,email,username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email,password } = req.body;

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
    
    // Generate token
    const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Token required' });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded; // Attach user data to request
    next();
  });
};

// Protected Route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.username}! You are authorized.` });
});

module.exports = router;
