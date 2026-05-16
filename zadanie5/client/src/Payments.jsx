import React, { useEffect, useState } from 'react';

export default function Payments() {
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((data) => {
      setProducts(data);
      if (data.length) {
        setProductId(String(data[0].id));
      }
    });
    fetch('/api/payments').then((r) => r.json()).then(setPayments);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(productId) })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }
      setPayments((prev) => [...prev, data]);
      setStatus('Payment saved: ' + data.productName + ' (' + data.amount + ' PLN)');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  }

  return (
    <section>
      <h2>Payments</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label htmlFor="product">Product:</label>
        <select id="product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.price} PLN)</option>
          ))}
        </select>
        <button type="submit">Pay</button>
      </form>
      {status && <p>{status}</p>}
      <h3>Payment history</h3>
      {payments.length === 0 ? (
        <p>No payments yet.</p>
      ) : (
        <ul>
          {payments.map((p) => (
            <li key={p.id}>#{p.id} - {p.productName} - {p.amount} PLN - {p.createdAt}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
