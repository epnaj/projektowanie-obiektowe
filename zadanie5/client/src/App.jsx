import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Products from './Products.jsx';
import Cart from './Cart.jsx';
import Payments from './Payments.jsx';

export default function App() {
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
    <BrowserRouter>
      <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Task 5</h1>
        <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/payments">Payments</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<Products onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart items={cart} onRemove={removeFromCart} />} />
          <Route path="/payments" element={<Payments cart={cart} onRemoveFromCart={removeFromCart} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
