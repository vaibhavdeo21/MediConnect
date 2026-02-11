const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Create Transporter (The Postman)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password, NOT your real password
  },
});

// 2. Generic Send Function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"MediConnect" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Email Error:", error);
    // We don't throw error here to prevent crashing the main app flow
  }
};

module.exports = sendEmail;