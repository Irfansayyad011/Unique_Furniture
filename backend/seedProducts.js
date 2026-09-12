require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

const products = [
  {
    name: 'Royal Walnut Sofa Set',
    description: 'A majestic 3-seater sofa crafted from solid walnut wood with premium velvet upholstery. The deep walnut finish brings warmth and elegance to any living room. Cushions are high-density foam encased in rich burgundy velvet for maximum comfort.',
    price: 85000,
    discountPrice: 75000,
    category: 'sofa',
    images: [],
    inStock: true,
    featured: true,
  },
  {
    name: 'Comfort Cloud L-Shape Sofa',
    description: 'Spacious L-shaped sectional sofa with premium leatherette upholstery. Ideal for large living rooms. Features chaise lounge, cup holders, and hidden storage. Available in cream and charcoal.',
    price: 120000,
    discountPrice: 105000,
    category: 'sofa',
    images: [],
    inStock: true,
    featured: true,
  },
  {
    name: 'Heritage Teak King Bed',
    description: 'Solid teak wood king-size bed with intricate hand-carved headboard. Built to last generations. The rich golden-brown teak finish is treated with natural oil for protection and shine. Mattress not included.',
    price: 95000,
    discountPrice: 85000,
    category: 'bed',
    images: [],
    inStock: true,
    featured: true,
  },
  {
    name: 'Minimalist Platform Bed',
    description: 'Low-profile platform bed with sleek walnut veneer finish. Clean lines and floating design make this bed a statement piece in any modern bedroom. Available in queen and king sizes.',
    price: 55000,
    discountPrice: null,
    category: 'bed',
    images: [],
    inStock: true,
    featured: false,
  },
  {
    name: 'Executive Dining Table (6-Seater)',
    description: 'Rectangular dining table made from solid sheesham wood with a natural finish. Seats 6 comfortably. The live-edge design gives each table a unique, one-of-a-kind look. Chairs sold separately.',
    price: 65000,
    discountPrice: 58000,
    category: 'table',
    images: [],
    inStock: true,
    featured: true,
  },
  {
    name: 'Rustic Coffee Table',
    description: 'Solid mango wood coffee table with a distressed finish that adds a rustic charm to living spaces. Features a lower shelf for storage. Dimensions: 120cm x 60cm x 45cm.',
    price: 18000,
    discountPrice: 15500,
    category: 'table',
    images: [],
    inStock: true,
    featured: false,
  },
  {
    name: 'Ergonomic Study Chair',
    description: 'High-back study and work chair with adjustable lumbar support and armrests. Upholstered in breathable mesh fabric. 360° swivel with smooth-rolling casters. Perfect for home offices.',
    price: 12000,
    discountPrice: 9999,
    category: 'chair',
    images: [],
    inStock: true,
    featured: false,
  },
  {
    name: 'Maharaja Rocking Chair',
    description: 'Traditional rocking chair crafted from solid teak with hand-woven cane seat and backrest. A timeless piece that brings comfort and classic Indian craftsmanship to any space.',
    price: 22000,
    discountPrice: 19000,
    category: 'chair',
    images: [],
    inStock: true,
    featured: false,
  },
  {
    name: 'Grand Wardrobe (6-Door)',
    description: 'Spacious 6-door wardrobe with full-length mirrors on 2 doors. Includes hanging space, shelves, and drawers. Made from engineered wood with a premium walnut laminate finish. Anti-rust hardware.',
    price: 78000,
    discountPrice: 68000,
    category: 'wardrobe',
    images: [],
    inStock: true,
    featured: true,
  },
  {
    name: 'Sliding Door Wardrobe',
    description: 'Modern 3-door sliding wardrobe with glossy white exterior and internal organization system. Space-saving sliding doors with soft-close mechanism. Includes 2 drawers, 4 shelves, hanging rod.',
    price: 52000,
    discountPrice: 45000,
    category: 'wardrobe',
    images: [],
    inStock: false,
    featured: false,
  },
  {
    name: 'Sheesham Wood Centre Table',
    description: 'Round centre table crafted from pure sheesham (Indian rosewood) with a polished natural finish. The grain patterns are unique to each piece. Dimensions: 90cm diameter x 45cm height.',
    price: 14000,
    discountPrice: 12500,
    category: 'table',
    images: [],
    inStock: true,
    featured: false,
  },
  {
    name: 'Velvet Accent Chair',
    description: 'Luxurious accent chair upholstered in rich emerald velvet with solid brass-finish legs. A showstopper for any corner of your home. High-density foam cushion ensures lasting comfort.',
    price: 16000,
    discountPrice: 13999,
    category: 'chair',
    images: [],
    inStock: true,
    featured: true,
  },
];

const seedProducts = async () => {
  await connectDB();

  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`⚠️  Database already has ${count} products. Skipping seed.`);
    console.log('   To reseed, delete existing products first.');
    process.exit(0);
  }

  await Product.insertMany(products);
  console.log(`✅ Successfully seeded ${products.length} products!`);
  process.exit(0);
};

seedProducts().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
