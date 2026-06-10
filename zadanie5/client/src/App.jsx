import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Products from './Products.jsx';
import Cart from './Cart.jsx';
import Payments from './Payments.jsx';
import Register from './Register.jsx';
import { CartProvider } from './CartContext.jsx';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
          <h1>Task 5</h1>
          <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/payments">Payments</Link>
            <Link to="/register">Register</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  );
}
