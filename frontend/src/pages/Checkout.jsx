import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api';
import { formatPrice } from '../utils/formatPrice';
import { buildWhatsAppOrderLink } from '../utils/whatsappLink';
import './Checkout.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (items.length === 0 && !done) {
    return (
      <div className="container checkout-empty">
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary">Browse Collection</Link>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid 10-digit Indian mobile number';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Save to DB
      const orderItems = items.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.images?.[0] || '',
        price: item.discountPrice || item.price,
        qty: item.qty,
      }));

      await createOrder({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        notes: form.notes,
        items: orderItems,
        totalAmount: subtotal,
      });

      setDone(true);
      clearCart();

      // Redirect to WhatsApp
      const waLink = buildWhatsAppOrderLink(items, form.name);
      window.open(waLink, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try WhatsApp directly.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="container checkout-success">
        <div className="checkout-success__box">
          <div className="checkout-success__icon"><FiCheck size={32} /></div>
          <h2>Order Placed! 🎉</h2>
          <p>Your enquiry has been saved. We've opened WhatsApp for you to confirm your order.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
            <Link to="/" className="btn btn-ghost">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout — Unique Furniture</title>
        <meta name="description" content="Complete your furniture order with Unique Furniture near Wai, Maharashtra." />
      </Helmet>

      <div className="page-header">
        <h1>Checkout</h1>
        <p>Fill in your details and we'll confirm your order on WhatsApp</p>
      </div>

      <div className="container checkout-layout">
        {/* Form */}
        <div className="checkout-form-box">
          <button className="pd-back" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
            <FiArrowLeft size={16} /> Back to Cart
          </button>

          <h3 className="checkout-section-title">Your Details</h3>
          <form onSubmit={handleSubmit} className="checkout-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-name">Full Name *</label>
              <input id="checkout-name" name="name" className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-phone">Phone Number *</label>
              <input id="checkout-phone" name="phone" type="tel" className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-email">Email (optional)</label>
              <input id="checkout-email" name="email" type="email" className="form-input"
                placeholder="your@email.com" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-notes">Notes / Special Requirements</label>
              <textarea id="checkout-notes" name="notes" className="form-textarea"
                placeholder="Delivery address, colour preferences, etc." value={form.notes} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-whatsapp btn-lg w-full" 
              disabled={loading} id="checkout-submit-btn"
              style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              <FaWhatsapp size={20} />
              {loading ? 'Placing Order...' : 'Place Order & Open WhatsApp'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h3 className="checkout-section-title">Order Summary</h3>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={item._id} className="checkout-item">
                <div className="checkout-item__img">
                  {item.images?.[0]
                    ? <img src={getImg(item.images[0])} alt={item.name} />
                    : <span>🛋️</span>}
                </div>
                <div className="checkout-item__info">
                  <p className="checkout-item__name">{item.name}</p>
                  <p className="checkout-item__qty">Qty: {item.qty}</p>
                </div>
                <span className="checkout-item__price">
                  {formatPrice((item.discountPrice || item.price) * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="checkout-total-row"><span>Delivery</span><span className="text-gold">To be confirmed</span></div>
            <div className="checkout-total-row checkout-total-row--final">
              <span>Total</span><span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
