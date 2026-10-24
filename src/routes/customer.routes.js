const express = require('express');
const AppError = require('../errors/AppError');
const service = require('../services/customer.service');

const router = express.Router();

function requireAdmin(req, res, next) {
  const identity = `${req.get('x-user-role') || ''} ${req.get('Authorization') || ''}`.toLowerCase();
  if (!identity.includes('qtv') && !identity.includes('admin')) {
    next(new AppError(403, 'FORBIDDEN', 'Chỉ Quản trị viên mới có quyền thực hiện thao tác này'));
    return;
  }
  next();
}

router.post('/', async (req, res) => res.status(201).json(await service.createCustomer(req.body)));
router.get('/', async (req, res) => res.json(await service.listCustomers(req.query)));

router.post('/merge', requireAdmin, async (req, res) => {
  const result = await service.mergeCustomers(req.body);
  res.json({ message: 'Gộp hồ sơ thành công', ...result });
});

router.get('/:id/transactions', async (req, res) => {
  res.json(await service.getCustomerTransactions(req.params.id));
});
router.post('/:id/tags', async (req, res) => {
  res.json(await service.addCustomerTags(req.params.id, req.body));
});
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const customer = await service.changeCustomerStatus(req.params.id, req.body);
  res.json({ id: customer.id, status: customer.status, updatedAt: customer.updatedAt });
});
router.get('/:id', async (req, res) => res.json(await service.getCustomer(req.params.id)));
router.put('/:id', async (req, res) => {
  res.json(await service.updateCustomer(req.params.id, req.body));
});

module.exports = router;
