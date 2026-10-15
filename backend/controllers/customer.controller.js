const bcrypt = require('bcryptjs');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new customer
 * @route   POST /customers/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validation: check for missing fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory (fullName, email, password, phone)',
      });
    }

    // 2. Validation: password length must be at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    // 3. Validation: check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // 4. Hash password with bcrypt (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create and save customer in MongoDB
    const customer = await Customer.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    // 6. Return response (never include password)
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message,
    });
  }
};

/**
 * @desc    Authenticate customer and set JWT cookie
 * @route   POST /customers/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      // Do not reveal whether email or password was incorrect
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare passwords using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, customer.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT and store it in HttpOnly cookie
    generateToken(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message,
    });
  }
};

/**
 * @desc    Get currently logged in customer profile
 * @route   GET /customers/me
 * @access  Private (Protected route)
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware (excluding password)
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile: ' + error.message,
    });
  }
};

/**
 * @desc    Log out customer by clearing authentication cookie
 * @route   POST /customers/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Clear the HttpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during logout: ' + error.message,
    });
  }
};

/**
 * @desc    Change password (Bonus Challenge)
 * @route   PATCH /customers/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both old password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters',
      });
    }

    // Find customer including password field to verify old password
    const customer = await Customer.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect old password',
      });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error changing password: ' + error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  changePassword,
};
