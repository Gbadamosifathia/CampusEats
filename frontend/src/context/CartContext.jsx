import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');

  const addToCart = (item, restId, restName) => {
    // If adding from a different restaurant, clear cart first
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm("You have items from another restaurant in your cart. Start a new order?")) {
        return;
      }
      setCartItems([]);
    }

    setRestaurantId(restId);
    setRestaurantName(restName);

    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  };

  const cartTotalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);
  const deliveryFee = cartTotalItems > 0 ? 2.99 : 0;
  const tax = cartSubtotal * 0.09;
  const cartTotal = cartSubtotal + deliveryFee + tax;

  const value = {
    cartItems,
    restaurantId,
    restaurantName,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotalItems,
    cartSubtotal,
    deliveryFee,
    tax,
    cartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
