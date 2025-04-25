const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profilePics/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

exports.upload = upload.single('profilePic');

exports.uploadProfilePhoto = (req, res) => {
  const userId = req.body.userId;
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `http://localhost:5000/uploads/profilePics/${req.file.filename}`;

  // Save image URL in DB
  db.query('UPDATE users SET profilePic = ? WHERE id = ?', [imageUrl, userId], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Photo uploaded successfully', imageUrl });
  });
};
exports.register = (req, res) => {
  const { name, email, password, address } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  db.query(
    'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, phone, address],
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).json({ message: 'User registered' });
    }
  );
};
exports.login = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results.length) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log('User object from DB:', user);  // ✅ console check karna zarur
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  });
};

exports.resetPassword = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Hash new password
  // const hashedPassword = bcrypt.hashSync(password, 8);

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    db.query('UPDATE users SET password = ? WHERE email = ?', [password, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: 'Failed to update password', error: updateErr });

      res.json({ message: 'Password reset successfully' });
    });
  });
};

// get user detail by token
exports.getUserById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, name, email, address, phone, profilePic FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results.length) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
};

  

