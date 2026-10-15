const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * @desc    Add a product to the authenticated user's wishlist
 * @route   POST /wishlist/:productId
 * @access  Private (Protected)
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Check for duplicate
    const user = await Customer.findById(req.user._id);
    const alreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // 4. Add product reference and save
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist: ' + error.message,
    });
  }
};

/**
 * @desc    Get the authenticated user's wishlist with populated product data
 * @route   GET /wishlist
 * @access  Private (Protected)
 */
const getWishlist = async (req, res) => {
  try {
    // Find user and populate wishlist references with Product data
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description',
    });

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist: ' + error.message,
    });
  }
};

/**
 * @desc    Remove a product from the authenticated user's wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Private (Protected)
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Check if product is in the user's wishlist
    const user = await Customer.findById(req.user._id);
    const productIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // 3. Remove and save
    user.wishlist.splice(productIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist: ' + error.message,
    });
  }
};

/**
 * @desc    Toggle a product in/out of the authenticated user's wishlist (Bonus)
 * @route   PATCH /wishlist/:productId/toggle
 * @access  Private (Protected)
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Toggle
    const user = await Customer.findById(req.user._id);
    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (existingIndex > -1) {
      // Already saved → remove
      user.wishlist.splice(existingIndex, 1);
      saved = false;
    } else {
      // Not saved → add
      user.wishlist.push(productId);
      saved = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved
        ? 'Product added to wishlist'
        : 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist: ' + error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
