import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Track action per item (e.g., actionLoading[productId] = 'adding' | 'updating' | 'removing')
  const [actionLoading, setActionLoading] = useState({});

  // Fetch cart for the authenticated user
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/cart');
      if (res.data && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      // If 401, user is unauthenticated
      if (err.response?.status !== 401) {
        setError('Unable to load your cart. Please try again.');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user changes or mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 1. Add product to cart (or increment quantity)
  const addToCart = async (productId) => {
    if (!user) {
      return { success: false, message: 'Please log in to add items to your cart.', unauthenticated: true };
    }

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: 'adding' }));
      const res = await api.post(`/cart/${productId}`);
      if (res.data && res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message || 'Added to cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // 2. Update quantity of product in cart
  const updateQuantity = async (productId, quantity) => {
    if (!user) {
      return { success: false, message: 'Please log in first.', unauthenticated: true };
    }

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: 'updating' }));
      const res = await api.patch(`/cart/${productId}`, { quantity });
      if (res.data && res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message || 'Cart updated' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // 3. Remove product from cart
  const removeFromCart = async (productId) => {
    if (!user) {
      return { success: false, message: 'Please log in first.', unauthenticated: true };
    }

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: 'removing' }));
      const res = await api.delete(`/cart/${productId}`);
      if (res.data && res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message || 'Item removed from cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item.';
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // 4. Derived values: Total units (Cart Count in Navbar) and Subtotal
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  // Find if a specific product is already in the cart and its current quantity
  const getCartItemInfo = useCallback(
    (productId) => {
      const found = cartItems.find(
        (item) => (item.product?._id || item.product) === productId
      );
      return {
        inCart: Boolean(found),
        quantity: found ? found.quantity : 0,
      };
    },
    [cartItems]
  );

  // Clear frontend cart state immediately upon successful order placement
  const clearCartState = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    loading,
    error,
    actionLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
    clearCartState,
    cartCount,
    subtotal,
    totalItems,
    getCartItemInfo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
