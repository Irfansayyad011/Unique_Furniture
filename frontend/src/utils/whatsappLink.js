const PHONE = '918888909095';

/**
 * Build a WhatsApp deep link pre-filled with cart message
 */
export const buildWhatsAppOrderLink = (cartItems, customerName = '') => {
  const lines = cartItems.map(
    (item) =>
      `• ${item.name} x${item.qty} — ₹${(
        (item.discountPrice || item.price) * item.qty
      ).toLocaleString('en-IN')}`
  );

  const total = cartItems.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.qty,
    0
  );

  const message = [
    `🛋️ *New Order Enquiry — Unique Furniture*`,
    customerName ? `👤 Customer: ${customerName}` : '',
    ``,
    `*Items:*`,
    ...lines,
    ``,
    `*Total: ₹${total.toLocaleString('en-IN')}*`,
    ``,
    `Please confirm availability and delivery details.`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
};

/**
 * Simple enquiry link for a single product
 */
export const buildProductEnquiryLink = (product) => {
  const message = `Hi! I'm interested in *${product.name}* (₹${(
    product.discountPrice || product.price
  ).toLocaleString('en-IN')}). Please share more details and availability.`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
};

export const WHATSAPP_URL = `https://wa.me/${PHONE}`;
export const CALL_URL = 'tel:+918888909095';
export const INSTAGRAM_URL = 'https://www.instagram.com/unique_furniture711/';
