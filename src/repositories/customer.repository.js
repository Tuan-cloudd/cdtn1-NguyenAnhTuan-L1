const { all, get, run } = require('../database/connection');

function serializeCustomer(row) {
  if (!row) return null;
  return {
    id: row.customer_id,
    name: row.full_name,
    phone: row.phone,
    email: row.email || null,
    status: String(row.status || 'ACTIVE').toLowerCase(),
    tags: typeof row.tags === 'string' && row.tags
      ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mergedIntoId: row.merged_into_id || null,
  };
}

async function findById(id) {
  const row = await get(`
    SELECT c.*, GROUP_CONCAT(DISTINCT t.tag_name) AS tags
    FROM customer c
    LEFT JOIN customer_tag ct ON ct.customer_id = c.customer_id
    LEFT JOIN tag t ON t.tag_id = ct.tag_id
    WHERE c.customer_id = ?
    GROUP BY c.customer_id
  `, [id]);
  return serializeCustomer(row);
}

async function findAll(filters = {}) {
  let query = `
    SELECT c.*, GROUP_CONCAT(DISTINCT t.tag_name) AS tags
    FROM customer c
    LEFT JOIN customer_tag ct ON ct.customer_id = c.customer_id
    LEFT JOIN tag t ON t.tag_id = ct.tag_id
  `;
  const params = [];
  const conditions = [];
  if (filters.behavior) {
    query += ' INNER JOIN customer_transaction tx ON tx.customer_id = c.customer_id';
    conditions.push('tx.behavior_cat = ?');
    params.push(filters.behavior);
  }
  if (filters.status) {
    conditions.push('c.status = ?');
    params.push(filters.status);
  }
  if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
  query += ' GROUP BY c.customer_id ORDER BY c.created_at DESC';
  return (await all(query, params)).map(serializeCustomer);
}

async function findByPhone(phone) {
  return get('SELECT customer_id FROM customer WHERE phone = ?', [phone]);
}

async function create(customer) {
  const user = await get("SELECT user_id FROM users WHERE role = 'NVKD' ORDER BY user_id LIMIT 1");
  if (!user) throw new Error('Không tìm thấy tài khoản NVKD để ghi nhận người tạo hồ sơ');
  const result = await run(
    'INSERT INTO customer (full_name, phone, created_by) VALUES (?, ?, ?)',
    [customer.name, customer.phone, user.user_id],
  );
  return findById(result.lastID);
}

async function update(id, updates) {
  const fields = [];
  const values = [];
  if (Object.hasOwn(updates, 'name')) {
    fields.push('full_name = ?');
    values.push(updates.name);
  }
  if (Object.hasOwn(updates, 'email')) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  await run(`UPDATE customer SET ${fields.join(', ')} WHERE customer_id = ?`, values);
  return findById(id);
}

async function setStatus(id, status) {
  await run(
    'UPDATE customer SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
    [status.toUpperCase(), id],
  );
  return findById(id);
}

async function addTags(customerId, tags) {
  const user = await get("SELECT user_id FROM users WHERE role = 'NVKD' ORDER BY user_id LIMIT 1");
  if (!user) throw new Error('Không tìm thấy tài khoản NVKD để ghi nhận người gắn nhãn');
  for (const tagName of tags) {
    await run('INSERT OR IGNORE INTO tag (tag_name) VALUES (?)', [tagName]);
    const tag = await get('SELECT tag_id FROM tag WHERE tag_name = ?', [tagName]);
    await run(
      'INSERT OR IGNORE INTO customer_tag (customer_id, tag_id, assigned_by) VALUES (?, ?, ?)',
      [customerId, tag.tag_id, user.user_id],
    );
  }
  return findById(customerId);
}

async function findTransactions(customerId) {
  return all(`
    SELECT transaction_id AS id, customer_id AS customerId, amount,
      behavior_cat AS behavior, created_at AS createdAt
    FROM customer_transaction
    WHERE customer_id = ?
    ORDER BY created_at DESC, transaction_id DESC
  `, [customerId]);
}

async function merge(sourceId, targetId) {
  await run(
    'UPDATE customer SET merged_into_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?',
    [targetId, 'MERGED', sourceId],
  );
  await run('UPDATE customer SET updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?', [targetId]);
}

module.exports = {
  findById, findAll, findByPhone, create, update, setStatus, addTags, findTransactions, merge,
};
