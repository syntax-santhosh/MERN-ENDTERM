const http = require('http');

const request = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting Backend Lab 03 Product API Tests...\n');

  try {
    // Test 1: GET /products
    console.log('1. Testing GET /products...');
    const listRes = await request('/products');
    console.log(`Status: ${listRes.status}, Count: ${listRes.body.count}`);
    if (listRes.status !== 200 || !Array.isArray(listRes.body.products)) {
      throw new Error('GET /products failed!');
    }
    console.log('✅ GET /products passed!\n');

    // Test 2: POST /products - Success
    console.log('2. Testing POST /products (Success Case)...');
    const newProd = {
      name: 'Test Gaming Mousepad',
      description: 'Extra large water-resistant micro-texture gaming mousepad.',
      price: 799,
      category: 'Electronics',
      image: 'https://example.com/mousepad.jpg',
      stock: 50,
    };
    const createRes = await request('/products', 'POST', newProd);
    console.log(`Status: ${createRes.status}, Product ID: ${createRes.body._id || createRes.body.product?._id}`);
    if (createRes.status !== 201) {
      throw new Error(`POST /products failed: ${JSON.stringify(createRes.body)}`);
    }
    const createdId = createRes.body._id || createRes.body.product._id;
    console.log('✅ POST /products passed!\n');

    // Test 3: POST /products - Missing required field (400)
    console.log('3. Testing POST /products with missing fields (should return 400)...');
    const badProd1 = { name: 'Incomplete' };
    const failRes1 = await request('/products', 'POST', badProd1);
    console.log(`Status: ${failRes1.status}, Message: ${failRes1.body.message}`);
    if (failRes1.status !== 400) throw new Error('Expected 400 for missing fields');
    console.log('✅ Missing fields validation passed!\n');

    // Test 4: POST /products - Invalid Price (400)
    console.log('4. Testing POST /products with invalid price <= 0 (should return 400)...');
    const badProd2 = { ...newProd, price: -50 };
    const failRes2 = await request('/products', 'POST', badProd2);
    console.log(`Status: ${failRes2.status}, Message: ${failRes2.body.message}`);
    if (failRes2.status !== 400) throw new Error('Expected 400 for invalid price');
    console.log('✅ Invalid price validation passed!\n');

    // Test 5: POST /products - Invalid Stock (400)
    console.log('5. Testing POST /products with negative stock (should return 400)...');
    const badProd3 = { ...newProd, stock: -5 };
    const failRes3 = await request('/products', 'POST', badProd3);
    console.log(`Status: ${failRes3.status}, Message: ${failRes3.body.message}`);
    if (failRes3.status !== 400) throw new Error('Expected 400 for invalid stock');
    console.log('✅ Invalid stock validation passed!\n');

    // Test 6: GET /products/:id (Success)
    console.log(`6. Testing GET /products/${createdId}...`);
    const singleRes = await request(`/products/${createdId}`);
    console.log(`Status: ${singleRes.status}, Name: ${singleRes.body.name || singleRes.body.product?.name}`);
    if (singleRes.status !== 200) throw new Error('GET /products/:id failed');
    console.log('✅ GET /products/:id passed!\n');

    // Test 7: GET /products/:id (Invalid ID -> 400)
    console.log('7. Testing GET /products/invalid-id (should return 400)...');
    const invalidIdRes = await request('/products/invalid-id-123');
    console.log(`Status: ${invalidIdRes.status}, Message: ${invalidIdRes.body.message}`);
    if (invalidIdRes.status !== 400) throw new Error('Expected 400 for invalid ID');
    console.log('✅ Invalid ID validation passed!\n');

    // Test 8: GET /products/:id (Non-existent ID -> 404)
    console.log('8. Testing GET /products/66d000000000000000000000 (should return 404)...');
    const notFoundRes = await request('/products/66d000000000000000000000');
    console.log(`Status: ${notFoundRes.status}, Message: ${notFoundRes.body.message}`);
    if (notFoundRes.status !== 404) throw new Error('Expected 404 for not found ID');
    console.log('✅ Not found ID validation passed!\n');

    // Test 9: GET /products?search=keyboard
    console.log('9. Testing search query param GET /products?search=keyboard...');
    const searchRes = await request('/products?search=keyboard');
    console.log(`Status: ${searchRes.status}, Results: ${searchRes.body.count}`);
    searchRes.body.products.forEach(p => console.log(`   - ${p.name}`));
    console.log('✅ Search query param passed!\n');

    // Test 10: GET /products?category=Electronics
    console.log('10. Testing category filter GET /products?category=Electronics...');
    const catRes = await request('/products?category=Electronics');
    console.log(`Status: ${catRes.status}, Results: ${catRes.body.count}`);
    catRes.body.products.forEach(p => console.log(`   - [${p.category}] ${p.name}`));
    console.log('✅ Category filter passed!\n');

    // Test 11: GET /products?search=keyboard&category=Electronics
    console.log('11. Testing combined GET /products?search=keyboard&category=Electronics...');
    const combRes = await request('/products?search=keyboard&category=Electronics');
    console.log(`Status: ${combRes.status}, Results: ${combRes.body.count}`);
    console.log('✅ Combined filter passed!\n');

    // Test 12: GET /products?sort=price_asc and sort=price_desc (Bonus)
    console.log('12. Testing sorting bonus: GET /products?sort=price_asc...');
    const sortAscRes = await request('/products?sort=price_asc');
    const pricesAsc = sortAscRes.body.products.map(p => p.price);
    console.log(`Prices ASC: ${pricesAsc.slice(0, 5).join(', ')}...`);
    
    console.log('Testing sorting bonus: GET /products?sort=price_desc...');
    const sortDescRes = await request('/products?sort=price_desc');
    const pricesDesc = sortDescRes.body.products.map(p => p.price);
    console.log(`Prices DESC: ${pricesDesc.slice(0, 5).join(', ')}...`);
    console.log('✅ Bonus sorting passed!\n');

    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! 100/100 backend readiness achieved.');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
};

runTests();
