const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
  getOrdersByCustomer,
} = require('../controllers/orderController');
const { protect, ownerOrAdmin } = require('../middleware/authMiddleware');

 
router.post('/', createOrder);

 
router.get('/my-orders', protect, getMyOrders);

 
router.get('/', protect, ownerOrAdmin, getOrders);
router.get('/stats', protect, ownerOrAdmin, getOrderStats);
router.get('/customer/:customerName', protect, ownerOrAdmin, getOrdersByCustomer);
router.patch('/:id/status', protect, ownerOrAdmin, updateOrderStatus);
router.delete('/:id', protect, ownerOrAdmin, deleteOrder);

module.exports = router;
