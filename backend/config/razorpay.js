const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart1234';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_shopkart1234';

let razorpay = null;

try {
  razorpay = new Razorpay({
    key_id,
    key_secret,
  });
} catch (error) {
  console.warn('⚠️ Razorpay client initialization notice:', error.message);
}

module.exports = razorpay;
