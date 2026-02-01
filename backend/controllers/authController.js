const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registerUser = async (req, res) => {
  const { email, password, role, fullName, specialization, consultationFee } = req.body;
  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, role]
    );
    const userId = newUser.rows[0].id;

    // Create Role Profile
    if (role === 'doctor') {
      await pool.query('INSERT INTO doctors (user_id, full_name, specialization, consultation_fee) VALUES ($1, $2, $3, $4)', [userId, fullName, specialization, consultationFee]);
    } else {
      await pool.query('INSERT INTO patients (user_id, full_name) VALUES ($1, $2)', [userId, fullName]);
    }

    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: userId, email, role, fullName } });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send("Server Error");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`\n--- LOGIN ATTEMPT ---`);
    console.log(`Email provided: ${email}`);
    
    // 1. Find User
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      console.log("❌ User not found in database.");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 2. Debugging Password
    const storedHash = user.rows[0].password_hash;
    console.log(`Stored Hash in DB: ${storedHash}`);
    
    // 3. Compare
    const validPassword = await bcrypt.compare(password, storedHash);
    console.log(`Password Match Result: ${validPassword}`);

    if (!validPassword) {
      console.log("❌ Password did not match hash.");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    console.log("✅ Login Successful!");
    
    // 4. Get Details
    let userDetails;
    if (user.rows[0].role === 'doctor') {
      userDetails = await pool.query('SELECT full_name FROM doctors WHERE user_id = $1', [user.rows[0].id]);
    } else {
      userDetails = await pool.query('SELECT full_name FROM patients WHERE user_id = $1', [user.rows[0].id]);
    }
    const fullName = userDetails.rows.length > 0 ? userDetails.rows[0].full_name : "User";
    
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.rows[0].id, email, role: user.rows[0].role, fullName } });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { registerUser, loginUser };