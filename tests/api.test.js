const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.DB_PATH = ':memory:';

const app = require('../src/app');
const migrate = require('../src/database/migrate');
const { run, get } = require('../src/database/connection');

async function resetDatabase() {
  await migrate();
}

async function authHeaders(email = 'admin@example.com', password = 'Admin123!') {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  assert.equal(response.status, 200);
  return { Authorization: `Bearer ${response.body.token}` };
}

test('health endpoint works', async () => {
  await resetDatabase();

  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('login accepts demo admin and rejects invalid password', async () => {
  await resetDatabase();

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Admin123!' });
  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.body.user.role, 'QTV');
  assert.ok(loginResponse.body.token);
  assert.ok(loginResponse.body.expiresAt);

  const invalidResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'incorrect' });
  assert.equal(invalidResponse.status, 401);
  assert.equal(invalidResponse.body.code, 'INVALID_CREDENTIALS');
});

test('customer API requires an authenticated session', async () => {
  await resetDatabase();

  const response = await request(app).get('/api/customers');

  assert.equal(response.status, 401);
  assert.equal(response.body.code, 'UNAUTHENTICATED');
});

test('logout invalidates the session token', async () => {
  await resetDatabase();
  const headers = await authHeaders();

  const logoutResponse = await request(app)
    .post('/api/auth/logout')
    .set(headers);
  assert.equal(logoutResponse.status, 204);

  const sessionResponse = await request(app)
    .get('/api/auth/me')
    .set(headers);
  assert.equal(sessionResponse.status, 401);
});

test('customer can be created and retrieved', async () => {
  await resetDatabase();
  const headers = await authHeaders();

  const createResponse = await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn A', phone: '0901234567' });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.name, 'Nguyễn Văn A');
  assert.equal(createResponse.body.status, 'active');

  const fetchResponse = await request(app)
    .get(`/api/customers/${createResponse.body.id}`)
    .set(headers);
  assert.equal(fetchResponse.status, 200);
  assert.equal(fetchResponse.body.phone, '0901234567');
});

test('duplicate phone is rejected', async () => {
  await resetDatabase();
  const headers = await authHeaders();

  await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn A', phone: '0901234567' });

  const response = await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn B', phone: '0901234567' });

  assert.equal(response.status, 409);
  assert.equal(response.body.code, 'PHONE_EXISTS');
});

test('invalid email is rejected on update', async () => {
  await resetDatabase();
  const headers = await authHeaders();

  const createResponse = await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn C', phone: '0907654321' });

  const response = await request(app)
    .put(`/api/customers/${createResponse.body.id}`)
    .set(headers)
    .send({ email: 'invalid-email' });

  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'VALIDATION_ERROR');
});

test('customer optional details can be edited and cleared', async () => {
  await resetDatabase();
  const headers = await authHeaders();
  const customer = await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn G', phone: '0905555666' });

  const updateResponse = await request(app)
    .put(`/api/customers/${customer.body.id}`)
    .set(headers)
    .send({
      email: 'g@example.com',
      address: '12 Đường A, TP. Hồ Chí Minh',
      birthDate: '1990-05-21',
      notes: 'Khách hàng ưu tiên',
    });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.email, 'g@example.com');
  assert.equal(updateResponse.body.address, '12 Đường A, TP. Hồ Chí Minh');
  assert.equal(updateResponse.body.birthDate, '1990-05-21');
  assert.equal(updateResponse.body.notes, 'Khách hàng ưu tiên');

  const clearResponse = await request(app)
    .put(`/api/customers/${customer.body.id}`)
    .set(headers)
    .send({ email: '', address: '', birthDate: '', notes: '' });
  assert.equal(clearResponse.status, 200);
  assert.equal(clearResponse.body.email, null);
  assert.equal(clearResponse.body.address, null);
  assert.equal(clearResponse.body.birthDate, null);
  assert.equal(clearResponse.body.notes, null);
});

