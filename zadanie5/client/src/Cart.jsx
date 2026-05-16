import React from 'react';

export default function Cart({ items, onRemove }) {
  if (items.length === 0) {
    return (
      <section>
        <h2>Cart</h2>
        <p>Cart is empty.</p>
      </section>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <section>
      <h2>Cart</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span><strong>{item.name}</strong> - {item.price} PLN</span>
            <button type="button" onClick={() => onRemove(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p><strong>Total:</strong> {total} PLN</p>
    </section>
  );
}
