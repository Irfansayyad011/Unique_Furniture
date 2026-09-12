const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const normalizeUsername = (username = '') => username.trim().toLowerCase();

const generateAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  role: user.role,
  active: user.active,
  cart: user.cart || [],
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide a username and password');
  }

  const normalizedUsername = normalizeUsername(username);

  if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername) || normalizedUsername.length < 3) {
    res.status(400);
    throw new Error('Username must be at least 3 characters and contain only letters, numbers, or underscores');
  }

  if (!passwordRule.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character');
  }

  const existing = await User.findOne({ username: normalizedUsername });
  if (existing) {
    res.status(409);
    throw new Error('Username already exists');
  }

  const user = await User.create({
    username: normalizedUsername,
    password,
    role: 'customer',
    active: true,
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  const normalizedUsername = normalizeUsername(username);
  const user = await User.findOne({ username: normalizedUsername }).select('+password +refreshToken');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid username or password');
  }

  if (!user.active) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('No refresh token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error('Refresh token reuse detected — please login again');
  }

  if (!user.active) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id, user.role);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, newRefreshToken);

  res.json({ success: true, accessToken: newAccessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const { role, active, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (active !== undefined) filter.active = active === 'true';
  if (search) filter.username = { $regex: search, $options: 'i' };

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, users: users.map(sanitizeUser) });
});

exports.createOwnerAccount = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can create owner accounts');
  }

  const existingOwner = await User.findOne({ role: 'owner' });
  if (existingOwner) {
    res.status(400);
    throw new Error('Only ONE Owner account is allowed in the system. An Owner account already exists.');
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide a username and password');
  }

  const normalizedUsername = normalizeUsername(username);
  if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername) || normalizedUsername.length < 3) {
    res.status(400);
    throw new Error('Username must be at least 3 characters and contain only letters, numbers, or underscores');
  }

  if (!passwordRule.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character');
  }

  const exists = await User.findOne({ username: normalizedUsername });
  if (exists) {
    res.status(409);
    throw new Error('Username already exists');
  }

  const user = await User.create({
    username: normalizedUsername,
    password,
    role: 'owner',
    active: true,
  });

  res.status(201).json({ success: true, user: sanitizeUser(user) });
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can manage user status');
  }

  const { active } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.active = Boolean(active);
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, user: sanitizeUser(user) });
});

exports.syncCustomerCart = asyncHandler(async (req, res) => {
  if (req.user.role !== 'customer') {
    res.status(403);
    throw new Error('Only customers can sync cart');
  }

  const { cart = [] } = req.body;
  const user = await User.findById(req.user._id);
  user.cart = Array.isArray(cart)
    ? cart.map((item) => ({
        productId: String(item.productId || item._id || item.product || item.productId || ''),
        name: item.name || 'Product',
        price: Number(item.price || 0),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
        images: Array.isArray(item.images) ? item.images : [],
        category: item.category || 'other',
        qty: Math.max(1, Number(item.qty || 1)),
      }))
    : [];

  await user.save({ validateBeforeSave: false });
  res.json({ success: true, cart: user.cart });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  if (!username || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error('Username, new password, and confirm password are required');
  }

  const normalizedUsername = normalizeUsername(username);

  const user = await User.findOne({ username: normalizedUsername }).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('Username not found. Please check and try again.');
  }

  if (!passwordRule.test(newPassword)) {
    res.status(400);
    throw new Error('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character');
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully. You can now login with your new password.' });
});
