const Product = require('../models/product.model');

const sampleProducts = [
  {
    name: 'Mechanical RGB Keyboard',
    description: 'Custom hot-swappable tactile RGB mechanical keyboard with PBT keycaps and dampening foam.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    stock: 15,
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation, 40hr battery life and Hi-Res audio.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    stock: 25,
  },
  {
    name: 'Ultra-Precision Wireless Mouse',
    description: 'Ergonomic wireless gaming and productivity mouse with 26K DPI sensor and ultra-low latency.',
    price: 1899,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    stock: 30,
  },
  {
    name: 'Classic Denim Trucker Jacket',
    description: '100% premium vintage washed cotton denim jacket with durable metal buttons and classic fit.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    stock: 12,
  },
  {
    name: 'Minimalist Sneaker White',
    description: 'Handcrafted genuine leather low-top sneakers with cushioned insoles for all-day comfort.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    stock: 8,
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy and proven way to build good habits and break bad ones. Hardcover edition.',
    price: 599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    stock: 45,
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'Your journey to mastery, 20th Anniversary Edition. Essential guide for modern software engineers.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    stock: 18,
  },
  {
    name: 'Ceramic Pour-Over Coffee Dripper',
    description: 'Artisanal ceramic manual coffee maker for brewing rich, aromatic artisanal drip coffee.',
    price: 1199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    stock: 20,
  },
  {
    name: 'Aroma Diffuser & Night Lamp',
    description: 'Ultrasonic cool mist essential oil humidifier with ambient 7-color warm LED lighting.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    stock: 5,
  },
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 No products found in database. Auto-seeding initial product catalog...');
      await Product.insertMany(sampleProducts);
      console.log(`✅ Successfully seeded ${sampleProducts.length} sample products!`);
    }
  } catch (err) {
    console.error('⚠️ Product auto-seed error:', err.message);
  }
};

module.exports = { seedProducts, sampleProducts };
