import api from './axios';

// ── Dashboard ────────────────────────────────────────────────
export const fetchDashboard    = ()            => api.get('/admin/dashboard');

// ── Games ────────────────────────────────────────────────────
export const fetchAdminGames   = (params = {}) => api.get('/admin/games',    { params });
export const fetchAdminGame    = (id)          => api.get(`/admin/games/${id}`);
export const createAdminGame   = (data)        => api.post('/admin/games',   data);
export const updateAdminGame   = (id, data)    => api.patch(`/admin/games/${id}`, data);
export const deleteAdminGame   = (id)          => api.delete(`/admin/games/${id}`);

// ── Categories ───────────────────────────────────────────────
export const fetchAdminCategories  = ()        => api.get('/admin/categories');
export const fetchAdminCategory    = (id)      => api.get(`/admin/categories/${id}`);
export const createAdminCategory   = (data)    => api.post('/admin/categories',   data);
export const updateAdminCategory   = (id, d)   => api.patch(`/admin/categories/${id}`, d);
export const deleteAdminCategory   = (id)      => api.delete(`/admin/categories/${id}`);

// ── Orders ───────────────────────────────────────────────────
export const fetchAdminOrders   = (params = {}) => api.get('/admin/orders',  { params });
export const fetchAdminOrder    = (id)          => api.get(`/admin/orders/${id}`);
export const updateOrderStatus  = (id, data)    => api.patch(`/admin/orders/${id}/status`, data);

// ── Payments ─────────────────────────────────────────────────
export const fetchAdminPayments = (params = {}) => api.get('/admin/payments', { params });
export const fetchAdminPayment  = (id)          => api.get(`/admin/payments/${id}`);
export const verifyPayment      = (id)          => api.post(`/admin/payments/${id}/verify`);

// ── Users ────────────────────────────────────────────────────
export const fetchAdminUsers    = (params = {}) => api.get('/admin/users',   { params });
export const fetchAdminUser     = (id)          => api.get(`/admin/users/${id}`);
export const updateUserStatus   = (id, status)  => api.patch(`/admin/users/${id}/status`,  { status });
export const updateUserRole     = (id, role)    => api.patch(`/admin/users/${id}/role`,    { role });

// ── Invoices ─────────────────────────────────────────────────
export const fetchAdminInvoices    = (params = {}) => api.get('/admin/invoices', { params });
export const fetchAdminInvoice     = (id)          => api.get(`/admin/invoices/${id}`);
export const regenerateInvoice     = (orderId)     => api.post(`/admin/invoices/${orderId}/regenerate`);

// ── Receipts ─────────────────────────────────────────────────
export const fetchAdminReceipts    = (params = {}) => api.get('/admin/receipts', { params });
export const fetchAdminReceipt     = (id)          => api.get(`/admin/receipts/${id}`);
export const regenerateReceipt     = (paymentId)   => api.post(`/admin/receipts/${paymentId}/regenerate`);

// ── Analytics ────────────────────────────────────────────────
export const fetchAnalyticsOverview = ()              => api.get('/admin/analytics/overview');
export const fetchAnalyticsSales    = (months = 12)   => api.get('/admin/analytics/sales',  { params: { months } });
export const fetchAnalyticsOrders   = ()              => api.get('/admin/analytics/orders');
export const fetchAnalyticsUsers    = (months = 12)   => api.get('/admin/analytics/users',  { params: { months } });
