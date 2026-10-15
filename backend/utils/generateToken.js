const jwt = require('jsonwebtoken');

/**
 * Generates JWT and sets an HttpOnly cookie on the response
 * @param {Object} res - Express response object
 * @param {string} customerId - MongoDB _id of customer
 */
const generateToken = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  // Set JWT inside HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (mitigates XSS)
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS), false in development
    sameSite: 'lax', // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
