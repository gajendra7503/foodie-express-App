const db = require('../config/db');

exports.addReview = (req, res) => {
  const { user_id, restaurant_id, rating, comment } = req.body;
  console.log("Received data: ", req.body);
  db.query(
    'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
    [user_id, restaurant_id, rating, comment],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Review added successfully!' });
    }
  );
};



exports.getReviewsByRestaurant = (req, res) => {
  const { restaurantId } = req.params;
  db.query(
    `SELECT r.*, u.name AS userName 
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.restaurant_id = ? 
     ORDER BY r.id DESC`,
    [restaurantId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
};
