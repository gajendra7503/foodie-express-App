const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/restaurants/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.get('/', restaurantController.getRestaurants);
router.get('/:id/menu', restaurantController.getMenuByRestaurant);
router.get('/:id', restaurantController.getRestaurantById); // Get single restaurant by ID

// Add restaurant with image upload
router.post('/add', upload.single('image'), restaurantController.addRestaurant);

// Update restaurant with optional image upload
router.put('/edit/:id', upload.single('image'), restaurantController.updateRestaurant);

module.exports = router;
