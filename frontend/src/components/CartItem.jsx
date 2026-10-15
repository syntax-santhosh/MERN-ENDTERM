import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const [itemError, setItemError] = useState('');

  const product = item.product || {};
  const productId = product._id;
  const quantity = item.quantity || 1;
  const stock = typeof product.stock === 'number' ? product.stock : 999;
  const isUpdating = actionLoading[productId] === 'updating';
  const isRemoving = actionLoading[productId] === 'removing';
  const isBusy = isUpdating || isRemoving;

  const itemTotal = (Number(product.price) || 0) * quantity;
  const isMaxStock = quantity >= stock;
  const isMinQuantity = quantity <= 1;

  const handleDecrease = async () => {
    if (isBusy || isMinQuantity) return;
    setItemError('');
    const res = await updateQuantity(productId, quantity - 1);
    if (!res.success) {
      setItemError(res.message);
    }
  };

  const handleIncrease = async () => {
    if (isBusy) return;
    if (isMaxStock) {
      setItemError(`Only ${stock} units available in stock.`);
      setTimeout(() => setItemError(''), 3000);
      return;
    }
    setItemError('');
    const res = await updateQuantity(productId, quantity + 1);
    if (!res.success) {
      setItemError(res.message);
    }
  };

  const handleRemove = async () => {
    if (isBusy) return;
    setItemError('');
    const res = await removeFromCart(productId);
    if (!res.success) {
      setItemError(res.message);
    }
  };

  return (
    <div className={`cart-item-card ${isBusy ? 'cart-item-busy' : ''}`} id={`cart-item-${productId}`}>
      {/* Product Image */}
      <div className="cart-item-image-wrapper">
        <Link to={`/products/${productId}`}>
          <img
            src={product.image}
            alt={product.name}
            className="cart-item-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="cart-item-details">
        <div className="cart-item-header">
          <div>
            <span className="cart-item-category">{product.category}</span>
            <h3 className="cart-item-title">
              <Link to={`/products/${productId}`}>{product.name}</Link>
            </h3>
          </div>
          <div className="cart-item-unit-price">
            ₹{Number(product.price).toLocaleString('en-IN')} <span className="unit-label">/ unit</span>
          </div>
        </div>

        {/* Stock note */}
        <div className="cart-item-stock-info">
          {stock <= 5 ? (
            <span className="stock-warning">⚡ Only {stock} left in stock</span>
          ) : (
            <span className="stock-in">✓ In Stock ({stock} available)</span>
          )}
        </div>

        {/* Inline error feedback */}
        {itemError && <div className="cart-item-error-msg">{itemError}</div>}

        {/* Controls row: Stepper + Total + Remove */}
        <div className="cart-item-controls-row">
          <div className="cart-quantity-stepper">
            <button
              type="button"
              className="stepper-btn stepper-btn-minus"
              onClick={handleDecrease}
              disabled={isMinQuantity || isBusy}
              title={isMinQuantity ? 'Quantity cannot be less than 1 (Use Remove)' : 'Decrease quantity'}
              id={`decrease-qty-${productId}`}
            >
              −
            </button>
            <span className="stepper-count" id={`qty-value-${productId}`}>
              {isUpdating ? '...' : quantity}
            </span>
            <button
              type="button"
              className="stepper-btn stepper-btn-plus"
              onClick={handleIncrease}
              disabled={isMaxStock || isBusy}
              title={isMaxStock ? `Max available stock reached (${stock})` : 'Increase quantity'}
              id={`increase-qty-${productId}`}
            >
              +
            </button>
          </div>

          <div className="cart-item-subtotal">
            <span className="subtotal-label">Subtotal:</span>
            <span className="subtotal-amount">₹{itemTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={handleRemove}
            disabled={isBusy}
            id={`remove-cart-${productId}`}
          >
            {isRemoving ? 'Removing...' : '🗑️ Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
