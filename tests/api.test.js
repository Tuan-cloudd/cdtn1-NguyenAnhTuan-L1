const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.DB_PATH = ':memory:';

const app = require('../src/app');
const migrate = require('../src/database/migrate');
const { run } = require('../src/database/connection');

async function resetDatabase() {
  await migrate();
}

test('health endpoint works', async () => {
  await resetDatabase();

  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('customer can be created and retrieved', async () => {
  await resetDatabase();

  const createResponse = await request(app)
    .post('/api/customers')
    .send({ name: 'Nguyễn Văn A', phone: '0901234567' });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.name, 'Nguyễn Văn A');
  assert.equal(createResponse.body.status, 'active');

  const fetchResponse = await request(app).get(`/api/customers/${createResponse.body.id}`);
  assert.equal(fetchResponse.status, 200);
  assert.equal(fetchResponse.body.phone, '0901234567');
});

test('duplicate phone is rejected', async () => {
  await resetDatabase();

  await request(app)
    .post('/api/customers')
    .send({ name: 'Nguyễn Văn A', phone: '0901234567' });

  const response = await request(app)
    .post('/api/customers')
    .send({ name: 'Nguyễn Văn B', phone: '0901234567' });

  assert.equal(response.status, 409);
  assert.equal(response.body.code, 'PHONE_EXISTS');
});

test('invalid email is rejected on update', async () => {
  await resetDatabase();

  const createResponse = await request(app)
    .post('/api/customers')
    .send({ name: 'Nguyễn Văn C', phone: '0907654321' });

  const response = await request(app)
    .put(`/api/customers/${createResponse.body.id}`)
    .send({ email: 'invalid-email' });

  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'VALIDATION_ERROR');
});

test('admin can lock customer status', async () => {
  await resetDatabase();

  const createResponse = await request(app)
    .post('/api/customers')
    .send({ name: 'Nguyễn Văn D', phone: '0902222333' });

  const response = await request(app)
    .patch(`/api/customers/${createResponse.body.id}/status`)
    .set('Authorization', 'Bearer admin')
    .send({ status: 'locked' });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'locked');
});

test('customer tags and transaction history are returned', async () => {
  await resetDatabase();

  const createResponse = await request(app)
    .post('/api/customers')
    .send({ name: 'Nguyễn Văn E', phone: '0903333444' });
  const customerId = createResponse.body.id;

  const tagsResponse = await request(app)
    .post(`/api/customers/${customerId}/tags`)
    .send({ tags: ['VIP'] });
  assert.equal(tagsResponse.status, 200);
  assert.deepEqual(tagsResponse.body.tags, ['VIP']);

  await run(
    'INSERT INTO customer_transaction (customer_id, amount, behavior_cat) VALUES (?, ?, ?)',
    [customerId, 125000, 'frequent'],
  );
  const transactionsResponse = await request(app)
    .get(`/api/customers/${customerId}/transactions`);
  assert.equal(transactionsResponse.status, 200);
  assert.equal(transactionsResponse.body.length, 1);
  assert.equal(transactionsResponse.body[0].behavior, 'frequent');

  const filteredResponse = await request(app)
    .get('/api/customers')
    .query({ behavior: 'frequent' });
  assert.equal(filteredResponse.body.length, 1);
  assert.equal(filteredResponse.body[0].id, customerId);
});
