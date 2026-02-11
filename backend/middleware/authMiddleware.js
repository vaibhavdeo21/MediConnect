const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // 1. Get Token from Header
  const tokenHeader = req.header('Authorization');

  // 2. Check if no token
  if (!tokenHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Clean Token (Remove "Bearer " prefix if it exists)
    const token = tokenHeader.startsWith("Bearer ") 
      ? tokenHeader.slice(7, tokenHeader.length).trim() 
      : tokenHeader.trim();

    // 4. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Add User from payload to Request object
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};