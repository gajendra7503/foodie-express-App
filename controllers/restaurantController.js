const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Upload setup for restaurant images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/restaurants/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage }).single('image');

exports.uploadRestaurantImage = upload;

exports.addRestaurant = async (req, res) => {
  try {
    const { name, location, rating } = req.body;
    const imageUrl = req.file ? `http://localhost:5000/uploads/restaurants/${req.file.filename}` : '';

    await db.promise().query(
      'INSERT INTO restaurants (name, location, image_url, rating) VALUES (?, ?, ?, ?)',
      [name, location, imageUrl, rating]
    );

    res.status(201).json({ message: 'Restaurant added successfully' });
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).json({ message: 'Error adding restaurant' });
  }
};

exports.getRestaurants = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM restaurants');
    res.json(results);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).send(err);
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.promise().query('SELECT * FROM menu_items WHERE restaurant_id = ?', [id]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).send(err);
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query('SELECT * FROM restaurants WHERE id = ?', [id]);
    res.json(result[0]);
  } catch (err) {
    console.error('Error fetching restaurant by ID:', err);
    res.status(500).json({ error: err });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, rating } = req.body;
    const image_url = req.file ? `http://localhost:5000/uploads/restaurants/${req.file.filename}` : '';

    const query = image_url
      ? 'UPDATE restaurants SET name=?, location=?, rating=?, image_url=? WHERE id=?'
      : 'UPDATE restaurants SET name=?, location=?, rating=? WHERE id=?';

    const values = image_url
      ? [name, location, rating, image_url, id]
      : [name, location, rating, id];

    await db.promise().query(query, values);
    res.json({ message: 'Restaurant updated successfully!' });
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ error: err });
  }
};
