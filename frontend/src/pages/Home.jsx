import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiPhone, FiTruck, FiAward, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { fetchProducts } from '../api';
import ProductCard from '../components/product/ProductCard';
import { WHATSAPP_URL, CALL_URL } from '../utils/whatsappLink';
import './Home.css';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1600&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600&q=80',
];

const FEATURES = [
  { icon: <FiAward size={28} />, title: 'Premium Quality', desc: 'Solid wood construction using sheesham, teak, and walnut — built to last generations.' },
  { icon: <FiTruck size={28} />, title: 'Delivery Available', desc: 'We deliver across Maharashtra. Discuss your location and we\'ll make it happen.' },
  { icon: <FiHeart size={28} />, title: 'Custom Orders', desc: 'Have a specific design in mind? We can craft bespoke furniture to match your vision.' },
  { icon: <FiPhone size={28} />, title: '24/7 Support', desc: 'Reach us anytime on WhatsApp or call. We\'re always here to help you choose.' },
];

const CATEGORIES = [
  { slug: 'sofa', label: 'Sofas', emoji: '🛋️', desc: 'Plush seating for your living room' },
  { slug: 'bed', label: 'Beds', emoji: '🛏️', desc: 'Sleep in style and comfort' },
  { slug: 'table', label: 'Tables', emoji: '🪑', desc: 'Dining & centre tables' },
  { slug: 'chair', label: 'Chairs', emoji: '💺', desc: 'Accent & ergonomic chairs' },
  { slug: 'wardrobe', label: 'Wardrobes', emoji: '🚪', desc: 'Spacious storage solutions' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featured, setFeatured] = useState([]);

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Fetch featured products
  useEffect(() => {
    fetchProducts({ featured: true, limit: 6 })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>Unique Furniture — Premium Furniture near Wai, Maharashtra</title>
        <meta name="description" content="Shop premium handcrafted furniture — sofas, beds, tables, chairs, wardrobes — at Unique Furniture near Wai, Maharashtra. Quality built to last." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero">
        <div className="hero__bg">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroIdx}
              src={HERO_IMAGES[heroIdx]}
              alt=""
              className="hero__bg-img"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
          <div className="hero__overlay" />
        </div>

        <div className="container hero__content">
          <motion.p
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🛋️ Premium Furniture · Near Wai, Maharashtra
          </motion.p>
          <motion.h1
            className="hero__headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Crafted for Your Home.<br />
            <span className="hero__headline-gold">Built to Last.</span>
          </motion.h1>
          <motion.p
            className="hero__subtext"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Discover premium handcrafted furniture that transforms your house into a home.
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Link to="/shop" className="btn btn-gold btn-lg" id="hero-explore-btn">
              Explore Collection <FiArrowRight size={18} />
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="btn btn-outline-white btn-lg" id="hero-whatsapp-btn">
              <FaWhatsapp size={18} /> Chat with Us
            </a>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="hero__dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`hero__dot ${i === heroIdx ? 'hero__dot--active' : ''}`}
              onClick={() => setHeroIdx(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <p className="text-gold" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Browse by Category
            </p>
            <h2>Find Your Perfect Piece</h2>
            <div className="divider" />
          </div>
          <motion.div
            className="categories-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.slug} variants={fadeUp}>
                <Link to={`/shop/${cat.slug}`} className="category-card">
                  <span className="category-card__emoji">{cat.emoji}</span>
                  <h3 className="category-card__name">{cat.label}</h3>
                  <p className="category-card__desc">{cat.desc}</p>
                  <span className="category-card__arrow"><FiArrowRight /></span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="section" style={{ background: 'var(--cream)' }}>
          <div className="container">
            <div className="section-title">
              <p className="text-gold" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Hand-Picked Selection
              </p>
              <h2>Featured Collection</h2>
              <div className="divider" />
              <p>Our most loved pieces — designed to impress, built to endure.</p>
            </div>
            <motion.div
              className="product-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {featured.map((p) => (
                <motion.div key={p._id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                View All Products <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Unique Furniture?</h2>
            <div className="divider" />
          </div>
          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {FEATURES.map((feat) => (
              <motion.div key={feat.title} className="feature-card" variants={fadeUp}>
                <div className="feature-card__icon">{feat.icon}</div>
                <h3 className="feature-card__title">{feat.title}</h3>
                <p className="feature-card__desc">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="container">
          <motion.div
            className="cta-banner__inner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Furnish Your Dream Home?</h2>
            <p>Visit us near Wai or get in touch today. We'll help you find the perfect furniture.</p>
            <div className="cta-banner__btns">
              <Link to="/shop" className="btn btn-gold btn-lg">
                Shop Now <FiArrowRight size={18} />
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="btn btn-outline-white btn-lg">
                <FaWhatsapp size={18} /> WhatsApp Us
              </a>
              <a href={CALL_URL} className="btn btn-outline-white btn-lg">
                <FiPhone size={18} /> +91 8888 909 095
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
