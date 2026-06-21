import { useCart } from './CartContext.jsx';

export default function Cart() {
  const { cart: items, removeFromCart: onRemove } = useCart();
  if (items.length === 0) {
    return (
      <section>
        <h2>Cart</h2>
        <p data-testid="cart-empty">Cart is empty.</p>
        <span data-testid="cart-count" style={{ display: 'none' }}>0</span>
      </section>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <section>
      <h2>Cart</h2>
      <span data-testid="cart-count" style={{ display: 'none' }}>{items.length}</span>
      <ul data-testid="cart-items">
        {items.map((item) => (
          <li key={item.id} data-testid="cart-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span><strong>{item.name}</strong> - {item.price} PLN</span>
            <button type="button" data-testid={`remove-${item.id}`} onClick={() => onRemove(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p><strong>Total:</strong> <span data-testid="cart-total">{total}</span> PLN</p>
    </section>
  );
}
