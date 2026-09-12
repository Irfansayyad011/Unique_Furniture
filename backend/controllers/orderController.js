const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
 
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, customerEmail, items, totalAmount, notes } = req.body;

  if (!customerName || !customerPhone || !items || items.length === 0) {
    res.status(400);
    throw new Error('Name, phone, and cart items are required');
  }

  let userId = null;
  let username = null;
  if (req.user) {
    userId = req.user._id;
    username = req.user.username;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userObj = await User.findById(decoded.id);
      if (userObj) {
        userId = userObj._id;
        username = userObj.username;
      }
    } catch (e) {}
  }

  const order = await Order.create({
    user: userId,
    username: username,
    customerName,
    customerPhone,
    customerEmail,
    items,
    totalAmount,
    notes,
  });

  res.status(201).json({ success: true, order });
});

 
exports.getMyOrders = asyncHandler(async (req, res) => {
  const userRegex = new RegExp(`^${req.user.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  const orders = await Order.find({
    $or: [
      { user: req.user._id },
      { username: req.user.username.toLowerCase() },
      { customerName: { $regex: userRegex } },
    ],
  })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images price discountPrice category');

  res.json({ success: true, orders });
});

 
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('items.product', 'name'),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

 
exports.getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  res.json({
    success: true,
    stats,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});

 
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, order });
});

 
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  await order.deleteOne();
  res.json({ success: true, message: 'Order deleted' });
});
 
exports.getOrdersByCustomer = asyncHandler(async (req, res) => {
  const { customerName } = req.params;

  if (!customerName) {
    res.status(400);
    throw new Error('Customer name is required');
  }

  const orders = await Order.find({
    customerName: { $regex: new RegExp(`^${customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images price discountPrice category');

  res.json({ success: true, orders });
});
