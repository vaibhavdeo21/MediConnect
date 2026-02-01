const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

const googleLogin = async (req, res) => {
  const { token } = req.body; // Token from Frontend

  try {
    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    // 2. Check if user exists
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      // 3. If new, create user (Default to Patient)
      const newUser = await pool.query(
        'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING *',
        [email, 'patient']
      );
      
      const userId = newUser.rows[0].id;
      
      // Create Patient Profile
      await pool.query(
        'INSERT INTO patients (user_id, full_name) VALUES ($1, $2)',
        [userId, name]
      );
      
      user = { rows: [newUser.rows[0]] };
    }

    // 4. Get Role and Name for our App Token
    const dbUser = user.rows[0];
    let fullName = name;
    
    // Fetch real name from our DB if they existed before
    if (dbUser.role === 'doctor') {
      const doc = await pool.query('SELECT full_name FROM doctors WHERE user_id = $1', [dbUser.id]);
      if (doc.rows.length > 0) fullName = doc.rows[0].full_name;
    } else {
      const pat = await pool.query('SELECT full_name FROM patients WHERE user_id = $1', [dbUser.id]);
      if (pat.rows.length > 0) fullName = pat.rows[0].full_name;
    }

    // 5. Generate Our App Token
    const appToken = jwt.sign(
      { id: dbUser.id, role: dbUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ token: appToken, user: { id: dbUser.id, email, role: dbUser.role, fullName } });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find User
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const dbUser = user.rows[0];

    // 2. CHECK: Is this a Google Account? (Password will be NULL)
    if (!dbUser.password_hash) {
      return res.status(403).json({ 
        message: "You created this account using Google. Please use the Google button." 
      });
    }

    // 3. Normal Password Check
    const validPassword = await bcrypt.compare(password, dbUser.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 4. Get User Details (Existing Code...)
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

module.exports = { registerUser, loginUser, googleLogin };