const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Multer setup for menu items
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/menu_items/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.get('/', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching menu items' });
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM menu_items WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching menu item' });
    if (results.length === 0) return res.status(404).json({ message: 'Menu item not found' });

    const menuItem = results[0];
    // menuItem.image_url = `http://localhost:5000/uploads/menu_items/${menuItem.image_url}`;
    res.json(menuItem);
  });
});

router.post('/add', upload.single('image'), menuItemController.addMenuItem);
router.put('/:id', upload.single('image'), menuItemController.updateMenuItem);
router.delete('/:id', menuItemController.deleteMenuItem);


module.exports = router;
