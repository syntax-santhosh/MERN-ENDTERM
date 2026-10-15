import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error fetching order confirmation:', err);
        setError('Could not retrieve full order details, but your order was recorded.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="state-message-card loading-card">
          <div className="spinner"></div>
          <h3>Confirming your order...</h3>
          <p className="state-description">Retrieving order details from ShopKart servers</p>
        </div>
      </div>
    );
  }

  const shipping = order?.shippingAddress || {};

  return (
    <div className="order-success-page" id="order-success-page">
      <div className="order-success-card">
        <div className="success-icon-badge">
          <span>✓</span>
        </div>

        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">
          Thank you for shopping with ShopKart. Your order has been placed and is being prepared for shipment.
        </p>

        {error && <div className="alert alert-warning">{error}</div>}

        <div className="success-meta-grid">
          <div className="meta-box">
            <span className="meta-label">Order ID</span>
            <span className="meta-value font-mono">#{id}</span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Total Amount</span>
            <span className="meta-value text-primary font-bold">
              ₹{order ? Number(order.totalAmount).toLocaleString('en-IN') : '...'}
            </span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Payment Status</span>
            <span className="meta-value">
              <span className="status-pill status-paid">
                ● {order?.paymentStatus || 'PAID'}
              </span>
            </span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Order Status</span>
            <span className="meta-value">
              <span className="status-pill status-placed">
                ● {order?.status || 'PLACED'}
              </span>
            </span>
          </div>
        </div>

        {/* Shipping summary */}
        {order && (
          <div className="success-shipping-box">
            <h3>Delivering To</h3>
            <p className="shipping-text">
              <strong>{shipping.fullName}</strong> ({shipping.phone})<br />
              {shipping.addressLine1}, {shipping.city}, {shipping.state} — {shipping.pincode}
            </p>
          </div>
        )}

        {/* Ordered Items Preview */}
        {order?.items && order.items.length > 0 && (
          <div className="success-items-preview">
            <h3>Items in this Order ({order.items.length})</h3>
            <div className="preview-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="preview-item-row">
                  <span className="preview-item-name">{item.name} × {item.quantity}</span>
                  <span className="preview-item-price">
                    ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="success-actions-row">
          <Link to="/orders" className="btn-primary" id="btn-view-my-orders">
            📦 View My Orders
          </Link>
          <Link to="/products" className="btn-secondary" id="btn-continue-shopping">
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
