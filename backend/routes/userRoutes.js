const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, getDashboardStats } = require('../controllers/userController');

// Route 1: Get Profile (Protected)
router.get('/profile', authorize, getUserProfile);

router.get('/dashboard-stats', authorize, getDashboardStats);


router.get('/referral-data', authorize, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT referral_code, referral_count FROM users WHERE id = $1",
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put('/profile', authorize, updateUserProfile);

module.exports = router;