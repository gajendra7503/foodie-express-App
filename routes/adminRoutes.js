const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer config for menu-items images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const upload = multer({ storage });


// Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("request body", req.body);
  const sql = 'SELECT * FROM admin WHERE email = ? AND password = ?';

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (result.length > 0) {
      return res.json({
        success: true,
        token: 'dummy-admin-token',
        message: 'Login successful',
      });
    } else {
      return res.json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  });
});

// Add Restaurant
router.post('/api/restaurants/add', upload.single('image'), async (req, res) => {
  try {
    const { name, location, rating } = req.body;
    const image_url = req.file ? `http://localhost:5000/${req.file.path}` : null;

    await db.query(
      'INSERT INTO restaurants (name, location, image_url, rating) VALUES (?, ?, ?, ?)',
      [name, location, image_url, rating]
    );

    res.json({ message: 'Restaurant added successfully' });
  } catch (err) {
    console.error('Error adding restaurant:', err);
    res.status(500).json({ message: 'Error adding restaurant' });
  }
});


// Get all restaurants (for dropdown)
router.get('/restaurants', async (req, res) => {
  try {
    const sql = 'SELECT id, name FROM restaurants';
    const [result] = await db.promise().query(sql);  // 👈 Await ke saath query chalani hai
    res.json(result);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Error fetching restaurants' });
  }
});

// Edit Restaurant
router.put('/restaurants/:id', (req, res) => {
  const { id } = req.params;
  const { name, location, image_url, rating } = req.body;
  const sql = 'UPDATE restaurants SET name=?, location=?, image_url=?, rating=? WHERE id=?';
  db.query(sql, [name, location, image_url, rating, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating restaurant' });
    res.json({ message: 'Restaurant updated successfully' });
  });
});

// Add Menu Item with image upload
router.post('/menu-items', upload.single('image'), (req, res) => {
  const { restaurant_id, name, price, description } = req.body;
  const image_url = req.file ? `http://localhost:5000/uploads/menu-items/${req.file.filename}` : '';
  const sql = 'INSERT INTO menu_items (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [restaurant_id, name, price, description, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error adding menu item' });
    res.json({ message: 'Menu item added successfully', id: result.insertId });
  });
});

// Get single menu item by id
router.get('/menu-items/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM menu_items WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching menu item' });
    if (result.length === 0) return res.status(404).json({ error: 'Menu item not found' });
    res.json(result[0]);
  });
});

// Edit Menu Item with image upload
router.put('/menu-items/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { restaurant_id, name, price, description } = req.body;
  let image_url = '';

  if (req.file) {
    image_url = `http://localhost:5000/uploads/menu-items/${req.file.filename}`;
  }

  const sql = image_url
    ? 'UPDATE menu_items SET restaurant_id=?, name=?, price=?, description=?, image_url=? WHERE id=?'
    : 'UPDATE menu_items SET restaurant_id=?, name=?, price=?, description=? WHERE id=?';

  const params = image_url
    ? [restaurant_id, name, price, description, image_url, id]
    : [restaurant_id, name, price, description, id];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating menu item' });
    res.json({ message: 'Menu item updated successfully' });
  });
});

// Delete restaurant
router.delete('/restaurants/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM restaurants WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error deleting restaurant' });
    res.json({ message: 'Restaurant deleted successfully' });
  });
});

// Delete menu item
router.delete('/menu-items/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM menu_items WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error deleting menu item' });
    res.json({ message: 'Menu item deleted successfully' });
  });
});

module.exports = router;
