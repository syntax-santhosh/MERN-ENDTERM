import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusFlow = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/orders');
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Bonus Challenge: Progress Order Status
  const handleProgressStatus = async (orderId, currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];

    try {
      setUpdatingId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data.success && res.data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-page-container">
        <div className="state-message-card loading-card" id="orders-loading">
          <div className="spinner"></div>
          <h3>Loading your orders...</h3>
          <p className="state-description">Fetching your order history</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page-container">
        <div className="state-message-card error-card" id="orders-error">
          <span className="state-icon">⚠️</span>
          <h3>Unable to load your orders</h3>
          <p className="state-description">{error}</p>
          <button className="btn-primary" onClick={fetchOrders} id="btn-orders-retry">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page-container">
        <div className="state-message-card empty-card" id="orders-empty">
          <span className="state-icon">📦</span>
          <h2>You have not placed any orders yet</h2>
          <p className="state-description">
            Looks like you haven't made any purchases yet. Explore our catalogue to place your first order!
          </p>
          <Link to="/products" className="btn-primary" id="btn-start-shopping">
            🛍️ Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container" id="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <span className="orders-count-badge">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </span>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const currentIdx = statusFlow.indexOf(order.status);
          const canProgress = currentIdx >= 0 && currentIdx < statusFlow.length - 1;

          return (
            <div key={order._id} className="order-card" id={`order-card-${order._id}`}>
              {/* Order Header */}
              <div className="order-card-header">
                <div>
                  <span className="order-number">Order #{order._id}</span>
                  <span className="order-date">Placed on {dateStr}</span>
                </div>
                <div className="order-header-badges">
                  <span className={`status-pill status-${order.paymentStatus?.toLowerCase() || 'paid'}`}>
                    ● {order.paymentStatus || 'PAID'}
                  </span>
                  <span className={`status-pill status-${order.status?.toLowerCase() || 'placed'}`}>
                    ● {order.status || 'PLACED'}
                  </span>
                </div>
              </div>

              {/* Bonus Challenge: Visual Status Progression Tracker */}
              <div className="order-stepper-tracker">
                {statusFlow.map((step, idx) => {
                  const isCompleted = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  return (
                    <div
                      key={step}
                      className={`stepper-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`}
                    >
                      <div className="step-circle">{isCompleted ? '✓' : idx + 1}</div>
                      <span className="step-label">{step}</span>
                      {idx < statusFlow.length - 1 && <div className="step-line"></div>}
                    </div>
                  );
                })}
              </div>

              {/* Order Items */}
              <div className="order-items-grid">
                {order.items?.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                    <div className="order-item-info">
                      <h4 className="order-item-title">{item.name}</h4>
                      <div className="order-item-meta">
                        <span>Quantity: <strong>{item.quantity}</strong></span>
                        <span>Price: <strong>₹{Number(item.price).toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                    <div className="order-item-total">
                      ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="order-card-footer">
                <div className="order-total-block">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-value">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>

                <div className="order-actions-block">
                  {canProgress && (
                    <button
                      className="btn-progress-status"
                      onClick={() => handleProgressStatus(order._id, order.status)}
                      disabled={updatingId === order._id}
                      title="Demo feature: advance order status"
                    >
                      {updatingId === order._id ? 'Updating...' : `Advance → ${statusFlow[currentIdx + 1]}`}
                    </button>
                  )}
                  <Link to={`/orders/${order._id}`} className="btn-view-order-details">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
