const pool = require('../db');

const isPremium = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await pool.query("SELECT is_premium FROM users WHERE id = $1", [userId]);

    if (user.rows.length > 0 && user.rows[0].is_premium) {
      next();
    } else {
      res.status(403).json({ error: "Premium subscription required for this feature." });
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

module.exports = isPremium;