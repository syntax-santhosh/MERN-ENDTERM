import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { CartProvider } from './context/CartContext';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check on app load if user is already logged in (via existing cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/customers/me');
        setUser(response.data);
      } catch (err) {
        // Not logged in or expired cookie
        setUser(null);
      } finally {
        setInitialLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Connecting to ShopKart...</p>
      </div>
    );
  }

  return (
    <CartProvider user={user}>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar user={user} setUser={setUser} />
          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={<Navigate to={user ? "/home" : "/login"} replace />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route
                path="/home"
                element={<Home user={user} setUser={setUser} />}
              />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route
                path="*"
                element={<Navigate to="/products" replace />}
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