test('only an admin can delete a customer', async () => {
  await resetDatabase();
  const adminHeaders = await authHeaders();
  const salesHeaders = await authHeaders('sales@example.com', 'Sales123!');
  const customer = await request(app)
    .post('/api/customers')
    .set(adminHeaders)
    .send({ name: 'Nguyễn Văn H', phone: '0906666777' });
  await request(app)
    .post(`/api/customers/${customer.body.id}/tags`)
    .set(adminHeaders)
    .send({ tags: ['Xóa cùng hồ sơ'] });
  await run(
    'INSERT INTO customer_transaction (customer_id, amount, behavior_cat) VALUES (?, ?, ?)',
    [customer.body.id, 100000, 'regular'],
  );

  const forbiddenResponse = await request(app)
    .delete(`/api/customers/${customer.body.id}`)
    .set(salesHeaders);
  assert.equal(forbiddenResponse.status, 403);
  assert.equal(forbiddenResponse.body.code, 'FORBIDDEN');

  const deleteResponse = await request(app)
    .delete(`/api/customers/${customer.body.id}`)
    .set(adminHeaders);
  assert.equal(deleteResponse.status, 204);

  const missingResponse = await request(app)
    .get(`/api/customers/${customer.body.id}`)
    .set(adminHeaders);
  assert.equal(missingResponse.status, 404);
  assert.equal(missingResponse.body.code, 'CUSTOMER_NOT_FOUND');
  const relatedRows = await get(`
    SELECT
      (SELECT COUNT(*) FROM customer_tag WHERE customer_id = ?) AS tagCount,
      (SELECT COUNT(*) FROM customer_transaction WHERE customer_id = ?) AS transactionCount
  `, [customer.body.id, customer.body.id]);
  assert.deepEqual(relatedRows, { tagCount: 0, transactionCount: 0 });
});

test('admin can lock customer status', async () => {
  await resetDatabase();
  const headers = await authHeaders();

  const createResponse = await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn D', phone: '0902222333' });

  const response = await request(app)
    .patch(`/api/customers/${createResponse.body.id}/status`)
    .set('Authorization', 'Bearer admin')
    .send({ status: 'locked' })
    .set(headers);

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'locked');
});

test('sales account cannot perform admin-only actions', async () => {
  await resetDatabase();
  const adminHeaders = await authHeaders();
  const salesHeaders = await authHeaders('sales@example.com', 'Sales123!');
  const customer = await request(app)
    .post('/api/customers')
    .set(adminHeaders)
    .send({ name: 'Nguyễn Văn F', phone: '0904444555' });

  const response = await request(app)
    .patch(`/api/customers/${customer.body.id}/status`)
    .set(salesHeaders)
    .send({ status: 'locked' });

  assert.equal(response.status, 403);
  assert.equal(response.body.code, 'FORBIDDEN');
});

test('customer tags and transaction history are returned', async () => {
  await resetDatabase();
  const headers = await authHeaders();

  const createResponse = await request(app)
    .post('/api/customers')
    .set(headers)
    .send({ name: 'Nguyễn Văn E', phone: '0903333444' });
  const customerId = createResponse.body.id;

  const tagsResponse = await request(app)
    .post(`/api/customers/${customerId}/tags`)
    .set(headers)
    .send({ tags: ['VIP'] });
  assert.equal(tagsResponse.status, 200);
  assert.deepEqual(tagsResponse.body.tags, ['VIP']);

  await run(
    'INSERT INTO customer_transaction (customer_id, amount, behavior_cat) VALUES (?, ?, ?)',
    [customerId, 125000, 'frequent'],
  );
  const transactionsResponse = await request(app)
    .get(`/api/customers/${customerId}/transactions`)
    .set(headers);
  assert.equal(transactionsResponse.status, 200);
  assert.equal(transactionsResponse.body.length, 1);
  assert.equal(transactionsResponse.body[0].behavior, 'frequent');

  const filteredResponse = await request(app)
    .get('/api/customers')
    .set(headers)
    .query({ behavior: 'frequent' });
  assert.equal(filteredResponse.body.length, 1);
  assert.equal(filteredResponse.body[0].id, customerId);
});
