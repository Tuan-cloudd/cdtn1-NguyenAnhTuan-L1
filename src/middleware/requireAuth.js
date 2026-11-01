const AppError = require('../errors/AppError');
const authService = require('../services/auth.service');

async function requireAuth(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer ([a-f\d]{64})$/i);
  if (!match) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập để tiếp tục'));
    return;
  }

  const user = await authService.getSessionUser(match[1]);
  if (!user) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'));
    return;
  }
  req.user = user;
  req.authToken = match[1];
  next();
}

module.exports = requireAuth;
