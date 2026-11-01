ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS auth_sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiration ON auth_sessions(expires_at);
