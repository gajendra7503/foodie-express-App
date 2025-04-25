const db = require('../config/db');

exports.adminLogin = (req, res) => {
  const { email, password } = req.body;
  console.log("request body", req.body);
  db.query(
    'SELECT * FROM admin WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (results.length > 0) {
        // Success
        res.status(200).json({ message: 'Login successful', adminToken: 'adminToken' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  );
};
