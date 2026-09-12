const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  toggleFeatured,
} = require('../controllers/productController');
const { protect, ownerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Owner/Admin routes
router.post('/', protect, ownerOrAdmin, upload.array('images', 6), createProduct);
router.put('/:id', protect, ownerOrAdmin, upload.array('images', 6), updateProduct);
router.delete('/:id', protect, ownerOrAdmin, deleteProduct);
router.patch('/:id/toggle', protect, ownerOrAdmin, toggleStock);
router.patch('/:id/featured', protect, ownerOrAdmin, toggleFeatured);

module.exports = router;
