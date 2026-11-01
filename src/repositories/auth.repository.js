const { get, run } = require('../database/connection');

function findUserByEmail(email) {
  return get(
    'SELECT user_id, full_name, email, role, is_active, password_hash FROM users WHERE email = ?',
    [email],
  );
}

async function createSession(userId, tokenHash, expiresAt) {
  await run('DELETE FROM auth_sessions WHERE expires_at <= ?', [new Date().toISOString()]);
  await run(
    'INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt],
  );
}

async function findSessionUser(tokenHash) {
  return get(`
    SELECT u.user_id, u.full_name, u.email, u.role
    FROM auth_sessions s
    JOIN users u ON u.user_id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_active = 1
  `, [tokenHash, new Date().toISOString()]);
}

function deleteSession(tokenHash) {
  return run('DELETE FROM auth_sessions WHERE token_hash = ?', [tokenHash]);
}

module.exports = { findUserByEmail, createSession, findSessionUser, deleteSession };
