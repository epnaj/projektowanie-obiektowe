import { useEffect, useState } from 'react';
import { useCart } from './CartContext.jsx';
import api from './api.js';

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/products')
      .then((res) => setProducts(res.data))
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
            <button type="button" data-testid={`add-${p.id}`} onClick={() => addToCart(p)}>Add to cart</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
