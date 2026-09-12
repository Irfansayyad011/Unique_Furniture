import api from './axios';

// Products
export const fetchProducts = (params) => api.get('/products', { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleProductStock = (id) => api.patch(`/products/${id}/toggle`);
export const toggleFeaturedProduct = (id) => api.patch(`/products/${id}/featured`);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const syncCustomerCart = (cart) => api.put('/auth/cart', { cart });
export const listUsers = (params) => api.get('/auth/users', { params });
export const createOwnerAccount = (data) => api.post('/auth/users/owner', data);
export const updateUserStatus = (id, active) => api.patch(`/auth/users/${id}/active`, { active });
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const fetchMyOrders = () => api.get('/orders/my-orders');
export const fetchOrders = (params) => api.get('/orders', { params });
export const fetchOrderStats = () => api.get('/orders/stats');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const fetchOrdersByCustomer = (name) => api.get(`/orders/customer/${encodeURIComponent(name)}`);
