const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Helper to populate cart product details uniformly
const populateUserCart = async (userId) => {
  const user = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name price category image stock description',
  });
  
  // Clean up any items where product might have been removed from database
  if (user && user.cart) {
    const validCart = user.cart.filter((item) => item.product !== null);
    if (validCart.length !== user.cart.length) {
      user.cart = validCart;
      await user.save();
    }
    return user.cart;
  }
  return [];
};

/**
 * @desc    Add product to cart (or increment quantity if already present)
 * @route   POST /cart/:productId
 * @access  Private (Protected)
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Check if product is out of stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock',
      });
    }

    // 4. Find user and check if product already in cart
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Existing item: increment quantity by 1
      const currentQuantity = user.cart[existingItemIndex].quantity;
      if (currentQuantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. Available stock is ${product.stock}.`,
        });
      }
      user.cart[existingItemIndex].quantity = currentQuantity + 1;
    } else {
      // New item: add with quantity = 1
      user.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    // 5. Save user
    await user.save();

    // 6. Return updated populated cart
    const updatedCart = await populateUserCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to cart: ' + error.message,
    });
  }
};

/**
 * @desc    Get current user's cart with populated product information
 * @route   GET /cart
 * @access  Private (Protected)
 */
const getCart = async (req, res) => {
  try {
    const cart = await populateUserCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart: ' + error.message,
    });
  }
};

/**
 * @desc    Update product quantity in cart
 * @route   PATCH /cart/:productId
 * @access  Private (Protected)
 */
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Validate quantity value
    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    const parsedQuantity = Math.floor(quantity);

    if (parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // 3. Find Product in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 4. Validate quantity against product stock
    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`,
      });
    }

    // 5. Find user and item in cart
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 6. Update quantity and save
    user.cart[itemIndex].quantity = parsedQuantity;
    await user.save();

    // 7. Return updated populated cart
    const updatedCart = await populateUserCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart: ' + error.message,
    });
  }
};

/**
 * @desc    Remove product from user's cart
 * @route   DELETE /cart/:productId
 * @access  Private (Protected)
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Find user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 3. Check if product is in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 4. Remove item and save
    user.cart.splice(itemIndex, 1);
    await user.save();

    // 5. Return updated populated cart
    const updatedCart = await populateUserCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from cart: ' + error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
};
