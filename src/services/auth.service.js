const { createHash, randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const AppError = require('../errors/AppError');
const repository = require('../repositories/auth.repository');

const scryptAsync = promisify(scrypt);
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function verifyPassword(password, encodedHash) {
  const [algorithm, saltHex, hashHex] = String(encodedHash || '').split('$');
  if (algorithm !== 'scrypt' || !/^[a-f\d]{32}$/i.test(saltHex) || !/^[a-f\d]{128}$/i.test(hashHex)) {
    return false;
  }
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

function serializeUser(user) {
  return {
    id: user.user_id,
    name: user.full_name,
    email: user.email,
    role: user.role,
  };
}

async function login(body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Vui lòng nhập email và mật khẩu');
  }

  const user = await repository.findUserByEmail(email);
  if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không chính xác');
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await repository.createSession(user.user_id, hashToken(token), expiresAt);
  return { token, expiresAt, user: serializeUser(user) };
}

async function getSessionUser(token) {
  const row = await repository.findSessionUser(hashToken(token));
  return row ? serializeUser(row) : null;
}

async function logout(token) {
  await repository.deleteSession(hashToken(token));
}

module.exports = { login, getSessionUser, logout, hashToken };
