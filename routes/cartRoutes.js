const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/add-to-cart', (req, res) => {
  const { user_id, menu_item_id, quantity } = req.body;

  // Check if item already in cart
  db.query(
    'SELECT * FROM cart WHERE user_id = ? AND menu_item_id = ?',
    [user_id, menu_item_id],
    (err, results) => {
      if (err) return res.status(500).send(err);

      if (results.length > 0) {
        // If already present, update quantity
        db.query(
          'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND menu_item_id = ?',
          [quantity, user_id, menu_item_id],
          (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Item quantity updated in cart' });
          }
        );
      } else {
        // If not present, insert new
        db.query(
          'INSERT INTO cart (user_id, menu_item_id, quantity) VALUES (?, ?, ?)',
          [user_id, menu_item_id, quantity],
          (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Item added to cart' });
          }
        );
      }
    }
  );
});

// Get cart items for a user
router.get('/user-cart/:userId', (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT c.id AS cart_id, c.quantity, m.id AS menu_item_id, m.name, m.price, m.image_url 
     FROM cart c 
     JOIN menu_items m ON c.menu_item_id = m.id 
     WHERE c.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

  

module.exports = router;
