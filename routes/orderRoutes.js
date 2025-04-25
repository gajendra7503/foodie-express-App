const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/place-order', orderController.placeOrder);

router.get('/order-history/:userId', orderController.getUserOrders);

router.get('/admin/all-orders', orderController.getAllOrders);

router.put('/update-status/:orderId', orderController.updateOrderStatus);


module.exports = router;
