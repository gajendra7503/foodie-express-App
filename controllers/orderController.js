const db = require('../config/db');

exports.placeOrder = (req, res) => {
  const { userId, address, contact } = req.body;

  db.query(
    `SELECT c.menu_item_id, c.quantity, m.price 
     FROM cart c JOIN menu_items m ON c.menu_item_id = m.id 
     WHERE c.user_id = ?`,
    [userId],
    (err, cartItems) => {
      if (err) return res.status(500).send(err);

      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      db.query(
        'INSERT INTO orders (user_id, total_amount, address, contact) VALUES (?, ?, ?, ?)',
        [userId, totalAmount, address, contact],
        (err, orderResult) => {
          if (err) return res.status(500).send(err);

          const orderId = orderResult.insertId;

          const orderItemsData = cartItems.map((item) => [
            orderId,
            item.menu_item_id,
            item.quantity,
            item.price,
          ]);

          db.query(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?',
            [orderItemsData],
            (err) => {
              if (err) return res.status(500).send(err);

              db.query(
                'DELETE FROM cart WHERE user_id = ?',
                [userId],
                (err) => {
                  if (err) return res.status(500).send(err);
                  res.json({ message: 'Order placed successfully!' });
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.getUserOrders = (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT o.id AS orderId, o.total_amount, o.status, o.created_at, 
            oi.menu_item_id, oi.quantity, oi.price, m.name AS menu_item_name
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN menu_items m ON oi.menu_item_id = m.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).send(err);

      const groupedOrders = {};
      results.forEach((row) => {
        if (!groupedOrders[row.orderId]) {
          groupedOrders[row.orderId] = {
            orderId: row.orderId,
            totalAmount: row.total_amount,
            status: row.status,
            createdAt: row.created_at,
            items: [],
          };
        }
        groupedOrders[row.orderId].items.push({
          name: row.menu_item_name,
          quantity: row.quantity,
          price: row.price,
        });
      });

      res.json(Object.values(groupedOrders));
    }
  );
};

exports.getAllOrders = (req, res) => {
  db.query(
    `SELECT o.id AS orderId, o.user_id, o.total_amount, o.status, o.created_at, 
            oi.menu_item_id, oi.quantity, oi.price, m.name AS menu_item_name
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN menu_items m ON oi.menu_item_id = m.id
     ORDER BY o.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).send(err);

      const groupedOrders = {};
      results.forEach((row) => {
        if (!groupedOrders[row.orderId]) {
          groupedOrders[row.orderId] = {
            orderId: row.orderId,
            userId: row.user_id,
            totalAmount: row.total_amount,
            status: row.status,
            createdAt: row.created_at,
            items: [],
          };
        }
        groupedOrders[row.orderId].items.push({
          name: row.menu_item_name,
          quantity: row.quantity,
          price: row.price,
        });
      });

      res.json(Object.values(groupedOrders));
    }
  );
};

exports.updateOrderStatus = (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  db.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Order status updated successfully!' });
    }
  );
};


