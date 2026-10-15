import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartFeedback, setCartFeedback] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/products/${id}`);
        const data = response.data.product || response.data;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (err.response?.status === 404) {
          setError('Product not found. The item you are looking for does not exist.');
        } else if (err.response?.status === 400) {
          setError('Invalid product ID provided.');
        } else {
          setError('Something went wrong while loading product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const { addToCart, getCartItemInfo, actionLoading } = useCart();
  const cartItemInfo = product ? getCartItemInfo(product._id) : { inCart: false, quantity: 0 };
  const isAddingToCart = product ? actionLoading[product._id] === 'adding' : false;

  const handleAddToCart = async () => {
    if (!product || isAddingToCart || product.stock <= 0) return;

    if (cartItemInfo.inCart && cartItemInfo.quantity >= product.stock) {
      setCartFeedback(`⚠️ Max stock limit (${product.stock}) reached for this item.`);
      setTimeout(() => setCartFeedback(''), 3000);
      return;
    }

    const res = await addToCart(product._id);
    if (res.success) {
      setCartFeedback('✓ Product successfully added to your cart!');
    } else {
      setCartFeedback(`⚠️ ${res.message || 'Failed to add product to cart.'}`);
    }
    setTimeout(() => {
      setCartFeedback('');
    }, 3500);
  };

  if (loading) {
    return (
      <div className="loading-container" id="product-details-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="details-error-wrapper">
        <div className="state-message-card error-card">
          <span className="state-icon">⚠️</span>
          <h3>Product Not Found</h3>
          <p className="state-description">{error || 'Unable to load product information.'}</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-page">
      {/* Navigation Breadcrumb */}
      <div className="details-breadcrumb">
        <Link to="/products" className="breadcrumb-link">
          ← Back to All Products
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-category">{product.category}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {cartFeedback && (
        <div className="alert alert-success cart-feedback-alert" role="alert">
          {cartFeedback}
        </div>
      )}

      {/* Main Details Card */}
      <div className="product-details-container">
        {/* Left Column: Product Image */}
        <div className="details-image-section">
          <div className="large-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="large-product-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        </div>

        {/* Right Column: Product Information */}
        <div className="details-info-section">
          <div className="details-badge-row">
            <span className="details-category-badge">{product.category}</span>
            <span className="details-product-id">ID: {product._id}</span>
          </div>

          <h1 className="details-title">{product.name}</h1>

          <div className="details-price-row">
            <span className="details-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
            <span className="details-tax-note">Inclusive of all taxes</span>
          </div>

          <div className="details-stock-row">
            <div className={`stock-indicator ${isOutOfStock ? 'indicator-empty' : 'indicator-available'}`}>
              <span className="indicator-dot"></span>
              <strong>{isOutOfStock ? 'Currently Out of Stock' : 'In Stock'}</strong>
              <span className="stock-count-text">
                ({isOutOfStock ? '0' : product.stock} {product.stock === 1 ? 'unit' : 'units'} left)
              </span>
            </div>
          </div>

          <div className="details-description-box">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="details-features-list">
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <span>Free Delivery on orders above ₹499</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>1 Year Warranty &amp; 7-Day Replacement Guarantee</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <span>Secure Transactions &amp; Cash on Delivery available</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="details-actions">
            <button
              onClick={handleAddToCart}
              className={`btn-add-to-cart ${isOutOfStock ? 'btn-disabled' : ''} ${isAddingToCart ? 'btn-cart-loading' : ''}`}
              disabled={isOutOfStock || isAddingToCart}
              id="add-to-cart-button"
            >
              {isOutOfStock
                ? 'Out of Stock'
                : isAddingToCart
                ? '⏳ Adding to Cart...'
                : cartItemInfo.inCart
                ? `🛒 Add Another (${cartItemInfo.quantity} in cart)`
                : '🛒 Add to Cart'}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="btn-view-cart-link"
              id="view-cart-button"
            >
              View Cart 🛍️
            </button>
            <button
              onClick={() => navigate('/products')}
              className="btn-continue-shopping"
            >
              Browse More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
