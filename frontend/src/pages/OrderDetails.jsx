import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/orders/${id}`);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        if (err.response?.status === 403) {
          setError('Access denied: You do not have permission to view this order.');
        } else if (err.response?.status === 404) {
          setError('Order not found.');
        } else {
          setError('Unable to load order details.');
        }
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
      <div className="order-details-container">
        <div className="state-message-card loading-card">
          <div className="spinner"></div>
          <h3>Loading order details...</h3>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-container">
        <div className="state-message-card error-card">
          <span className="state-icon">⚠️</span>
          <h3>Order Lookup Error</h3>
          <p className="state-description">{error || 'Order could not be found.'}</p>
          <button className="btn-primary" onClick={() => navigate('/orders')}>
            ← Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="order-details-container" id="order-details-page">
      <div className="order-details-header">
        <Link to="/orders" className="back-link">
          ← Back to My Orders
        </Link>
        <div className="details-header-title-row">
          <h1>Order #{order._id}</h1>
          <div className="order-header-badges">
            <span className={`status-pill status-${order.paymentStatus?.toLowerCase() || 'paid'}`}>
              ● {order.paymentStatus || 'PAID'}
            </span>
            <span className={`status-pill status-${order.status?.toLowerCase() || 'placed'}`}>
              ● {order.status || 'PLACED'}
            </span>
          </div>
        </div>
        <p className="details-timestamp">Placed on {formattedDate}</p>
      </div>

      <div className="order-details-grid">
        {/* Left Column: Ordered Items Snapshot */}
        <div className="details-items-section">
          <div className="details-card">
            <h2 className="card-title">Purchased Items ({order.items?.length || 0})</h2>
            <div className="details-items-table">
              {order.items?.map((item, i) => (
                <div key={i} className="details-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="details-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <div className="details-item-info">
                    <h4 className="details-item-name">{item.name}</h4>
                    <span className="details-item-sub">Price at purchase: ₹{Number(item.price).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="details-item-qty">
                    Qty: <strong>{item.quantity}</strong>
                  </div>
                  <div className="details-item-total">
                    ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="details-cost-summary">
              <div className="cost-row">
                <span>Subtotal</span>
                <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="cost-row">
                <span>Delivery Fee</span>
                <span className="text-success font-semibold">FREE</span>
              </div>
              <div className="cost-divider"></div>
              <div className="cost-row cost-total-row">
                <strong>Grand Total</strong>
                <strong className="cost-total-val">₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery & Payment Details */}
        <div className="details-info-section-col">
          <div className="details-card">
            <h2 className="card-title">Shipping Address</h2>
            <div className="shipping-info-block">
              <p className="recipient-name"><strong>{shipping.fullName}</strong></p>
              <p className="recipient-phone">📞 {shipping.phone}</p>
              <p className="recipient-address">
                {shipping.addressLine1}<br />
                {shipping.city}, {shipping.state} — {shipping.pincode}
              </p>
            </div>
          </div>

          <div className="details-card">
            <h2 className="card-title">Payment Information</h2>
            <div className="payment-info-block">
              <div className="info-pair">
                <span className="info-key">Payment Status:</span>
                <span className="info-val font-semibold">{order.paymentStatus || 'PAID'}</span>
              </div>
              {order.razorpayOrderId && (
                <div className="info-pair">
                  <span className="info-key">Razorpay Order:</span>
                  <span className="info-val font-mono">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="info-pair">
                  <span className="info-key">Payment ID:</span>
                  <span className="info-val font-mono">{order.razorpayPaymentId}</span>
                </div>
              )}
              <div className="info-pair">
                <span className="info-key">Security:</span>
                <span className="info-val text-success">✓ Verified &amp; Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
