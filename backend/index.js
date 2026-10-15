const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const { seedProducts } = require('./utils/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Core Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS configuration to allow HttpOnly cookies from frontend
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Crucial for sending and receiving cookies
  })
);

// 2. Health check route
app.get('/', (req, res) => {
  res.send({ status: 'OK', message: 'ShopKart Authentication API is running!' });
});

// 3. API Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// 4. Connect to MongoDB and start server
const connectDBAndStart = async () => {
  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

  try {
    // Attempt connecting to the configured MONGO_URI
    console.log(`📡 Connecting to MongoDB at: ${mongoUri.replace(/\/\/.*@/, '//<credentials>@')}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if local server is down
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (err) {
    console.warn(`⚠️ Could not connect to configured MongoDB (${err.message}).`);

    // If local MongoDB isn't running, start an in-memory MongoDB instance automatically
    try {
      console.log('🔄 Starting an embedded in-memory MongoDB instance for testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to embedded MongoDB successfully! (Data will persist while server runs)');
    } catch (memErr) {
      console.error('❌ Failed to initialize embedded MongoDB:', memErr.message);
    }
  }

  // Auto-seed initial products if catalogue is empty
  await seedProducts();

  app.listen(PORT, () => {
    console.log(`🚀 ShopKart Backend running on http://localhost:${PORT}`);
  });
};

connectDBAndStart();

