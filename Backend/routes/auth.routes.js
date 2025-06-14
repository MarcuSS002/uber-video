// filepath: d:\LastTime\uber-video\Backend\routes\auth.js
const express = require('express');
const router = express.Router();

// Example route for authentication
router.post('/login', (req, res) => {
    res.status(200).json({ message: 'Login successful' });
});

router.post('/register', (req, res) => {
    res.status(200).json({ message: 'Registration successful' });
});

module.exports = router;