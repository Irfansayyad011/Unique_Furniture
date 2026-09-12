import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_URL, CALL_URL } from '../utils/whatsappLink';
import './About.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us — Unique Furniture near Wai, Maharashtra</title>
        <meta name="description" content="Learn about Unique Furniture — a premium furniture store near Wai, Maharashtra crafting quality pieces for Indian homes." />
      </Helmet>

      {/* Hero */}
      <div className="page-header">
        <h1>Our Story</h1>
        <p>Crafting homes, one masterpiece at a time</p>
      </div>

      {/* Story Section */}
      <section className="section">
        <div className="container about-layout">
          <motion.div
            className="about-story"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.875rem' }}>
              Who We Are
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', margin: '0.75rem 0 0.5rem' }}>
              Unique Furniture — <br />Born from Passion
            </h2>
            <div className="divider divider-left" />
            <p className="about-story__para">
              Nestled near the scenic hills of Wai, Maharashtra, Unique Furniture was born from a simple belief: 
              every Indian home deserves furniture that is <strong>beautiful, durable, and affordable</strong>.
            </p>
            <p className="about-story__para">
              We work with master craftsmen who use solid teak, sheesham, walnut, and mango wood to create 
              pieces that are built to last generations. From plush sofas to hand-carved beds, every item in 
              our collection is a labour of love.
            </p>
            <p className="about-story__para">
              Whether you're furnishing a new home or upgrading a single room, we offer a personalised 
              experience — visit our showroom, browse online, or simply WhatsApp us. We're always happy to help.
            </p>

            <div className="about-badges">
              <div className="about-badge">
                <span className="about-badge__num">500+</span>
                <span className="about-badge__label">Happy Homes</span>
              </div>
              <div className="about-badge">
                <span className="about-badge__num">12+</span>
                <span className="about-badge__label">Years Experience</span>
              </div>
              <div className="about-badge">
                <span className="about-badge__num">100%</span>
                <span className="about-badge__label">Solid Wood</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
              alt="Furniture showroom"
              className="about-img"
            />
          </motion.div>
        </div>
      </section>

      {/* Map + Contact */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Find Us</h2>
            <div className="divider" />
            <p>Visit our showroom near Wai, Maharashtra — we'd love to meet you!</p>
          </div>
          <div className="about-map-layout">
            <div className="about-map">
              <iframe
                title="Unique Furniture Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60988.31!2d73.87!3d17.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc23f96c30fffff%3A0x854d2b9d2d59f0cc!2sWai%2C+Maharashtra!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
            <div className="about-contact-info">
              <h3>Contact Us</h3>
              <div className="about-contact-item">
                <div className="about-contact-icon"><FiPhone size={20} /></div>
                <div>
                  <p className="about-contact-label">Call Us</p>
                  <a href={CALL_URL} className="about-contact-value">+91 8888 909 095</a>
                </div>
              </div>
              <div className="about-contact-item about-contact-wa">
                <div className="about-contact-icon about-contact-icon--wa"><FaWhatsapp size={20} /></div>
                <div>
                  <p className="about-contact-label">WhatsApp</p>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                    className="about-contact-value">Chat with us</a>
                </div>
              </div>
              <div className="about-contact-item">
                <div className="about-contact-icon"><FiMapPin size={20} /></div>
                <div>
                  <p className="about-contact-label">Location</p>
                  <p className="about-contact-value">Near Wai, Satara District,<br />Maharashtra 412803</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={CALL_URL} className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
                  <FiPhone size={18} /> Call Now
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg" style={{ justifyContent: 'center' }}>
                  <FaWhatsapp size={18} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
