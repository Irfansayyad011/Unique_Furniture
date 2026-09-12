/**
 * Format price in Indian Rupees
 */
export const formatPrice = (price) => {
  if (price == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Calculate discount percentage
 */
export const discountPercent = (original, discounted) => {
  if (!discounted || discounted >= original) return null;
  return Math.round(((original - discounted) / original) * 100);
};
