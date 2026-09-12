import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import './CartDrawer.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getImageSrc = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${API_BASE}${img}`;
};

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, removeFromCart, updateQty, subtotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            style={{ zIndex: 250 }}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="cart-drawer__header">
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <FiShoppingBag size={22} />
                <h2 className="cart-drawer__title">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="cart-drawer__count">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                )}
              </div>
              <button id="cart-close-btn" className="btn btn-ghost btn-icon" onClick={closeDrawer}>
                <FiX size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="cart-drawer__body">
              {items.length === 0 ? (
                <div className="cart-drawer__empty">
                  <span className="cart-drawer__empty-icon">🛋️</span>
                  <p>Your cart is empty</p>
                  <Link to="/shop" className="btn btn-primary btn-sm" onClick={closeDrawer}>
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="cart-drawer__items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item._id}
                        className="cart-item"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* Image */}
                        <div className="cart-item__img">
                          {item.images?.[0] ? (
                            <img src={getImageSrc(item.images[0])} alt={item.name} />
                          ) : (
                            <span>🛋️</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="cart-item__info">
                          <p className="cart-item__name">{item.name}</p>
                          <p className="cart-item__unit-price">
                            {formatPrice(item.discountPrice || item.price)} each
                          </p>

                          {/* Qty controls */}
                          <div className="cart-item__controls">
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(item._id, item.qty - 1)}
                              aria-label="Decrease quantity"
                            >−</button>
                            <span className="qty-value">{item.qty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(item._id, item.qty + 1)}
                              aria-label="Increase quantity"
                            >+</button>
                          </div>
                        </div>

                        {/* Subtotal + Remove */}
                        <div className="cart-item__right">
                          <p className="cart-item__subtotal">
                            {formatPrice((item.discountPrice || item.price) * item.qty)}
                          </p>
                          <button
                            className="cart-item__remove"
                            onClick={() => removeFromCart(item._id, item.name)}
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-drawer__total">
                  <span>Subtotal</span>
                  <span className="cart-drawer__total-price">{formatPrice(subtotal)}</span>
                </div>
                <p className="cart-drawer__note">Taxes and delivery calculated at checkout</p>
                <Link
                  to="/checkout"
                  className="btn btn-primary btn-lg w-full"
                  style={{ justifyContent: 'center' }}
                  onClick={closeDrawer}
                  id="proceed-checkout-btn"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/cart"
                  className="btn btn-ghost w-full"
                  style={{ justifyContent: 'center' }}
                  onClick={closeDrawer}
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
