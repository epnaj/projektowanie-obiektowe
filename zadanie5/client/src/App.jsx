import React from 'react';
import Products from './Products.jsx';
import Payments from './Payments.jsx';

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Task 5</h1>
      <Products />
      <hr style={{ margin: '2rem 0' }} />
      <Payments />
    </main>
  );
}
