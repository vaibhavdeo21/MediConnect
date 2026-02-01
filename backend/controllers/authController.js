const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
  const { email, password, role, fullName, specialization, consultationFee } = req.body;
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, role]
    );
    const userId = newUser.rows[0].id;

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
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(401).json({ message: "Invalid Credentials" });

    const dbUser = user.rows[0];

    // Check if Google User (No Password)
    if (!dbUser.password_hash) {
      return res.status(403).json({ message: "Account created with Google. Please use Google Sign In." });
    }

    const validPassword = await bcrypt.compare(password, dbUser.password_hash);
    if (!validPassword) return res.status(401).json({ message: "Invalid Credentials" });

    let userDetails;
    if (dbUser.role === 'doctor') {
      userDetails = await pool.query('SELECT full_name FROM doctors WHERE user_id = $1', [dbUser.id]);
    } else {
      userDetails = await pool.query('SELECT full_name FROM patients WHERE user_id = $1', [dbUser.id]);
    }
    const fullName = userDetails.rows.length > 0 ? userDetails.rows[0].full_name : "User";
    
    const token = jwt.sign({ id: dbUser.id, role: dbUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: dbUser.id, email, role: dbUser.role, fullName } });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// FIX: Google Login with Role Handling
const googleLogin = async (req, res) => {
  const { token, role } = req.body; // <--- Role comes from Frontend
  console.log("Backend Google Login. Role:", role);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      // NEW USER LOGIC
      const selectedRole = role || 'patient'; // Use provided role
      
      const newUser = await pool.query(
        'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING *',
        [email, selectedRole]
      );
      
      const userId = newUser.rows[0].id;
      
      if (selectedRole === 'doctor') {
        // Create Doctor with DEFAULT values
        await pool.query(
          'INSERT INTO doctors (user_id, full_name, specialization, consultation_fee) VALUES ($1, $2, $3, $4)',
          [userId, name, 'General Physician', 0]
        );
      } else {
        await pool.query(
          'INSERT INTO patients (user_id, full_name) VALUES ($1, $2)',
          [userId, name]
        );
      }
      user = { rows: [newUser.rows[0]] };
    }

    const dbUser = user.rows[0];
    let fullName = name;
    
    if (dbUser.role === 'doctor') {
      const doc = await pool.query('SELECT full_name FROM doctors WHERE user_id = $1', [dbUser.id]);
      if (doc.rows.length > 0) fullName = doc.rows[0].full_name;
    } else {
      const pat = await pool.query('SELECT full_name FROM patients WHERE user_id = $1', [dbUser.id]);
      if (pat.rows.length > 0) fullName = pat.rows[0].full_name;
    }

    const appToken = jwt.sign({ id: dbUser.id, role: dbUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: appToken, user: { id: dbUser.id, email, role: dbUser.role, fullName } });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};

module.exports = { registerUser, loginUser, googleLogin };