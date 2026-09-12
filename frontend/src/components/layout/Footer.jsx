import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { WHATSAPP_URL, CALL_URL, INSTAGRAM_URL } from '../../utils/whatsappLink';
import './Footer.css';

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop All' },
  { to: '/shop/sofa', label: 'Sofas' },
  { to: '/shop/bed', label: 'Beds' },
  { to: '/shop/table', label: 'Tables' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__col footer__brand">
            <div className="footer__logo">
              <span>🛋️</span>
              <div>
                <span className="footer__logo-unique">Unique</span>
                <span className="footer__logo-furniture"> Furniture</span>
              </div>
            </div>
            <p className="footer__tagline">
              Crafted for your home. Built to last. Premium furniture from the heart of Maharashtra.
            </p>
            <div className="footer__socials">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="footer__social-btn footer__social-wa" aria-label="WhatsApp">
                <FaWhatsapp size={18} />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="footer__social-btn footer__social-ig" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="footer__social-btn footer__social-fb" aria-label="Facebook">
                <FaFacebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="footer__link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Get In Touch</h4>
            <ul className="footer__contact-list">
              <li>
                <a href={CALL_URL} className="footer__contact-item">
                  <FiPhone size={16} />
                  <span>+91 8888 909 095</span>
                </a>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="footer__contact-item footer__wa-link">
                  <FaWhatsapp size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@uniquefurniture.in" className="footer__contact-item">
                  <FiMail size={16} />
                  <span>info@uniquefurniture.in</span>
                </a>
              </li>
              <li>
                <div className="footer__contact-item">
                  <FiMapPin size={16} />
                  <span>Near Wai, Maharashtra, India</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div className="footer__col footer__map-col">
            <h4 className="footer__heading">Find Us</h4>
            <div className="footer__map">
              <iframe
                title="Unique Furniture near Wai"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30614.48!2d73.87!3d17.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sUnique+Furniture+near+Wai!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Unique Furniture. All rights reserved.</p>
          <p>2026 Unique Furniture | Designed & Developed with ❤️ by Irfan Sayyad</p>
        </div>
      </div>
    </footer>
  );
}
