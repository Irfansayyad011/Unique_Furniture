import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiLogOut, FiPackage, FiShoppingBag, FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  fetchProducts,
  deleteProduct,
  toggleProductStock,
  fetchOrders,
  updateOrderStatus,
  fetchOrderStats,
  listUsers,
  createOwnerAccount,
  updateUserStatus,
} from '../../api';
import { formatPrice } from '../../utils/formatPrice';
import './AdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [ownerForm, setOwnerForm] = useState({ username: '', password: '' });
  const [ownerError, setOwnerError] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPages, setOrderPages] = useState(1);

  const loadProducts = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await fetchProducts({ page: pg, limit: 20 });
      if (pg === 1) setProducts(data.products);
      else setProducts((prev) => [...prev, ...data.products]);
      setPages(data.pages);
      setPage(pg);
    } catch {}
    setLoading(false);
  };

  const loadOrders = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await fetchOrders({ page: pg, limit: 20 });
      if (pg === 1) setOrders(data.orders);
      else setOrders((prev) => [...prev, ...data.orders]);
      setOrderPages(data.pages);
      setOrderPage(pg);
    } catch {}
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const { data } = await fetchOrderStats();
      setStats(data);
    } catch {}
  };

  const loadUsers = async () => {
    try {
      const { data } = await listUsers();
      setUsers(data.users || []);
    } catch {}
  };

  useEffect(() => {
    loadProducts(1);
    loadStats();
    loadUsers();
  }, []);

  useEffect(() => {
    if (tab === 'orders') loadOrders(1);
    if (tab === 'users') loadUsers();
  }, [tab]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setDeleteConfirm(null);
    } catch {}
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleProductStock(id);
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, inStock: data.inStock } : p));
    } catch {}
  };

  const handleOrderStatus = async (id, status) => {
    try {
      const { data } = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? data.order : o));
    } catch {}
  };

  const handleCreateOwner = async (e) => {
    e.preventDefault();
    if (!ownerForm.username || !ownerForm.password) {
      setOwnerError('Username and password are required');
      return;
    }
    try {
      await createOwnerAccount(ownerForm);
      setOwnerForm({ username: '', password: '' });
      setOwnerError('');
      await loadUsers();
    } catch (err) {
      setOwnerError(err.response?.data?.message || 'Unable to create owner account');
    }
  };

  const handleUserToggle = async (id, active) => {
    try {
      const { data } = await updateUserStatus(id, active);
      setUsers((prev) => prev.map((u) => u.id === id ? data.user : u));
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet><title>Admin Dashboard — Unique Furniture</title></Helmet>

      <div className="admin-dash">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__logo">
            <span>🛋️</span>
            <div>
              <span className="sb-unique">Unique</span>
              <span className="sb-furniture"> Furniture</span>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            <button
              className={`admin-nav-btn ${tab === 'products' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setTab('products')}
            >
              <FiPackage size={18} /> Products
            </button>
            <button
              className={`admin-nav-btn ${tab === 'orders' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setTab('orders')}
            >
              <FiShoppingBag size={18} /> Orders
              {stats?.totalOrders > 0 && (
                <span className="admin-nav-badge">{stats.totalOrders}</span>
              )}
            </button>
            <button
              className={`admin-nav-btn ${tab === 'users' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setTab('users')}
            >
              <FiPackage size={18} /> Users
            </button>
          </nav>

          <div className="admin-sidebar__footer">
            <p className="admin-sidebar__user">{user?.email}</p>
            <button className="btn btn-ghost btn-sm admin-logout" onClick={handleLogout}>
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* Stats Bar */}
          {stats && (
            <div className="admin-stats">
              <div className="admin-stat-card">
                <FiPackage size={22} className="admin-stat-icon" />
                <div>
                  <p className="admin-stat-num">{products.length}</p>
                  <p className="admin-stat-label">Products</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <FiShoppingBag size={22} className="admin-stat-icon" />
                <div>
                  <p className="admin-stat-num">{stats.totalOrders}</p>
                  <p className="admin-stat-label">Orders</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <FiTrendingUp size={22} className="admin-stat-icon" />
                <div>
                  <p className="admin-stat-num">{formatPrice(stats.totalRevenue)}</p>
                  <p className="admin-stat-label">Revenue</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <FiAlertCircle size={22} className="admin-stat-icon admin-stat-icon--warn" />
                <div>
                  <p className="admin-stat-num">{products.filter((p) => !p.inStock).length}</p>
                  <p className="admin-stat-label">Out of Stock</p>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {tab === 'products' && (
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">Products</h2>
                <Link to="/admin/products/new" className="btn btn-primary btn-sm" id="add-product-btn">
                  <FiPlus size={16} /> Add Product
                </Link>
              </div>

              {loading && products.length === 0 ? (
                <div className="admin-loading">Loading products...</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="admin-product-cell">
                              <div className="admin-product-img">
                                {p.images?.[0]
                                  ? <img src={getImg(p.images[0])} alt={p.name} />
                                  : <span>🛋️</span>}
                              </div>
                              <span className="admin-product-name">{p.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-brown">{p.category}</span>
                          </td>
                          <td>
                            <div className="admin-price-cell">
                              <span>{formatPrice(p.discountPrice || p.price)}</span>
                              {p.discountPrice && (
                                <span className="admin-price-original">{formatPrice(p.price)}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className={`admin-toggle-btn ${p.inStock ? 'admin-toggle-btn--on' : 'admin-toggle-btn--off'}`}
                              onClick={() => handleToggle(p._id)}
                              title={p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                            >
                              {p.inStock
                                ? <><FiToggleRight size={20} /> In Stock</>
                                : <><FiToggleLeft size={20} /> Out of Stock</>}
                            </button>
                          </td>
                          <td>
                            <span className={`badge ${p.featured ? 'badge-gold' : 'badge-brown'}`}>
                              {p.featured ? '⭐ Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <Link
                                to={`/admin/products/${p._id}/edit`}
                                className="btn btn-outline btn-icon-sm"
                                title="Edit"
                                id={`edit-product-${p._id}`}
                              >
                                <FiEdit2 size={15} />
                              </Link>
                              <button
                                className="btn admin-delete-btn btn-icon-sm"
                                onClick={() => setDeleteConfirm(p)}
                                title="Delete"
                                id={`delete-product-${p._id}`}
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {page < pages && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => loadProducts(page + 1)}>
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">Orders & Enquiries</h2>
              </div>

              {loading && orders.length === 0 ? (
                <div className="admin-loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="admin-empty">No orders yet. They'll appear here once customers checkout.</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id}>
                          <td>
                            <div>
                              <p style={{ fontWeight: 600 }}>{o.customerName}</p>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{o.customerPhone}</p>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-brown">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--brown)' }}>
                            {formatPrice(o.totalAmount)}
                          </td>
                          <td>
                            <span className={`badge ${
                              o.status === 'delivered' ? 'badge-green' :
                              o.status === 'cancelled' ? 'badge-red' :
                              o.status === 'confirmed' ? 'badge-gold' : 'badge-brown'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            <select
                              className="form-select"
                              style={{ fontSize: '0.8rem', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)' }}
                              value={o.status}
                              onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {orderPage < orderPages && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => loadOrders(orderPage + 1)}>
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">Users & Owner Accounts</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem' }}>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id || u._id}>
                          <td>{u.username}</td>
                          <td><span className="badge badge-brown">{u.role}</span></td>
                          <td><span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleUserToggle(u.id || u._id, !u.active)}
                            >
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <form onSubmit={handleCreateOwner} className="pf-section" style={{ padding: '1rem' }}>
                  <h3 className="pf-section-title">Create Owner</h3>
                  {ownerError && <div className="admin-login__error">{ownerError}</div>}
                  <div className="form-group">
                    <label className="form-label" htmlFor="owner-user">Username</label>
                    <input id="owner-user" className="form-input" value={ownerForm.username} onChange={(e) => setOwnerForm({ ...ownerForm, username: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="owner-pass">Password</label>
                    <input id="owner-pass" type="password" className="form-input" value={ownerForm.password} onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: '1rem' }}>Create Owner Account</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <motion.div
            className="admin-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="admin-modal__actions">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn admin-delete-confirm-btn" onClick={() => handleDelete(deleteConfirm._id)}
                id="confirm-delete-btn">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
