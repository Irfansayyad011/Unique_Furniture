import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingCart, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { WHATSAPP_URL } from '../../utils/whatsappLink';
import './Header.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();
  const { user, isAdmin, isOwner, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="container header__inner">
          {/* Logo */}
          <Link to="/" className="header__logo">
            <span className="logo-icon">🛋️</span>
            <span className="logo-text">
              <span className="logo-unique">Unique</span>
              <span className="logo-furniture">Furniture</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav hide-mobile">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className="header__nav-link header__nav-link--admin">
                Admin
              </NavLink>
            )}
            {isOwner && (
              <NavLink to="/owner/dashboard" className="header__nav-link header__nav-link--admin">
                Owner
              </NavLink>
            )}
            {user && (user.role === 'customer' || (!isAdmin && !isOwner)) && (
              <NavLink
                to="/my-orders"
                className={({ isActive }) =>
                  `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                }
              >
                My Orders
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="header__actions">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="header__wa-btn hide-mobile" aria-label="WhatsApp">
              <FaWhatsapp size={18} />
              <span>WhatsApp</span>
            </a>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'capitalize' }}>{user.username}</span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            )}

            <button
              id="cart-toggle-btn"
              className="header__cart-btn"
              onClick={openDrawer}
              aria-label="Open cart"
            >
              <FiShoppingCart size={22} />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="cart-badge"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            <button
              className="header__menu-btn hide-desktop"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="mobile-menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="mobile-menu__header">
                <span className="logo-text">
                  <span className="logo-unique">Unique</span>
                  <span className="logo-furniture"> Furniture</span>
                </span>
                <button onClick={() => setMenuOpen(false)}><FiX size={24} /></button>
              </div>
              <div className="mobile-menu__links">
                {NAV_LINKS.map(({ to, label }) => (
                  <NavLink key={to} to={to} end={to === '/'} className="mobile-menu__link">
                    {label}
                  </NavLink>
                ))}
                {user && (user.role === 'customer' || (!isAdmin && !isOwner)) && (
                  <NavLink to="/my-orders" className="mobile-menu__link">My Orders</NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin/dashboard" className="mobile-menu__link">Admin Panel</NavLink>
                )}
                {isOwner && (
                  <NavLink to="/owner/dashboard" className="mobile-menu__link">Owner Panel</NavLink>
                )}
                {user ? (
                  <button className="btn btn-ghost w-full" onClick={logout} style={{ justifyContent: 'center' }}>Logout</button>
                ) : (
                  <Link to="/login" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>Login / Register</Link>
                )}
              </div>
              <div className="mobile-menu__footer">
                <a href="tel:+918888909095" className="btn btn-outline w-full">
                  <FiPhone size={16} /> Call Us
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="btn btn-whatsapp w-full">
                  <FaWhatsapp size={16} /> WhatsApp
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
