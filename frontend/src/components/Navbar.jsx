import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartCount } = useCart();

  // Fetch wishlist count when user is logged in or location changes
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }
      try {
        const response = await api.get('/wishlist');
        if (response.data && typeof response.data.count === 'number') {
          setWishlistCount(response.data.count);
        }
      } catch {
        // Silently fail — navbar count is non-critical
      }
    };

    fetchWishlistCount();
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      if (setUser) setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if error occurs, clear local user state and redirect
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? "/home" : "/login"} className="navbar-brand">
          <span className="brand-icon">🛍️</span> ShopKart
        </Link>

        <div className="navbar-links">
          {user ? (
            <div className="navbar-user-section">
              <Link to="/products" className="nav-link nav-products-link">
                Products
              </Link>
              <Link to="/wishlist" className="nav-link nav-wishlist-link" id="nav-wishlist-link">
                ❤️ Wishlist{wishlistCount > 0 && (
                  <span className="wishlist-count-badge">{wishlistCount}</span>
                )}
              </Link>
              <Link to="/cart" className="nav-link nav-cart-link" id="nav-cart-link">
                🛒 Cart{cartCount > 0 ? (
                  <span className="cart-count-badge" id="nav-cart-count">{cartCount}</span>
                ) : (
                  <span className="cart-empty-pill">0</span>
                )}
              </Link>
              <Link to="/orders" className="nav-link nav-orders-link" id="nav-orders-link">
                📦 Orders
              </Link>
              <Link to="/home" className="nav-link">
                Profile
              </Link>
              <span className="user-greeting">
                Hello, <strong>{user.fullName}</strong>
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-guest-links">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link btn-register-link">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
