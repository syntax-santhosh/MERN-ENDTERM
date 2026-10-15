const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

/**
 * Authentication Middleware:
 * Protects routes by verifying the JWT stored in the HttpOnly cookie.
 */
const protect = async (req, res, next) => {
  try {
    // Read JWT from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find customer in database (exclude password field)
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, customer not found',
      });
    }

    // Attach customer object to req.user
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized, token failed or expired',
    });
  }
};

module.exports = { protect };
