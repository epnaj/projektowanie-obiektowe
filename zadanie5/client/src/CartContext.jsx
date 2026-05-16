import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    setCart((prev) => [...prev, { id: product.id, name: product.name, price: product.price }]);
  }

  function removeFromCart(productId) {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.id === productId);
      if (index === -1) return prev;
      const next = prev.slice();
      next.splice(index, 1);
      return next;
    });
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
