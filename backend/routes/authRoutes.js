const express = require('express');
const router = express.Router();

// FIX: Add 'googleLogin' inside these curly braces ⬇️
const { registerUser, loginUser, googleLogin } = require('../controllers/authController');

console.log("Auth Routes Loaded!"); 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

module.exports = router;