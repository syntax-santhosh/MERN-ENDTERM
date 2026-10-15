const mongoose = require('mongoose');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addToCart, getCart, updateQuantity, removeFromCart } = require('./controllers/cart.controller');

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

const runCartTests = async () => {
  console.log('🧪 Starting Lab 05 Shopping Cart Unit & Logic Tests...\n');

  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory test database');

    // Setup test user & test product
    const user = await Customer.create({
      fullName: 'Cart Tester',
      email: 'tester@shopkart.com',
      password: 'password123',
      phone: '9876543210',
      cart: [],
    });

    const product = await Product.create({
      name: 'Mechanical Gaming Keyboard',
      price: 2999,
      category: 'Electronics',
      stock: 4,
      image: 'https://example.com/keyboard.jpg',
      description: 'Tactile mechanical switches with RGB backlighting.',
    });

    const product2 = await Product.create({
      name: 'Wireless Ergonomic Mouse',
      price: 1499,
      category: 'Electronics',
      stock: 10,
      image: 'https://example.com/mouse.jpg',
      description: 'Precision ergonomic wireless mouse.',
    });

    console.log(`Created test product with stock = ${product.stock}`);

    // Test 1: Add new item to cart
    console.log('\n--- Test 1: Add new item (POST /cart/:productId) ---');
    {
      const { req, res } = mockReqRes(user, { productId: product._id.toString() });
      await addToCart(req, res);
      console.log(`Status: ${res.statusCode}, Message: ${res.data.message}`);
      const item = res.data.cart.find((i) => i.product._id.toString() === product._id.toString());
      console.log(`Item quantity in cart: ${item?.quantity} (Expected: 1)`);
      if (res.statusCode === 200 && item?.quantity === 1) {
        console.log('✅ Test 1 PASSED');
      } else {
        throw new Error('Test 1 FAILED');
      }
    }

    // Test 2: Add same item again (quantity increment)
    console.log('\n--- Test 2: Add same item again (POST /cart/:productId) ---');
    {
      const { req, res } = mockReqRes(user, { productId: product._id.toString() });
      await addToCart(req, res);
      console.log(`Status: ${res.statusCode}, Message: ${res.data.message}`);
      const item = res.data.cart.find((i) => i.product._id.toString() === product._id.toString());
      console.log(`Item quantity in cart: ${item?.quantity} (Expected: 2)`);
      if (res.statusCode === 200 && item?.quantity === 2) {
        console.log('✅ Test 2 PASSED');
      } else {
        throw new Error('Test 2 FAILED');
      }
    }

    // Test 3: Get Cart (GET /cart)
    console.log('\n--- Test 3: Get Cart with populated products (GET /cart) ---');
    {
      const { req, res } = mockReqRes(user);
      await getCart(req, res);
      console.log(`Status: ${res.statusCode}, Cart items count: ${res.data.cart.length}`);
      const firstItem = res.data.cart[0];
      console.log(`Populated Product Name: ${firstItem.product.name}, Price: ₹${firstItem.product.price}`);
      if (res.statusCode === 200 && firstItem.product.name === product.name) {
        console.log('✅ Test 3 PASSED');
      } else {
        throw new Error('Test 3 FAILED');
      }
    }

    // Test 4: Update Quantity (PATCH /cart/:productId)
    console.log('\n--- Test 4: Update quantity to 3 (PATCH /cart/:productId) ---');
    {
      const { req, res } = mockReqRes(user, { productId: product._id.toString() }, { quantity: 3 });
      await updateQuantity(req, res);
      console.log(`Status: ${res.statusCode}, Message: ${res.data.message}`);
      const item = res.data.cart.find((i) => i.product._id.toString() === product._id.toString());
      console.log(`Updated quantity: ${item?.quantity} (Expected: 3)`);
      if (res.statusCode === 200 && item?.quantity === 3) {
        console.log('✅ Test 4 PASSED');
      } else {
        throw new Error('Test 4 FAILED');
      }
    }

    // Test 5: Exceed Stock (Quantity > stock)
    console.log('\n--- Test 5: Exceed stock (PATCH /cart/:productId with quantity = 10, stock = 4) ---');
    {
      const { req, res } = mockReqRes(user, { productId: product._id.toString() }, { quantity: 10 });
      await updateQuantity(req, res);
      console.log(`Status: ${res.statusCode} (Expected: 400), Message: ${res.data.message}`);
      if (res.statusCode === 400) {
        console.log('✅ Test 5 PASSED');
      } else {
        throw new Error('Test 5 FAILED');
      }
    }

    // Test 5b: Quantity < 1 rejected
    console.log('\n--- Test 5b: Quantity < 1 rejected ---');
    {
      const { req, res } = mockReqRes(user, { productId: product._id.toString() }, { quantity: 0 });
      await updateQuantity(req, res);
      console.log(`Status: ${res.statusCode} (Expected: 400), Message: ${res.data.message}`);
      if (res.statusCode === 400) {
        console.log('✅ Test 5b PASSED');
      } else {
        throw new Error('Test 5b FAILED');
      }
    }

    // Test 6: Remove product from cart (DELETE /cart/:productId)
    console.log('\n--- Test 6: Remove item (DELETE /cart/:productId) ---');
    {
      const { req, res } = mockReqRes(user, { productId: product._id.toString() });
      await removeFromCart(req, res);
      console.log(`Status: ${res.statusCode}, Message: ${res.data.message}`);
      console.log(`Remaining cart items: ${res.data.cart.length} (Expected: 0)`);
      if (res.statusCode === 200 && res.data.cart.length === 0) {
        console.log('✅ Test 6 PASSED');
      } else {
        throw new Error('Test 6 FAILED');
      }
    }

    console.log('\n🎉 ALL 7 CART TESTS PASSED SUCCESSFULLY! 🚀\n');
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

runCartTests();
