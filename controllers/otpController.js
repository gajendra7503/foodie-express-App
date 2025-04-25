const db = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

// Send OTP Email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Foodie App',
    text: `Your One-Time Password is: ${otp}. It will expire in 10 minutes.`,
  };
  return transporter.sendMail(mailOptions);
};

// Send OTP to User
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await db.promise().query(
      'REPLACE INTO otp_store (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const [rows] = await db.promise().query('SELECT * FROM otp_store WHERE email = ?', [email]);
    if (!rows.length) return res.status(404).json({ message: 'No OTP found for this email' });

    const record = rows[0];
    const now = new Date();

    if (now > record.expires_at) {
      return res.status(410).json({ message: 'OTP expired' });
    }

    if (record.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};
