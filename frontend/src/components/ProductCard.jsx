import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isWishlisted: initialWishlisted, onWishlistChange }) => {
  const navigate = useNavigate();
  const { addToCart, getCartItemInfo, actionLoading } = useCart();
  const [wishlistState, setWishlistState] = useState(
    initialWishlisted ? 'added' : 'idle' // idle | saving | added | error
  );
  const [cartFeedback, setCartFeedback] = useState('');

  const cartItemInfo = getCartItemInfo(product._id);
  const isAddingToCart = actionLoading[product._id] === 'adding';
  const isOutOfStock = product.stock <= 0;

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistToggle = async () => {
    if (wishlistState === 'saving') return; // Prevent duplicate clicks

    try {
      setWishlistState('saving');

      if (wishlistState === 'added') {
        // Remove from wishlist
        await api.delete(`/wishlist/${product._id}`);
        setWishlistState('idle');
        if (onWishlistChange) onWishlistChange(product._id, false);
      } else {
        // Add to wishlist
        await api.post(`/wishlist/${product._id}`);
        setWishlistState('added');
        if (onWishlistChange) onWishlistChange(product._id, true);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistState('added');
      } else if (err.response?.status === 401) {
        setWishlistState('error');
        setTimeout(() => setWishlistState('idle'), 2500);
      } else {
        setWishlistState('error');
        setTimeout(() => setWishlistState(wishlistState === 'added' ? 'added' : 'idle'), 2500);
      }
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || isOutOfStock) return;

    if (cartItemInfo.inCart && cartItemInfo.quantity >= product.stock) {
      setCartFeedback(`Max stock limit (${product.stock}) reached`);
      setTimeout(() => setCartFeedback(''), 2500);
      return;
    }

    setCartFeedback('');
    const res = await addToCart(product._id);
    if (res.success) {
      setCartFeedback('✓ Added to cart');
      setTimeout(() => setCartFeedback(''), 2000);
    } else {
      setCartFeedback(res.message || 'Failed to add');
      setTimeout(() => setCartFeedback(''), 3000);
    }
  };

  const getAddToCartLabel = () => {
    if (isOutOfStock) return 'Sold Out';
    if (isAddingToCart) return '⏳ Adding...';
    if (cartItemInfo.inCart) return `🛒 Add Another (${cartItemInfo.quantity})`;
    return '🛒 Add to Cart';
  };

  return (
    <div className="product-card" id={`product-card-${product._id}`}>
      <div className="product-image-wrapper">
        {/* Floating wishlist heart icon */}
        <button
          className={`wishlist-heart-btn ${wishlistState === 'added' ? 'heart-active' : ''}`}
          onClick={handleWishlistToggle}
          disabled={wishlistState === 'saving'}
          title={wishlistState === 'added' ? 'Remove from Wishlist' : 'Add to Wishlist'}
          id={`wishlist-heart-${product._id}`}
        >
          {wishlistState === 'added' ? '♥' : '♡'}
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.onerror = null;
            // Fallback placeholder image if URL fails
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <span className="product-category-tag">{product.category}</span>
        {isOutOfStock && <span className="product-out-of-stock-badge">Sold Out</span>}
      </div>

      <div className="product-card-content">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-meta">
          <div className="product-price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </div>
          <div className={`stock-status ${isOutOfStock ? 'stock-empty' : 'stock-available'}`}>
            {isOutOfStock ? 'Out of stock' : `${product.stock} units left`}
          </div>
        </div>

        {/* Dynamic feedback message */}
        {cartFeedback && (
          <div className={`product-card-feedback ${cartFeedback.startsWith('✓') ? 'feedback-success' : 'feedback-warning'}`}>
            {cartFeedback}
          </div>
        )}

        <div className="product-card-actions">
          <button
            onClick={handleAddToCart}
            className={`btn-add-cart-action ${isOutOfStock ? 'btn-disabled' : ''} ${isAddingToCart ? 'btn-cart-loading' : ''}`}
            disabled={isOutOfStock || isAddingToCart}
            id={`add-to-cart-${product._id}`}
          >
            {getAddToCartLabel()}
          </button>
          <button
            onClick={handleViewDetails}
            className="btn-view-details"
            id={`view-details-${product._id}`}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
