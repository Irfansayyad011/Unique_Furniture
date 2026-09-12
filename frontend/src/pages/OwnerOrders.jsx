import { useEffect, useState, useMemo } from 'react';
import {
  FiArrowLeft,
  FiSearch,
  FiClock,
  FiUser,
  FiShoppingBag,
  FiChevronDown,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchOrders, fetchOrdersByCustomer, updateOrderStatus } from '../api';
import { formatPrice } from '../utils/formatPrice';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: { bg: '#FFF3E0', color: '#E65100', label: 'Pending' },
  confirmed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Confirmed' },
  delivered: { bg: '#E3F2FD', color: '#1565C0', label: 'Delivered' },
  cancelled: { bg: '#FFEBEE', color: '#C62828', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

function StatusSelect({ currentStatus, orderId, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      onUpdate(orderId, newStatus);
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={updating}
        style={{
          appearance: 'none',
          padding: '4px 28px 4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          border: `1.5px solid ${STATUS_COLORS[currentStatus]?.color || '#ccc'}`,
          background: STATUS_COLORS[currentStatus]?.bg || '#f5f5f5',
          color: STATUS_COLORS[currentStatus]?.color || '#333',
          cursor: updating ? 'wait' : 'pointer',
          outline: 'none',
        }}
      >
        {['pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <FiChevronDown
        size={14}
        style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: STATUS_COLORS[currentStatus]?.color || '#333' }}
      />
    </div>
  );
}

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

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Customer detail view
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      params.limit = 100;
      const { data } = await fetchOrders(params);
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    // Also update in customer detail view if open
    setCustomerOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleCustomerClick = async (customerName) => {
    setSelectedCustomer(customerName);
    setCustomerLoading(true);
    try {
      const { data } = await fetchOrdersByCustomer(customerName);
      setCustomerOrders(data.orders);
    } catch (err) {
      toast.error('Failed to load customer orders');
      setCustomerOrders([]);
    } finally {
      setCustomerLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q))
    );
  }, [orders, search]);

  // ---- Customer Detail View ----
  if (selectedCustomer) {
    return (
      <>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setSelectedCustomer(null);
            setCustomerOrders([]);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--brown)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}
        >
          <FiArrowLeft size={16} /> Back to All Orders
        </button>

        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiUser size={20} /> {selectedCustomer}'s Orders
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {customerLoading ? (
            <div className="admin-loading">Loading customer orders...</div>
          ) : customerOrders.length === 0 ? (
            <div className="admin-empty">
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
              <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No orders found for this customer</p>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {customerOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    border: '1px solid var(--cream-dark)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Order Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      padding: '1rem 1.25rem',
                      background: 'var(--cream)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <FiClock size={14} />
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>
                        {formatPrice(order.totalAmount)}
                      </span>
                      <StatusSelect
                        currentStatus={order.status}
                        orderId={order._id}
                        onUpdate={handleStatusUpdate}
                      />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '0.75rem 1.25rem' }}>
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.625rem 0',
                          borderBottom: idx < order.items.length - 1 ? '1px solid var(--cream-dark)' : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--cream)',
                            overflow: 'hidden',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                          }}
                        >
                          {item.image ? (
                            <img
                              src={getImg(item.image)}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span>🛋️</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9375rem', margin: 0 }}>
                            {item.name || 'Product'}
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Qty: {item.qty} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  {(order.customerPhone || order.customerEmail || order.notes) && (
                    <div
                      style={{
                        padding: '0.75rem 1.25rem',
                        borderTop: '1px solid var(--cream-dark)',
                        background: 'var(--cream)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {order.customerPhone && <span>📞 {order.customerPhone}</span>}
                      {order.customerEmail && <span>✉️ {order.customerEmail}</span>}
                      {order.notes && <span>📝 {order.notes}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // ---- Orders List View ----
  return (
    <>
      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FiShoppingBag size={28} /></div>
          <div>
            <p className="admin-stat-num">{orders.length}</p>
            <p className="admin-stat-label">Total Orders</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#E65100' }}><FiClock size={28} /></div>
          <div>
            <p className="admin-stat-num">{orders.filter((o) => o.status === 'pending').length}</p>
            <p className="admin-stat-label">Pending</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: 'var(--success)' }}><FiShoppingBag size={28} /></div>
          <div>
            <p className="admin-stat-num">{orders.filter((o) => o.status === 'confirmed').length}</p>
            <p className="admin-stat-label">Confirmed</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#1565C0' }}><FiShoppingBag size={28} /></div>
          <div>
            <p className="admin-stat-num">{orders.filter((o) => o.status === 'delivered').length}</p>
            <p className="admin-stat-label">Delivered</p>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="admin-panel__title">Customer Orders</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Review and manage orders placed by customers. Click a customer name to view their order details.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--cream-dark)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by customer name, phone, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', paddingRight: '1rem', height: '38px', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '999px', fontSize: '0.8125rem', textTransform: 'capitalize', padding: '4px 12px' }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
            <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No orders found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {orders.length === 0
                ? 'Orders will appear here when customers place them.'
                : 'Try changing your search or status filter.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleCustomerClick(order.customerName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--brown)',
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                          padding: 0,
                          textAlign: 'left',
                        }}
                        title={`View all orders by ${order.customerName}`}
                      >
                        {order.customerName}
                      </button>
                      {order.customerPhone && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {order.customerPhone}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{formatDate(order.createdAt)}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem' }}>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </span>
                      {order.items?.length > 0 && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.items.map((i) => i.name).join(', ')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</span>
                    </td>
                    <td>
                      <StatusSelect
                        currentStatus={order.status}
                        orderId={order._id}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
