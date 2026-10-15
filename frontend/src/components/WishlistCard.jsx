import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const WishlistCard = ({ product, onRemoved }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const isOutOfStock = product.stock <= 0;

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleRemove = async () => {
    if (removing) return;

    try {
      setRemoving(true);
      setError(null);
      await api.delete(`/wishlist/${product._id}`);
      if (onRemoved) onRemoved(product._id);
    } catch (err) {
      setError('Failed to remove. Try again.');
      setRemoving(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className={`wishlist-card ${removing ? 'wishlist-card-removing' : ''}`} id={`wishlist-card-${product._id}`}>
      <div className="wishlist-card-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="wishlist-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <span className="wishlist-category-tag">{product.category}</span>
        {isOutOfStock && <span className="wishlist-out-of-stock">Sold Out</span>}
      </div>

      <div className="wishlist-card-content">
        <h3 className="wishlist-product-name" title={product.name}>
          {product.name}
        </h3>

        <div className="wishlist-card-meta">
          <span className="wishlist-price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          <span className={`wishlist-stock ${isOutOfStock ? 'stock-empty' : 'stock-available'}`}>
            {isOutOfStock ? 'Out of stock' : `${product.stock} units left`}
          </span>
        </div>

        {error && <p className="wishlist-card-error">{error}</p>}

        <div className="wishlist-card-actions">
          <button
            onClick={handleViewDetails}
            className="btn-wishlist-view"
            id={`wishlist-view-${product._id}`}
          >
            View Details
          </button>
          <button
            onClick={handleRemove}
            className="btn-wishlist-remove"
            disabled={removing}
            id={`wishlist-remove-${product._id}`}
          >
            {removing ? '⏳ Removing...' : '🗑️ Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
