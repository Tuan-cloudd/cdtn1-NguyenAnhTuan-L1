const AppError = require('../errors/AppError');
const repository = require('../repositories/customer.repository');
const validator = require('../validators/customer.validator');

async function createCustomer(body) {
  const customer = validator.validateCreateCustomer(body);
  if (await repository.findByPhone(customer.phone)) {
    throw new AppError(409, 'PHONE_EXISTS', 'Số điện thoại này đã được sử dụng');
  }
  return repository.create(customer);
}

function listCustomers(query) {
  return repository.findAll(validator.validateCustomerFilters(query));
}

async function getCustomer(value) {
  const customer = await repository.findById(validator.validateCustomerId(value));
  if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Hồ sơ không tồn tại hoặc đã bị xóa');
  return customer;
}

async function updateCustomer(value, body) {
  const customer = await getCustomer(value);
  return repository.update(customer.id, validator.validateUpdateCustomer(body));
}

async function deleteCustomer(value) {
  const customer = await getCustomer(value);
  await repository.remove(customer.id);
}

async function changeCustomerStatus(value, body) {
  const customer = await getCustomer(value);
  const status = validator.validateStatus(body);
  return repository.setStatus(customer.id, status);
}

async function addCustomerTags(value, body) {
  const customer = await getCustomer(value);
  return repository.addTags(customer.id, validator.validateTags(body));
}

async function getCustomerTransactions(value) {
  const customer = await getCustomer(value);
  return repository.findTransactions(customer.id);
}

async function mergeCustomers(body) {
  const { sourceId, targetId } = validator.validateMerge(body);
  await getCustomer(sourceId);
  await getCustomer(targetId);
  await repository.merge(sourceId, targetId);
  return { mergedCustomerId: sourceId, targetCustomerId: targetId };
}

module.exports = {
  createCustomer, listCustomers, getCustomer, updateCustomer, deleteCustomer,
  changeCustomerStatus, addCustomerTags, getCustomerTransactions, mergeCustomers,
};
