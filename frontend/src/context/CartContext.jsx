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
  // No delivery fee (campus pickup) and no tax
  const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);
  const cartTotal = cartSubtotal;

  const value = {
    cartItems,
    restaurantId,
    restaurantName,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotalItems,
    cartSubtotal,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
