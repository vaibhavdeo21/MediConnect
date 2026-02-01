const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Debugging log to see if this file is loading
console.log("Auth Routes Loaded!"); 

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;