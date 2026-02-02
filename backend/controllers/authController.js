const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 1. REGISTER USER ---
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
      await pool.query(
        'INSERT INTO doctors (user_id, full_name, specialization, consultation_fee) VALUES ($1, $2, $3, $4)', 
        [userId, fullName, specialization, consultationFee]
      );
    } else {
      await pool.query(
        'INSERT INTO patients (user_id, full_name) VALUES ($1, $2)', 
        [userId, fullName]
      );
    }

    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: userId, email, role, fullName } });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. LOGIN USER ---
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

// --- 3. GOOGLE LOGIN ---
const googleLogin = async (req, res) => {
  const { token, role } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      const selectedRole = role || 'patient';
      
      const newUser = await pool.query(
        'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING *',
        [email, selectedRole]
      );
      
      const userId = newUser.rows[0].id;
      
      if (selectedRole === 'doctor') {
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

// --- 4. FORGOT PASSWORD (SEND OTP) ---
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Trim email to prevent space errors
    const cleanEmail = email ? email.trim() : "";
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (Expires in 10 mins)
    await pool.query(
      "UPDATE users SET reset_otp = $1, reset_otp_expiry = NOW() + INTERVAL '10 minutes' WHERE email = $2",
      [otp, cleanEmail]
    );

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: 'MediConnect Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 5. VERIFY OTP ---
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const cleanEmail = email ? email.trim() : "";
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    
    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const dbUser = user.rows[0];

    // Check match and expiry
    if (dbUser.reset_otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    if (new Date() > new Date(dbUser.reset_otp_expiry)) {
      return res.status(400).json({ message: "OTP Expired" });
    }

    res.json({ message: "OTP Verified" });

  } catch (err) {
    console.error("Verify OTP Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 6. RESET PASSWORD ---
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const cleanEmail = email ? email.trim() : "";
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    const dbUser = user.rows[0];

    // Verify OTP one last time for security
    if (dbUser.reset_otp !== otp || new Date() > new Date(dbUser.reset_otp_expiry)) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update Password & Clear OTP
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = $2",
      [passwordHash, cleanEmail]
    );

    res.json({ message: "Password Reset Successful" });

  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { registerUser, loginUser, googleLogin, forgotPassword, verifyOtp, resetPassword };