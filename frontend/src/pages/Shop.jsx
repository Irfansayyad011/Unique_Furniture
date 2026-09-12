import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { fetchProducts } from '../api';
import ProductCard from '../components/product/ProductCard';
import './Shop.css';

const CATEGORIES = ['all', 'sofa', 'bed', 'table', 'chair', 'wardrobe', 'other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'oldest', label: 'Oldest First' },
];

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-md)' }} />
    <div style={{ padding: '1rem' }}>
      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 18, width: '85%', marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 22, width: '40%', marginBottom: 16, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 38, borderRadius: 999 }} />
    </div>
  </div>
);

export default function Shop() {
  const { category: catParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(catParam || searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12, sort };
      if (category && category !== 'all') params.category = category;
      if (search.trim()) params.search = search.trim();

      const { data } = await fetchProducts(params);
      if (pg === 1) {
        setProducts(data.products);
      } else {
        setProducts((prev) => [...prev, ...data.products]);
      }
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch {}
    setLoading(false);
  }, [category, sort, search]);

  useEffect(() => { load(1); }, [load]);

  // Update URL params
  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (sort !== 'newest') params.sort = sort;
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [category, sort, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const categoryLabel = category === 'all' ? 'All Products' :
    category.charAt(0).toUpperCase() + category.slice(1) + 's';

  return (
    <>
      <Helmet>
        <title>{categoryLabel} — Unique Furniture</title>
        <meta name="description" content={`Browse our ${categoryLabel.toLowerCase()} collection at Unique Furniture near Wai, Maharashtra.`} />
      </Helmet>

      {/* Page Header */}
      <div className="page-header">
        <h1>{categoryLabel}</h1>
        <p>{total > 0 ? `${total} product${total !== 1 ? 's' : ''} available` : 'Loading...'}</p>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Controls */}
        <div className="shop-controls">
          {/* Search */}
          <form className="shop-search" onSubmit={handleSearch}>
            <FiSearch size={18} className="shop-search__icon" />
            <input
              type="text"
              className="shop-search__input"
              placeholder="Search furniture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="shop-search-input"
            />
            {search && (
              <button type="button" className="shop-search__clear" onClick={() => setSearch('')}>
                <FiX size={16} />
              </button>
            )}
          </form>

          {/* Sort */}
          <select
            className="form-select shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            id="shop-sort-select"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Mobile filter button */}
          <button className="btn btn-outline btn-sm shop-filter-btn"
            onClick={() => setFilterOpen(true)}>
            <FiFilter size={16} /> Filter
          </button>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${category === cat ? 'category-pill--active' : ''}`}
              onClick={() => setCategory(cat)}
              id={`cat-pill-${cat}`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && page === 1 ? (
          <div className="product-grid">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="shop-empty">
            <span>😕</span>
            <h3>No products found</h3>
            <p>Try different search terms or browse all categories.</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <motion.div
              className="product-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </motion.div>

            {/* Load More */}
            {page < pages && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <button
                  className="btn btn-outline btn-lg"
                  onClick={() => load(page + 1)}
                  disabled={loading}
                  id="load-more-btn"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
