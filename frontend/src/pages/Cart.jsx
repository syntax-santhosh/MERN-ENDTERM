import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, loading, error, refreshCart, subtotal, cartCount, totalItems } = useCart();
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  // 1. Loading State
  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="state-message-card loading-card" id="cart-loading-state">
          <div className="spinner"></div>
          <h3>Loading your cart...</h3>
          <p className="state-description">Fetching your saved items from ShopKart server</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="state-message-card error-card" id="cart-error-state">
          <span className="state-icon">⚠️</span>
          <h3>Unable to load your cart</h3>
          <p className="state-description">{error}</p>
          <button className="btn-primary" onClick={refreshCart} id="btn-cart-retry">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="state-message-card empty-card" id="cart-empty-state">
          <span className="state-icon">🛒</span>
          <h3>Your cart is empty 🛒</h3>
          <p className="state-description">
            Looks like you haven't added anything yet. Explore our top products and start shopping!
          </p>
          <Link to="/products" className="btn-primary" id="btn-browse-products">
            🛍️ Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page-container" id="cart-page">
      <div className="cart-header">
        <div className="cart-header-left">
          <h1 className="cart-page-title">My Cart</h1>
          <span className="cart-header-count">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} ({cartCount} {cartCount === 1 ? 'unit' : 'units'})
          </span>
        </div>
        <Link to="/products" className="cart-continue-link">
          ← Continue Shopping
        </Link>
      </div>

      {checkoutNotice && (
        <div className="alert alert-success checkout-alert" role="alert">
          🎉 <strong>Ready for Checkout!</strong> Your order of {cartCount} units (₹{subtotal.toLocaleString('en-IN')}) is prepared. The Checkout &amp; Order flow is coming next in Lab-06!
        </div>
      )}

      <div className="cart-layout-grid">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-column">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item.product?._id || item._id} item={item} />
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="cart-summary-column">
          <div className="order-summary-card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-label">Items:</span>
                <span className="summary-val">{totalItems} ({cartCount} {cartCount === 1 ? 'unit' : 'units'})</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Subtotal:</span>
                <span className="summary-val font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Delivery Fee:</span>
                <span className="summary-val text-success">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total-row">
                <span className="summary-total-label">Estimated Total:</span>
                <span className="summary-total-val">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="summary-tax-note">Taxes and discounts calculated at checkout</p>

            <button
              type="button"
              className="btn-checkout"
              onClick={handleCheckout}
              id="proceed-to-checkout-btn"
            >
              Proceed to Checkout →
            </button>

            <div className="summary-badges">
              <div className="badge-item">
                <span className="badge-icon">🔒</span>
                <span>Secure 256-bit encrypted checkout</span>
              </div>
              <div className="badge-item">
                <span className="badge-icon">🚚</span>
                <span>Fast &amp; Free standard delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
