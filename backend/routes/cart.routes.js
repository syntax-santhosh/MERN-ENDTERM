const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');

// All cart endpoints require authentication
router.use(protect);

router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
