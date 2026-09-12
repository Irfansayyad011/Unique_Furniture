import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, discountPercent } from '../../utils/formatPrice';
import './ProductCard.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getImageSrc = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${API_BASE}${img}`;
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const [imgError, setImgError] = useState(false);

  const price = product.discountPrice || product.price;
  const discount = discountPercent(product.price, product.discountPrice);
  const firstImage = product.images?.[0];

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Image */}
      <Link to={`/product/${product._id}`} className="product-card__img-wrap">
        {firstImage && !imgError ? (
          <img
            src={getImageSrc(firstImage)}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-card__img-placeholder">
            <span>🛋️</span>
          </div>
        )}

        {/* Badges */}
        <div className="product-card__badges">
          {!product.inStock && (
            <span className="badge badge-red">Out of Stock</span>
          )}
          {discount && product.inStock && (
            <span className="badge badge-gold">{discount}% OFF</span>
          )}
          {product.featured && product.inStock && (
            <span className="badge badge-brown">Featured</span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="product-card__overlay">
          <FiEye size={20} />
          <span>Quick View</span>
        </div>
      </Link>

      {/* Info */}
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        <div className="product-card__pricing">
          <span className="product-card__price">{formatPrice(price)}</span>
          {product.discountPrice && (
            <span className="product-card__original">{formatPrice(product.price)}</span>
          )}
        </div>

        {!isAdmin && (
          <button
            type="button"
            className={`btn btn-primary btn-sm product-card__cta ${!product.inStock ? 'btn-disabled' : ''}`}
            onClick={() => product.inStock && addToCart(product)}
            disabled={!product.inStock}
            id={`add-to-cart-${product._id}`}
          >
            <FiShoppingCart size={15} />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
