const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
require('dotenv').config();

const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const client = new OAuth2Client(googleClientId);

// --- 1. REGISTER USER ---
const registerUser = async (req, res) => {
  const { email, password, role, fullName, specialization, consultationFee, referralCode } = req.body;
  try {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: "User already exists with this email" });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Handle Referral Logic
    let referredBy = null;
    if (referralCode) {
      const referrer = await pool.query("SELECT referral_code FROM users WHERE referral_code = $1", [referralCode.trim()]);
      if (referrer.rows.length > 0) {
        referredBy = referralCode.trim();
        await pool.query("UPDATE users SET referral_count = referral_count + 1 WHERE referral_code = $1", [referredBy]);
      }
    }

    const newReferralCode = 'MC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const userRole = role || 'patient';

    // 4. Insert into 'users' table
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role, referral_code, referred_by, is_premium) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *',
      [cleanEmail, passwordHash, userRole, newReferralCode, referredBy]
    );
    
    const userId = newUser.rows[0].id;
    const nameToSave = fullName || cleanEmail.split('@')[0];

    // 5. Insert into Role-Specific Tables
    if (userRole === 'doctor') {
      await pool.query(
        'INSERT INTO doctors (user_id, full_name, specialization, consultation_fee) VALUES ($1, $2, $3, $4)', 
        [
          userId, 
          nameToSave, 
          specialization || 'General Physician', 
          consultationFee || 0
        ]
      );
    } else {
      await pool.query(
        'INSERT INTO patients (user_id, full_name) VALUES ($1, $2)', 
        [userId, nameToSave]
      );
    }

    const token = jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: userId, email: cleanEmail, role: userRole, fullName: nameToSave, is_premium: false } });

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Database Error: " + err.message }); 
  }
};

// --- 2. LOGIN USER ---
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await pool.query('SELECT id, email, password_hash, role, is_premium FROM users WHERE email = $1', [cleanEmail]);
    if (user.rows.length === 0) return res.status(401).json({ message: "Invalid Credentials" });

    const dbUser = user.rows[0];
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
    
    const fullName = userDetails.rows.length > 0 ? userDetails.rows[0].full_name : cleanEmail.split('@')[0];
    const token = jwt.sign({ id: dbUser.id, role: dbUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { id: dbUser.id, email: dbUser.email, role: dbUser.role, fullName, is_premium: dbUser.is_premium } });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// --- 3. GOOGLE LOGIN ---
const googleLogin = async (req, res) => {
  const { token, role } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: "Google ID Token is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || email.split('@')[0];

    let userResult = await pool.query('SELECT id, email, role, is_premium FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      const selectedRole = role || 'patient';
      const newReferralCode = 'MC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newUser = await pool.query(
        'INSERT INTO users (email, role, referral_code, is_premium) VALUES ($1, $2, $3, FALSE) RETURNING *',
        [email, selectedRole, newReferralCode]
      );
      userResult = { rows: [newUser.rows[0]] };
      
      const userId = newUser.rows[0].id;
      if (selectedRole === 'doctor') {
        await pool.query('INSERT INTO doctors (user_id, full_name, specialization, consultation_fee) VALUES ($1, $2, $3, $4)', [userId, name, 'General Physician', 0]);
      } else {
        await pool.query('INSERT INTO patients (user_id, full_name) VALUES ($1, $2)', [userId, name]);
      }
    }

    const dbUser = userResult.rows[0];
    let fullName = name;
    if (dbUser.role === 'doctor') {
      const doc = await pool.query('SELECT full_name FROM doctors WHERE user_id = $1', [dbUser.id]);
      if (doc.rows.length > 0) {
        fullName = doc.rows[0].full_name;
      } else {
        await pool.query('INSERT INTO doctors (user_id, full_name, specialization, consultation_fee) VALUES ($1, $2, $3, $4)', [dbUser.id, name, 'General Physician', 0]);
      }
    } else {
      const pat = await pool.query('SELECT full_name FROM patients WHERE user_id = $1', [dbUser.id]);
      if (pat.rows.length > 0) {
        fullName = pat.rows[0].full_name;
      } else {
        await pool.query('INSERT INTO patients (user_id, full_name) VALUES ($1, $2)', [dbUser.id, name]);
      }
    }

    const appToken = jwt.sign({ id: dbUser.id, role: dbUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: appToken, user: { id: dbUser.id, email: dbUser.email, role: dbUser.role, fullName, is_premium: dbUser.is_premium } });
  } catch (err) {
    console.error("Google Login Verification Error:", err.message);
    res.status(401).json({ message: "Google Auth Failed: " + err.message });
  }
};

// --- 4. FORGOT PASSWORD ---
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await pool.query(
      "UPDATE users SET reset_otp = $1, reset_otp_expiry = NOW() + INTERVAL '10 minutes' WHERE email = $2", 
      [otp, cleanEmail]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"MediConnect Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: 'Your Password Reset OTP',
      text: `Your MediConnect verification code is: ${otp}. This code expires in 10 minutes.`
    });

    res.json({ message: "OTP sent successfully." });
  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).json({ message: "Error sending email. Check server logs." });
  }
};

// --- 5. VERIFY OTP ---
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await pool.query(
      'SELECT reset_otp, reset_otp_expiry FROM users WHERE email = $1', 
      [cleanEmail]
    );

    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const dbUser = user.rows[0];
    if (dbUser.reset_otp !== otp || new Date() > new Date(dbUser.reset_otp_expiry)) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }
    res.json({ message: "OTP Verified" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// --- 6. RESET PASSWORD ---
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    const result = await pool.query(
      "UPDATE users SET password_hash = $1, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = $2 AND reset_otp = $3", 
      [passwordHash, cleanEmail, otp]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Reset failed. Session may have expired." });
    }

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { registerUser, loginUser, googleLogin, forgotPassword, verifyOtp, resetPassword };