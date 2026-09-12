import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiPackage,
  FiStar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiSearch,
  FiEye,
  FiShoppingBag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, deleteProduct, toggleFeaturedProduct, toggleProductStock } from '../api';
import { formatPrice } from '../utils/formatPrice';
import OwnerOrders from './OwnerOrders';
import './admin/AdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

const CATEGORIES = ['all', 'sofa', 'bed', 'table', 'chair', 'wardrobe', 'other'];

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    try {
      const { data } = await fetchProducts({ limit: 100, sort: 'newest' });
      setProducts(data.products);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteModalId);
      setProducts((prev) => prev.filter((p) => p._id !== deleteModalId));
      toast.success('Product deleted successfully');
      setDeleteModalId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleFeatured = async (id) => {
    try {
      const { data } = await toggleFeaturedProduct(id);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, featured: data.featured } : p))
      );
      toast.success(data.featured ? 'Added to Highlights' : 'Removed from Highlights');
    } catch (err) {
      toast.error('Failed to update highlight status');
    }
  };

  const handleStock = async (id) => {
    try {
      const { data } = await toggleProductStock(id);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, inStock: data.inStock } : p))
      );
      toast.success(data.inStock ? 'Marked In Stock' : 'Marked Out of Stock');
    } catch (err) {
      toast.error('Failed to update stock status');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCat === 'all' || p.category === selectedCat;
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCat, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const highlighted = products.filter((p) => p.featured).length;
    return { total, inStock, highlighted };
  }, [products]);

  const productToDelete = products.find((p) => p._id === deleteModalId);

  return (
    <>
      <Helmet>
        <title>{activeTab === 'orders' ? 'Orders' : 'Products'} — Owner Dashboard — Unique Furniture</title>
      </Helmet>
      <div className="admin-dash">
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
              className={`admin-nav-btn ${activeTab === 'products' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <FiPackage size={18} /> Products
            </button>
            <button
              className={`admin-nav-btn ${activeTab === 'orders' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingBag size={18} /> Orders
            </button>
            <Link to="/shop" className="admin-nav-btn" target="_blank" rel="noopener noreferrer">
              <FiEye size={18} /> View Shop
            </Link>
          </nav>

          <div className="admin-sidebar__footer">
            <p className="admin-sidebar__user">Owner: {user?.username}</p>
            <button className="btn btn-ghost btn-sm admin-logout" onClick={handleLogout}>
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {activeTab === 'orders' ? (
            <OwnerOrders />
          ) : (
            <>
              {/* Stats Header */}
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon"><FiPackage size={28} /></div>
                  <div>
                    <p className="admin-stat-num">{stats.total}</p>
                    <p className="admin-stat-label">Total Products</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ color: 'var(--success)' }}><FiCheck size={28} /></div>
                  <div>
                    <p className="admin-stat-num">{stats.inStock}</p>
                    <p className="admin-stat-label">In Stock</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ color: 'var(--gold-dark)' }}><FiStar size={28} /></div>
                  <div>
                    <p className="admin-stat-num">{stats.highlighted}</p>
                    <p className="admin-stat-label">Highlights (Featured)</p>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel__header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 className="admin-panel__title">Furniture Product Management</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Manage items, prices, images, stock, and highlights visible on the Customer Shop page.
                    </p>
                  </div>
                  <Link to="/owner/products/new" className="btn btn-primary btn-sm">
                    <FiPlus size={16} /> Add Product
                  </Link>
                </div>

                {/* Filter & Search Bar */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--cream-dark)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                    <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search products by name or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '2.25rem', paddingRight: '1rem', height: '38px', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '2px' }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`btn btn-sm ${selectedCat === cat ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ borderRadius: '999px', fontSize: '0.8125rem', textTransform: 'capitalize', padding: '4px 12px' }}
                        onClick={() => setSelectedCat(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="admin-loading">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="admin-empty">
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🛋️</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No products found</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {products.length === 0
                        ? 'Start by creating your first furniture product!'
                        : 'Try changing your search or category filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock Status</th>
                          <th>Highlights</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr key={p._id}>
                            <td>
                              <div className="admin-product-cell">
                                <div className="admin-product-img">
                                  {p.images?.[0] ? (
                                    <img src={getImg(p.images[0])} alt={p.name} />
                                  ) : (
                                    <span>🛋️</span>
                                  )}
                                </div>
                                <div>
                                  <span className="admin-product-name">{p.name}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {p.images?.length || 0} image{p.images?.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-brown" style={{ textTransform: 'capitalize' }}>
                                {p.category}
                              </span>
                            </td>
                            <td>
                              <div className="admin-price-cell">
                                <span style={{ fontWeight: 600 }}>{formatPrice(p.discountPrice || p.price)}</span>
                                {p.discountPrice && (
                                  <span className="admin-price-original">{formatPrice(p.price)}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`admin-toggle-btn ${
                                  p.inStock ? 'admin-toggle-btn--on' : 'admin-toggle-btn--off'
                                }`}
                                onClick={() => handleStock(p._id)}
                                title="Click to toggle stock status"
                              >
                                {p.inStock ? (
                                  <>
                                    <FiCheck size={15} /> In Stock
                                  </>
                                ) : (
                                  <>
                                    <FiX size={15} /> Out of Stock
                                  </>
                                )}
                              </button>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`admin-toggle-btn ${
                                  p.featured ? 'admin-toggle-btn--on' : 'admin-toggle-btn--off'
                                }`}
                                onClick={() => handleFeatured(p._id)}
                                title="Click to toggle Highlight / Featured status"
                              >
                                <FiStar size={15} />
                                {p.featured ? 'Highlighted' : 'Not Highlighted'}
                              </button>
                            </td>
                            <td>
                              <div className="admin-actions">
                                <Link
                                  to={`/owner/products/${p._id}/edit`}
                                  className="btn btn-outline btn-icon-sm"
                                  title="Edit product details, price & images"
                                >
                                  <FiEdit2 size={15} />
                                </Link>
                                <button
                                  type="button"
                                  className="btn admin-delete-btn btn-icon-sm"
                                  onClick={() => setDeleteModalId(p._id)}
                                  title="Delete product"
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
              </div>
            </>
          )}
        </main>

        {/* Delete Confirmation Modal */}
        {deleteModalId && (
          <div className="admin-modal-overlay" onClick={() => setDeleteModalId(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Product</h3>
              <p>
                Are you sure you want to delete <strong>&quot;{productToDelete?.name}&quot;</strong>? This action cannot be undone and will remove it from the Customer Shop page.
              </p>
              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setDeleteModalId(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn admin-delete-confirm-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
