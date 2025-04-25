const db = require('../config/db');

exports.addMenuItem = async (req, res) => {
  try {
    const { restaurant_id, name, price, description } = req.body;
    const imageUrl = req.file ? `http://localhost:5000/uploads/menu_items/${req.file.filename}` : '';

    await db.query(
      'INSERT INTO menu_items (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [restaurant_id, name, price, description, imageUrl]
    );

    res.status(201).json({ message: 'Menu item added successfully' });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ message: 'Error adding menu item' });
  }
};

exports.getMenuItems = (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.updateMenuItem = (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  const imageUrl = req.file ? `http://localhost:5000/uploads/menu_items/${req.file.filename}` : '';

  const query = imageUrl
    ? 'UPDATE menu_items SET name = ?, price = ?, description = ?, image_url = ? WHERE id = ?'
    : 'UPDATE menu_items SET name = ?, price = ?, description = ? WHERE id = ?';

  const values = imageUrl ? [name, price, description, imageUrl, id] : [name, price, description, id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Menu item updated successfully' });
  });
};

exports.deleteMenuItem = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM menu_items WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Menu item deleted successfully' });
  });
};
