import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((product) => {
    setCart((prev) => [ ...prev,
      {
        id: product.id,
        name: product.name,
        price: product.price,
      },
    ]);
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.id === productId);
      if (index === -1) return prev;

      const next = prev.slice();
      next.splice(index, 1);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
    }),
    [cart, addToCart, removeFromCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return ctx;
}