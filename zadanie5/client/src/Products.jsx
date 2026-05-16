import React, { useEffect, useState } from 'react';
import { useCart } from './CartContext.jsx';

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) {
          throw new Error('HTTP ' + r.status);
        }
        return r.json();
      })
      .then((data) => setProducts(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;

  return (
    <section>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span><strong>{p.name}</strong> - {p.price} PLN</span>
            <button type="button" onClick={() => addToCart(p)}>Add to cart</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
