const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');


// Signup route
router.post('/signup', (req, res) => {
    console.log(req.body);
    const { name, email, password, phone, address } = req.body;
    const sql = 'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, password, phone, address], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error signing up');
      }
      res.send({ message: 'User registered successfully' });
    });
  });
  
// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("request body", req.body);
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error logging in');
    }
    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      res.send({ token });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  });
});
router.get('/user/:id', authController.getUserById);

router.post('/upload-profile-photo', authController.upload, authController.uploadProfilePhoto);

router.post('/reset-password', authController.resetPassword); 

module.exports = router;
