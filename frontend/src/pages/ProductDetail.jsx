import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { fetchProductById, fetchProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPercent } from '../utils/formatPrice';
import { buildProductEnquiryLink } from '../utils/whatsappLink';
import ProductCard from '../components/product/ProductCard';
import './ProductDetail.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (img) => (!img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    fetchProductById(id)
      .then(({ data }) => {
        setProduct(data.product);
        // Fetch related
        return fetchProducts({ category: data.product.category, limit: 4 });
      })
      .then(({ data }) => {
        setRelated(data.products.filter((p) => p._id !== id));
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pd-skeleton">
      <div className="container pd-skeleton__inner">
        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[100, 70, 50, 40, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: i === 0 ? 36 : 20, width: `${w}%`, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = discountPercent(product.price, product.discountPrice);
  const price = product.discountPrice || product.price;
  const enquiryLink = buildProductEnquiryLink(product);

  return (
    <>
      <Helmet>
        <title>{product.name} — Unique Furniture</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
      </Helmet>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Breadcrumb */}
        <button className="pd-back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="pd-layout">
          {/* Gallery */}
          <div className="pd-gallery">
            <motion.div className="pd-gallery__main" key={activeImg}>
              {product.images?.[activeImg] ? (
                <motion.img
                  src={getImg(product.images[activeImg])}
                  alt={product.name}
                  className="pd-gallery__main-img"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="pd-gallery__placeholder"><span>🛋️</span></div>
              )}
              {discount && <span className="badge badge-gold pd-gallery__discount">{discount}% OFF</span>}
            </motion.div>

            {product.images?.length > 1 && (
              <div className="pd-gallery__thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-gallery__thumb ${i === activeImg ? 'pd-gallery__thumb--active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={getImg(img)} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <span className="pd-info__category">{product.category}</span>
            <h1 className="pd-info__name">{product.name}</h1>

            {/* Stock */}
            <span className={`badge ${product.inStock ? 'badge-green' : 'badge-red'}`}>
              {product.inStock ? '✓ In Stock' : 'Out of Stock'}
            </span>

            {/* Price */}
            <div className="pd-info__pricing">
              <span className="pd-info__price">{formatPrice(price)}</span>
              {product.discountPrice && (
                <span className="pd-info__original">{formatPrice(product.price)}</span>
              )}
              {discount && (
                <span className="badge badge-gold">Save {discount}%</span>
              )}
            </div>

            <p className="pd-info__desc">{product.description}</p>

            {/* Qty + Actions */}
            {!isAdmin && product.inStock && (
              <div className="pd-info__actions">
                <div className="pd-qty">
                  <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <FiMinus size={16} />
                  </button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty((q) => q + 1)}>
                    <FiPlus size={16} />
                  </button>
                </div>

                <button
                  className="btn btn-primary pd-add-btn"
                  onClick={() => addToCart(product, qty)}
                  id="pd-add-to-cart"
                >
                  <FiShoppingCart size={18} />
                  Add to Cart
                </button>

                <a
                  href={enquiryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp pd-wa-btn"
                  id="pd-whatsapp-enquiry"
                >
                  <FaWhatsapp size={18} />
                  WhatsApp Enquiry
                </a>
              </div>
            )}

            {!isAdmin && !product.inStock && (
              <a href={enquiryLink} target="_blank" rel="noopener noreferrer"
                className="btn btn-whatsapp pd-wa-btn" style={{ marginTop: '1rem', width: 'fit-content' }}>
                <FaWhatsapp size={18} /> Ask for Availability
              </a>
            )}

            {/* Meta */}
            <div className="pd-info__meta">
              <div className="pd-meta-item">
                <span className="pd-meta-label">Category</span>
                <Link to={`/shop/${product.category}`} className="pd-meta-value pd-meta-link">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <div className="section-title" style={{ textAlign: 'left' }}>
              <h2>Related Products</h2>
              <div className="divider divider-left" />
            </div>
            <div className="product-grid">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
