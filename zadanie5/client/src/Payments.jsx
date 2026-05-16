import React, { useEffect, useState } from 'react';

export default function Payments({ cart, onRemoveFromCart }) {
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState(null);
  const [cartStatus, setCartStatus] = useState(null);

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((data) => {
      setProducts(data);
      if (data.length) {
        setProductId(String(data[0].id));
      }
    });
    fetch('/api/payments').then((r) => r.json()).then(setPayments);
  }, []);

  async function postPayment(id) {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: Number(id) })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Save failed');
    }
    return data;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const data = await postPayment(productId);
      setPayments((prev) => [...prev, data]);
      setStatus('Payment saved: ' + data.productName + ' (' + data.amount + ' PLN)');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  }

  async function handlePayCart() {
    setCartStatus(null);
    if (cart.length === 0) {
      setCartStatus('Cart is empty.');
      return;
    }
    const items = cart.slice();
    const saved = [];
    try {
      for (const item of items) {
        const data = await postPayment(item.id);
        saved.push(data);
        onRemoveFromCart(item.id);
      }
      setPayments((prev) => [...prev, ...saved]);
      const total = saved.reduce((sum, p) => sum + p.amount, 0);
      setCartStatus('Paid for ' + saved.length + ' items (' + total + ' PLN).');
    } catch (err) {
      setPayments((prev) => [...prev, ...saved]);
      setCartStatus('Error: ' + err.message + ' (paid ' + saved.length + ' of ' + items.length + ')');
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

      <h3>Pay for current cart</h3>
      <p>Items in cart: {cart.length}</p>
      <button type="button" onClick={handlePayCart} disabled={cart.length === 0}>Pay for entire cart</button>
      {cartStatus && <p>{cartStatus}</p>}

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
