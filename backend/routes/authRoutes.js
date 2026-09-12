const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  listUsers,
  createOwnerAccount,
  updateUserStatus,
  syncCustomerCart,
  resetPassword,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
});

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, listUsers);
router.post('/users/owner', protect, adminOnly, createOwnerAccount);
router.patch('/users/:id/active', protect, adminOnly, updateUserStatus);
router.put('/cart', protect, syncCustomerCart);

module.exports = router;
