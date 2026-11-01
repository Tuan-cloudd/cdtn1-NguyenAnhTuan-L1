const express = require('express');
const path = require('path');
const customerRoutes = require('./routes/customer.routes');
const authRoutes = require('./routes/auth.routes');
const requireAuth = require('./middleware/requireAuth');
const AppError = require('./errors/AppError');

const app = express();

app.use(express.json());
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Track SE Customer Service' });
});
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/customers', requireAuth, customerRoutes);
app.use((req, res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', 'Đường dẫn không tồn tại'));
});
app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: true, code: error.code, message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: true, code: 'SERVER_ERROR', message: 'Lỗi máy chủ' });
});

module.exports = app;
