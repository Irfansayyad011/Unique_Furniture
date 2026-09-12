import { Helmet } from 'react-helmet-async';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_URL, CALL_URL } from '../utils/whatsappLink';
import './Contact.css';

const CONTACT_ITEMS = [
  {
    icon: <FiPhone size={24} />,
    label: 'Call Us',
    value: '+91 8888 909 095',
    href: CALL_URL,
    color: 'var(--brown)',
    bg: 'var(--cream)',
  },
  {
    icon: <FaWhatsapp size={24} />,
    label: 'WhatsApp',
    value: 'Chat with us anytime',
    href: WHATSAPP_URL,
    target: '_blank',
    color: '#25D366',
    bg: '#E8F5E9',
  },
  {
    icon: <FiMail size={24} />,
    label: 'Email',
    value: 'info@uniquefurniture.in',
    href: 'mailto:info@uniquefurniture.in',
    color: 'var(--brown)',
    bg: 'var(--cream)',
  },
  {
    icon: <FiMapPin size={24} />,
    label: 'Location',
    value: 'Near Wai, Satara, Maharashtra',
    href: 'https://maps.google.com/?q=Unique+Furniture+near+Wai+Maharashtra',
    target: '_blank',
    color: 'var(--brown)',
    bg: 'var(--cream)',
  },
  {
    icon: <FiClock size={24} />,
    label: 'Business Hours',
    value: 'Mon–Sat: 9am – 7pm',
    color: 'var(--brown)',
    bg: 'var(--cream)',
  },
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact — Unique Furniture near Wai</title>
        <meta name="description" content="Get in touch with Unique Furniture near Wai, Maharashtra. Call, WhatsApp, or visit our showroom." />
      </Helmet>

      <div className="page-header">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you — call, WhatsApp, or visit us!</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="contact-card">
                <div className="contact-card__icon"
                  style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div className="contact-card__body">
                  <p className="contact-card__label">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target={item.target} rel="noopener noreferrer"
                      className="contact-card__value contact-card__link">
                      {item.value}
                    </a>
                  ) : (
                    <p className="contact-card__value">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="contact-map">
            <iframe
              title="Unique Furniture Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60988.31!2d73.87!3d17.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc23f96c30fffff%3A0x854d2b9d2d59f0cc!2sWai%2C+Maharashtra!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>

          {/* Big CTAs */}
          <div className="contact-ctas">
            <a href={CALL_URL} className="btn btn-primary btn-lg contact-cta-btn">
              <FiPhone size={20} /> Call +91 8888 909 095
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg contact-cta-btn">
              <FaWhatsapp size={20} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
