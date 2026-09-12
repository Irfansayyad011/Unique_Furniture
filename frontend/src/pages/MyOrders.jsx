import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiClock, FiShoppingBag, FiArrowRight, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchMyOrders } from '../api';
import { formatPrice } from '../utils/formatPrice';
import './MyOrders.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(({ data }) => {
        setOrders(data.orders || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load your orders');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>My Orders — Unique Furniture</title>
        <meta name="description" content="View and track all furniture orders placed from your Unique Furniture account." />
      </Helmet>

      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track and view all furniture orders placed from your account</p>
      </div>

      <div className="container my-orders-page">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="my-orders-empty">
            <span>📦</span>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Browse our handcrafted furniture collection to find your perfect piece!</p>
            <Link to="/shop" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
              <FiShoppingBag size={18} /> Browse Collection
            </Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {orders.map((order) => (
              <div key={order._id} className="my-order-card">
                {/* Order Header */}
                <div className="my-order-header">
                  <div className="my-order-meta">
                    <span className="my-order-date">
                      <FiClock size={16} />
                      {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                    </span>
                    <span className={`my-order-status-badge my-order-status--${order.status || 'pending'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Order ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-dark)' }}>#{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="my-order-items">
                  {order.items?.map((item, idx) => {
                    const imgUrl = item.image || item.product?.images?.[0];
                    const price = item.price || item.product?.price || 0;
                    const name = item.name || item.product?.name || 'Product';
                    const productId = item.product?._id || (typeof item.product === 'string' ? item.product : null);

                    return (
                      <div key={idx} className="my-order-item-row">
                        <div className="my-order-item-img">
                          {imgUrl ? (
                            <img src={getImg(imgUrl)} alt={name} />
                          ) : (
                            <span>🛋️</span>
                          )}
                        </div>
                        <div className="my-order-item-info">
                          {productId ? (
                            <Link to={`/product/${productId}`} className="my-order-item-name">
                              {name}
                            </Link>
                          ) : (
                            <span className="my-order-item-name">{name}</span>
                          )}
                          <span className="my-order-item-qty">
                            Quantity: {item.qty} × {formatPrice(price)}
                          </span>
                        </div>
                        <div className="my-order-item-price">
                          {formatPrice(price * item.qty)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="my-order-footer">
                  <div className="my-order-footer-details">
                    {order.customerPhone && <span>📞 Contact: {order.customerPhone}</span>}
                    {order.notes && <span>📝 Notes: {order.notes}</span>}
                  </div>
                  <div className="my-order-total">
                    Total: {formatPrice(order.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
