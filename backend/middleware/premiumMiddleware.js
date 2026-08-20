const pool = require('../db');

const isPremium = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await pool.query("SELECT is_premium, subscription_end_date FROM users WHERE id = $1", [userId]);

    if (user.rows.length > 0) {
      const u = user.rows[0];
      if (u.is_premium) {
        // Check expiry
        if (u.subscription_end_date && new Date(u.subscription_end_date) < new Date()) {
          // Expired
          await pool.query("UPDATE users SET is_premium = FALSE WHERE id = $1", [userId]);
          res.status(403).json({ error: "Premium subscription expired." });
        } else {
          next();
        }
      } else {
        res.status(403).json({ error: "Premium subscription required for this feature." });
      }
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const isPremiumOrLimited = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await pool.query("SELECT is_premium, subscription_end_date FROM users WHERE id = $1", [userId]);

    if (user.rows.length > 0) {
      let isPrem = user.rows[0].is_premium;
      if (isPrem && user.rows[0].subscription_end_date && new Date(user.rows[0].subscription_end_date) < new Date()) {
        await pool.query("UPDATE users SET is_premium = FALSE WHERE id = $1", [userId]);
        isPrem = false;
      }
      req.isPremium = isPrem;
    } else {
      req.isPremium = false;
    }
    next();
  } catch (err) {
    req.isPremium = false;
    next();
  }
};

module.exports = { isPremium, isPremiumOrLimited };