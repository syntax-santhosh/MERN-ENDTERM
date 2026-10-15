import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import AddProductModal from '../components/AddProductModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wishlist IDs for marking cards
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('');

  // Add Product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch user's wishlist IDs to mark products
  const fetchWishlistIds = useCallback(async () => {
    try {
      const response = await api.get('/wishlist');
      if (response.data && Array.isArray(response.data.wishlist)) {
        const ids = new Set(response.data.wishlist.map((p) => p._id));
        setWishlistIds(ids);
      }
    } catch {
      // Not logged in or error — don't show wishlist state
    }
  }, []);

  // Function to fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      if (selectedSort) {
        params.sort = selectedSort;
      }

      const response = await api.get('/products', { params });
      
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSort]);

  // Fetch wishlist IDs on mount
  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  // Debounced effect for search and filter updates
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 250); // Small 250ms debounce for smooth search typing

    return () => clearTimeout(handler);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedSort('');
  };

  const handleProductCreated = () => {
    fetchProducts();
  };

  const handleWishlistChange = (productId, isAdded) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isAdded) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  return (
    <div className="products-page-container">
      {/* Page Header */}
      <div className="products-hero-header">
        <div className="header-titles">
          <h1>Product Catalog</h1>
          <p>Explore high quality items curated for you</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-create-product"
            onClick={() => setIsAddModalOpen(true)}
            id="add-product-btn"
          >
            ➕ Add Product
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area: Loading / Error / Empty / Grid */}
      <div className="products-content-area">
        {/* 1. Loading State */}
        {loading && (
          <div className="loading-container" id="products-loading-state">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="state-message-card error-card" id="products-error-state">
            <span className="state-icon">⚠️</span>
            <h3>Something went wrong while loading products.</h3>
            <p className="state-description">{error}</p>
            <button className="btn-primary state-retry-btn" onClick={fetchProducts}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="state-message-card empty-card" id="products-empty-state">
            <span className="state-icon">🔍</span>
            <h3>No products found.</h3>
            <p className="state-description">
              We couldn't find any products matching your search criteria.
            </p>
            <button className="btn-secondary state-action-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        )}

        {/* 4. Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-results-wrapper">
            <div className="products-count-bar">
              <span>Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}</span>
            </div>
            <div className="products-grid" id="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isWishlisted={wishlistIds.has(product._id)}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

export default Products;
