import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/wishlist');

      if (response.data && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view your wishlist.');
      } else {
        setError('Something went wrong. We couldn\'t load your wishlist.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleProductRemoved = (productId) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  // Loading State
  if (loading) {
    return (
      <div className="wishlist-page-container">
        <div className="loading-container" id="wishlist-loading-state">
          <div className="spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="wishlist-page-container">
        <div className="state-message-card error-card" id="wishlist-error-state">
          <span className="state-icon">❌</span>
          <h3>Something went wrong</h3>
          <p className="state-description">{error}</p>
          <button className="btn-primary state-retry-btn" onClick={fetchWishlist}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page-container">
        <div className="wishlist-hero-header">
          <div className="header-titles">
            <h1>My Wishlist</h1>
            <p>Products you've saved for later</p>
          </div>
        </div>

        <div className="wishlist-empty-state" id="wishlist-empty-state">
          <div className="empty-heart-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here later.</p>
          <button
            className="btn-browse-products"
            onClick={() => navigate('/products')}
          >
            🛍️ Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Wishlist with products
  return (
    <div className="wishlist-page-container">
      <div className="wishlist-hero-header">
        <div className="header-titles">
          <h1>My Wishlist</h1>
          <p>{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-continue-shopping-wishlist"
            onClick={() => navigate('/products')}
          >
            🛍️ Continue Shopping
          </button>
        </div>
      </div>

      <div className="wishlist-grid" id="wishlist-grid">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemoved={handleProductRemoved}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
