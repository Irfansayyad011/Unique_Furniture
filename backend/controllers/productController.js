const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

 
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    inStock,
    featured,
    search,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (category && category !== 'all') filter.category = category;
  if (inStock !== undefined) filter.inStock = inStock === 'true';
  if (featured !== undefined) filter.featured = featured === 'true';
  if (search) filter.$text = { $search: search };

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, inStock, featured } = req.body;

  const images = req.files
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : [];

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    category,
    images,
    inStock: inStock === 'false' ? false : true,
    featured: featured === 'true',
  });

  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, description, price, discountPrice, category, inStock, featured, removeImages } = req.body;

  const newImages = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

  let existingImages = [...product.images];
  if (removeImages) {
    const toRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
    toRemove.forEach((imgPath) => {
      const fullPath = path.join(__dirname, '..', imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });
    existingImages = existingImages.filter((img) => !toRemove.includes(img));
  }

  const updatedImages = [...existingImages, ...newImages];

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? Number(price) : product.price,
      discountPrice: discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : product.discountPrice,
      category: category || product.category,
      images: updatedImages,
      inStock: inStock !== undefined ? inStock === 'true' || inStock === true : product.inStock,
      featured: featured !== undefined ? featured === 'true' || featured === true : product.featured,
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, product: updated });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.images.forEach((imgPath) => {
    const fullPath = path.join(__dirname, '..', imgPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

exports.toggleStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.inStock = !product.inStock;
  await product.save();

  res.json({ success: true, inStock: product.inStock, product });
});

exports.toggleFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.featured = !product.featured;
  await product.save();

  res.json({ success: true, featured: product.featured, product });
});
