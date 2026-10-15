const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/product.model');
const { sampleProducts } = require('./utils/seedData');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    await Product.deleteMany({});
    console.log('🗑️ Existing products cleared');

    await Product.insertMany(sampleProducts);
    console.log(`🎉 Successfully seeded ${sampleProducts.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
