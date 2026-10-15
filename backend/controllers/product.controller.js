const mongoose = require('mongoose');
const Product = require('../models/product.model');

// @desc    Create a new product
// @route   POST /products
// @access  Public (for Lab 03)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Validation: Check for missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    // 2. Validation: Check price is greater than 0
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      });
    }

    // 3. Validation: Check stock is not negative
    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    // 4. Create and save product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numericStock,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
      // Spread product fields for flexible testing assertion
      ...savedProduct.toObject(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message,
    });
  }
};

// @desc    Get all products with search, category filtering & sorting
// @route   GET /products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    // 1. Search filter: case-insensitive match on product name
    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // 2. Category filter: match specified category
    if (
      category &&
      category.trim() !== '' &&
      category.toLowerCase() !== 'all' &&
      category.toLowerCase() !== 'all categories'
    ) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // 3. Sorting (Bonus Challenge)
    let sortOptions = { createdAt: -1 }; // default: latest products first
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    // 4. Query products
    const products = await Product.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};

// @desc    Get single product by MongoDB ID
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Find product by ID
    const product = await Product.findById(id);

    // 3. Handle product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 4. Return product
    return res.status(200).json({
      success: true,
      product,
      ...product.toObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
