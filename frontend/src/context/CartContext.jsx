import { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { syncCustomerCart } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.payload._id
              ? { ...i, qty: i.qty + (action.payload.qty || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, qty: action.payload.qty || 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i._id !== action.payload),
      };

    case 'UPDATE_QTY':
      if (action.payload.qty < 1) {
        return {
          ...state,
          items: state.items.filter((i) => i._id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === action.payload.id ? { ...i, qty: action.payload.qty } : i
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    case 'TOGGLE_DRAWER':
      return { ...state, drawerOpen: !state.drawerOpen };

    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  drawerOpen: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    try {
      if (user) {
        if (user.role === 'customer') {
          if (Array.isArray(user.cart) && user.cart.length > 0) {
            const payload = user.cart.map((item) => ({
              _id: item.productId || item._id,
              name: item.name,
              price: item.price,
              discountPrice: item.discountPrice,
              images: item.images || [],
              category: item.category || 'other',
              qty: item.qty || 1,
            }));
            dispatch({ type: 'LOAD_CART', payload });
            localStorage.setItem('uf_cart', JSON.stringify(payload));
          } else {
            // New or empty user cart - keep or sync current local items if any
            const saved = localStorage.getItem('uf_cart');
            if (saved) {
              const parsed = JSON.parse(saved);
              dispatch({ type: 'LOAD_CART', payload: parsed });
              if (parsed.length > 0) {
                syncCustomerCart(
                  parsed.map((item) => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    discountPrice: item.discountPrice,
                    images: item.images || [],
                    category: item.category || 'other',
                    qty: item.qty || 1,
                  }))
                ).catch(() => {});
              }
            }
          }
        }
      } else {
        const saved = localStorage.getItem('uf_cart');
        if (saved) {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
        } else {
          dispatch({ type: 'LOAD_CART', payload: [] });
        }
      }
    } catch {}
  }, [user?.id, user?.role]);

  useEffect(() => {
    localStorage.setItem('uf_cart', JSON.stringify(state.items));
    if (user?.role === 'customer') {
      syncCustomerCart(
        state.items.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          discountPrice: item.discountPrice,
          images: item.images || [],
          category: item.category || 'other',
          qty: item.qty || 1,
        }))
      ).catch(() => {});
    }
  }, [state.items, user?.id, user?.role]);

  const addToCart = (product, qty = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, qty } });
    dispatch({ type: 'OPEN_DRAWER' });
    toast.success(`${product.name} added to cart!`, { icon: '🛋️' });
  };

  const removeFromCart = (id, name) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast.error(`${name} removed`, {
      duration: 3000,
    });
  };

  const updateQty = (id, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleDrawer = () => dispatch({ type: 'TOGGLE_DRAWER' });
  const openDrawer = () => dispatch({ type: 'OPEN_DRAWER' });
  const closeDrawer = () => dispatch({ type: 'CLOSE_DRAWER' });

  // Derived values
  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + (i.discountPrice || i.price) * i.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        drawerOpen: state.drawerOpen,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleDrawer,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
