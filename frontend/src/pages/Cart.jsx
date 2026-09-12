import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import './Cart.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

export default function Cart() {
  const { items, removeFromCart, updateQty, subtotal, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart — Unique Furniture</title></Helmet>
        <div className="page-header">
          <h1>Shopping Cart</h1>
        </div>
        <div className="container cart-empty">
          <span>🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add some beautiful furniture to get started!</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Browse Collection <FiArrowRight size={18} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Cart ({itemCount}) — Unique Furniture</title></Helmet>

      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="container cart-layout">
        {/* Items */}
        <div className="cart-items-list">
          <div className="cart-list-header">
            <h3>Items</h3>
            <button className="btn btn-ghost btn-sm" onClick={clearCart}>
              <FiTrash2 size={14} /> Clear All
            </button>
          </div>

          {items.map((item) => (
            <motion.div
              key={item._id}
              className="cart-row"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {/* Image */}
              <div className="cart-row__img">
                {item.images?.[0] ? (
                  <img src={getImg(item.images[0])} alt={item.name} />
                ) : (
                  <span>🛋️</span>
                )}
              </div>

              {/* Details */}
              <div className="cart-row__details">
                <Link to={`/product/${item._id}`} className="cart-row__name">{item.name}</Link>
                <span className="cart-row__unit">
                  {formatPrice(item.discountPrice || item.price)} each
                </span>
                <div className="cart-row__controls">
                  <button className="qty-btn"
                    onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                  <span className="qty-value">{item.qty}</span>
                  <button className="qty-btn"
                    onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="cart-row__right">
                <span className="cart-row__subtotal">
                  {formatPrice((item.discountPrice || item.price) * item.qty)}
                </span>
                <button className="cart-row__remove"
                  onClick={() => removeFromCart(item._id, item.name)}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary-box">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery</span>
            <span className="text-gold">Calculated at checkout</span>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-lg w-full"
            style={{ justifyContent: 'center' }} id="cart-checkout-btn">
            Proceed to Checkout <FiArrowRight size={18} />
          </Link>
          <Link to="/shop" className="btn btn-ghost w-full"
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
