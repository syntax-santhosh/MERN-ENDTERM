const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/product.controller');

// Product routes
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;
