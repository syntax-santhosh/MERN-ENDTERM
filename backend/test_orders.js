const mongoose = require('mongoose');
const crypto = require('crypto');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');
const Order = require('./models/order.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('./controllers/order.controller');

// Mock Express req/res
const mockReqRes = (user, params = {}, body = {}) => {
  const req = {
    user,
    params,
    body,
  };
  let responseData = null;
  let statusCode = 200;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    get statusCode() {
      return statusCode;
    },
    get data() {
      return responseData;
    },
  };

  return { req, res };
};

const runOrderTests = async () => {
  console.log('🧪 Starting Lab 06 Checkout, Razorpay & Orders Unit Tests...\n');

  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory test database');

    // 1. Create test user and another user (for security/ownership tests)
    const user = await Customer.create({
      fullName: 'Aarav Sharma',
      email: 'aarav@shopkart.com',
      password: 'password123',
      phone: '9876543210',
      cart: [],
    });

    const otherUser = await Customer.create({
      fullName: 'Sneha Patel',
      email: 'sneha@shopkart.com',
      password: 'password123',
      phone: '9876543211',
      cart: [],
    });

    // 2. Create products
    const product1 = await Product.create({
      name: 'Mechanical Gaming Keyboard',
      price: 2999,
      category: 'Electronics',
      stock: 5,
      image: 'https://example.com/keyboard.jpg',
      description: 'Tactile mechanical switches.',
    });

    const product2 = await Product.create({
      name: 'Wireless Ergonomic Mouse',
      price: 1499,
      category: 'Electronics',
      stock: 10,
      image: 'https://example.com/mouse.jpg',
      description: 'Precision wireless mouse.',
    });

    const validAddress = {
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      addressLine1: '22 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    };

    // --- Test 1: Empty cart rejection ---
    console.log('--- Test 1: Empty cart rejection (POST /orders/create-payment-order) ---');
    {
      const { req, res } = mockReqRes(user, {}, { shippingAddress: validAddress });
      await createPaymentOrder(req, res);
      console.log(`Status: ${res.statusCode} (Expected: 400), Message: ${res.data.message}`);
      if (res.statusCode === 400) {
        console.log('✅ Test 1 PASSED: Empty cart correctly rejected');
      } else {
        throw new Error('Test 1 FAILED');
      }
    }

    // Now populate user's cart: Keyboard x 2 (5998) + Mouse x 1 (1499) = 7497
    user.cart = [
      { product: product1._id, quantity: 2 },
      { product: product2._id, quantity: 1 },
    ];
    await user.save();

    // --- Test 2: Valid Create Payment Order ---
    console.log('\n--- Test 2: Create Payment Order (POST /orders/create-payment-order) ---');
    let testShopKartOrderId, testRazorpayOrderId;
    {
      // Send a fake totalAmount to test if backend ignores it!
      const { req, res } = mockReqRes(user, {}, { shippingAddress: validAddress, totalAmount: 1 });
      await createPaymentOrder(req, res);
      console.log(`Status: ${res.statusCode}, ShopKart Order ID: ${res.data.shopKartOrderId}`);
      console.log(`Amount in paise: ${res.data.amount} (Expected: 749700 paise for ₹7,497)`);
      console.log(`Razorpay Order ID: ${res.data.razorpayOrderId}`);

      if (res.statusCode === 200 && res.data.amount === 749700 && res.data.shopKartOrderId) {
        testShopKartOrderId = res.data.shopKartOrderId;
        testRazorpayOrderId = res.data.razorpayOrderId;
        console.log('✅ Test 2 PASSED: Payment order created with verified server calculation');
      } else {
        throw new Error('Test 2 FAILED');
      }
    }

    // --- Test 3: Cart preserved before payment verification ---
    console.log('\n--- Test 3: Cart preservation before payment verification ---');
    {
      const freshUser = await Customer.findById(user._id);
      console.log(`User cart item count: ${freshUser.cart.length} (Expected: 2)`);
      if (freshUser.cart.length === 2) {
        console.log('✅ Test 3 PASSED: Cart was NOT cleared before payment verification');
      } else {
        throw new Error('Test 3 FAILED: Cart cleared prematurely');
      }
    }

    // --- Test 4: Fake / Invalid Payment Signature rejection ---
    console.log('\n--- Test 4: Fake payment signature rejection ---');
    {
      const { req, res } = mockReqRes(user, {}, {
        shopKartOrderId: testShopKartOrderId,
        razorpay_order_id: testRazorpayOrderId,
        razorpay_payment_id: 'pay_fake123',
        razorpay_signature: 'fake_tampered_signature',
      });
      await verifyPayment(req, res);
      console.log(`Status: ${res.statusCode} (Expected: 400), Message: ${res.data.message}`);

      const pendingOrder = await Order.findById(testShopKartOrderId);
      console.log(`Order payment status: ${pendingOrder.paymentStatus} (Expected: FAILED)`);

      const freshUser = await Customer.findById(user._id);
      console.log(`User cart length: ${freshUser.cart.length} (Expected: 2, untouched)`);

      if (res.statusCode === 400 && pendingOrder.paymentStatus === 'FAILED' && freshUser.cart.length === 2) {
        console.log('✅ Test 4 PASSED: Invalid signature rejected, order not confirmed, cart preserved');
      } else {
        throw new Error('Test 4 FAILED');
      }
    }

    // --- Test 5: Valid Payment Verification & Cart Clearing ---
    console.log('\n--- Test 5: Valid payment verification and cart clearing ---');
    {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_shopkart1234';
      const paymentId = 'pay_real_test_456';
      const validSig = crypto
        .createHmac('sha256', secret)
        .update(`${testRazorpayOrderId}|${paymentId}`)
        .digest('hex');

      const { req, res } = mockReqRes(user, {}, {
        shopKartOrderId: testShopKartOrderId,
        razorpay_order_id: testRazorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
      });
      await verifyPayment(req, res);
      console.log(`Status: ${res.statusCode}, Message: ${res.data.message}`);

      const confirmedOrder = await Order.findById(testShopKartOrderId);
      console.log(`Order status: ${confirmedOrder.status} (Expected: PLACED)`);
      console.log(`Order paymentStatus: ${confirmedOrder.paymentStatus} (Expected: PAID)`);

      const freshUser = await Customer.findById(user._id);
      console.log(`User cart after payment: ${freshUser.cart.length} (Expected: 0)`);

      // Verify stock was decremented: product1 had 5, purchased 2 -> 3
      const updatedProduct1 = await Product.findById(product1._id);
      console.log(`Updated product stock: ${updatedProduct1.stock} (Expected: 3)`);

      if (
        res.statusCode === 200 &&
        confirmedOrder.status === 'PLACED' &&
        confirmedOrder.paymentStatus === 'PAID' &&
        freshUser.cart.length === 0 &&
        updatedProduct1.stock === 3
      ) {
        console.log('✅ Test 5 PASSED: Signature verified, order PAID, stock decremented, cart cleared');
      } else {
        throw new Error('Test 5 FAILED');
      }
    }

    // --- Test 6: Get Orders (GET /orders) ---
    console.log('\n--- Test 6: Get Orders for user (GET /orders) ---');
    {
      const { req, res } = mockReqRes(user);
      await getOrders(req, res);
      console.log(`Status: ${res.statusCode}, User orders count: ${res.data.orders.length}`);
      const firstOrder = res.data.orders[0];
      console.log(`First order items count: ${firstOrder.items.length}, Total: ₹${firstOrder.totalAmount}`);
      console.log(`Item snapshot name: ${firstOrder.items[0].name}, Price: ₹${firstOrder.items[0].price}`);

      if (res.statusCode === 200 && res.data.orders.length === 1 && firstOrder.items[0].name) {
        console.log('✅ Test 6 PASSED: Orders returned with historical snapshots');
      } else {
        throw new Error('Test 6 FAILED');
      }
    }

    // --- Test 7: Prevent another user from accessing order ---
    console.log("\n--- Test 7: Security check - Access another user's order ---");
    {
      const { req, res } = mockReqRes(otherUser, { id: testShopKartOrderId });
      await getOrderById(req, res);
      console.log(`Status: ${res.statusCode} (Expected: 403), Message: ${res.data.message}`);

      if (res.statusCode === 403) {
        console.log('✅ Test 7 PASSED: Forbidden when accessing another user’s order');
      } else {
        throw new Error('Test 7 FAILED: Security flaw, other user could read order');
      }
    }

    // --- Test 8: Insufficient Stock check ---
    console.log('\n--- Test 8: Insufficient stock rejection ---');
    {
      // Fetch fresh user and add 10 keyboards when only 3 are left in stock
      const freshUser = await Customer.findById(user._id);
      freshUser.cart = [{ product: product1._id, quantity: 10 }];
      await freshUser.save();

      const { req, res } = mockReqRes(freshUser, {}, { shippingAddress: validAddress });
      await createOrder(req, res);
      console.log(`Status: ${res.statusCode} (Expected: 400), Message: ${res.data.message}`);

      if (res.statusCode === 400 && res.data.message.includes('Insufficient stock')) {
        console.log('✅ Test 8 PASSED: Insufficient stock correctly rejected');
      } else {
        throw new Error('Test 8 FAILED');
      }
    }

    // --- Test 9: Bonus Challenge - Order Status Progression ---
    console.log('\n--- Test 9: Bonus Challenge - Order status progression (PATCH /orders/:id/status) ---');
    {
      const { req, res } = mockReqRes(user, { id: testShopKartOrderId }, { status: 'CONFIRMED' });
      await updateOrderStatus(req, res);
      console.log(`Status: ${res.statusCode}, Updated status: ${res.data.order.status} (Expected: CONFIRMED)`);

      if (res.statusCode === 200 && res.data.order.status === 'CONFIRMED') {
        console.log('✅ Test 9 PASSED: Order status progression works');
      } else {
        throw new Error('Test 9 FAILED');
      }
    }

    console.log('\n🎉 ALL LAB 06 ORDER & RAZORPAY TEST SUITES PASSED! 🚀\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
};

runOrderTests();
