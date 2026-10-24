const AppError = require('../errors/AppError');

function validateCreateCustomer(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : '';

  if (!name) throw new AppError(400, 'VALIDATION_ERROR', 'Vui lòng nhập Tên khách hàng');
  if (name.length > 100) throw new AppError(400, 'VALIDATION_ERROR', 'Tên không được vượt quá 100 ký tự');
  if (!/^\d{10,11}$/.test(phone)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Vui lòng nhập Số điện thoại');
  }
  return { name, phone };
}

function validateUpdateCustomer(body) {
  const updates = {};
  if (Object.hasOwn(body, 'name')) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) throw new AppError(400, 'VALIDATION_ERROR', 'Vui lòng nhập Tên khách hàng');
    if (name.length > 100) throw new AppError(400, 'VALIDATION_ERROR', 'Tên không được vượt quá 100 ký tự');
    updates.name = name;
  }
  if (Object.hasOwn(body, 'email')) {
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Định dạng email không hợp lệ');
    }
    updates.email = body.email.trim();
  }
  if (Object.keys(updates).length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cần cung cấp thông tin cần cập nhật');
  }
  return updates;
}

function validateStatus(body) {
  const status = typeof body.status === 'string' ? body.status.trim().toLowerCase() : '';
  if (!['active', 'locked'].includes(status)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ');
  }
  return status;
}

function validateTags(body) {
  const values = Array.isArray(body.tags) ? body.tags : [body.tags];
  const tags = values
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length === 0) throw new AppError(400, 'VALIDATION_ERROR', 'Cần cung cấp ít nhất một nhãn');
  if (tags.some((tag) => tag.length > 50)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Tên nhãn không được vượt quá 50 ký tự');
  }
  return [...new Set(tags)];
}

function validateMerge(body) {
  const sourceId = Number(body.sourceCustomerId || body.source_id);
  const targetId = Number(body.targetCustomerId || body.target_id);
  if (!Number.isInteger(sourceId) || !Number.isInteger(targetId)
      || sourceId <= 0 || targetId <= 0 || sourceId === targetId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cần cung cấp 2 hồ sơ khách hàng khác nhau để gộp');
  }
  return { sourceId, targetId };
}

function validateCustomerId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Mã hồ sơ khách hàng không hợp lệ');
  }
  return id;
}

function validateCustomerFilters(query) {
  const filters = {};
  if (query.behavior !== undefined) {
    if (typeof query.behavior !== 'string' || !query.behavior.trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Phân loại hành vi không hợp lệ');
    }
    filters.behavior = query.behavior.trim();
  }
  if (query.status !== undefined) {
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
    if (!['active', 'locked', 'merged'].includes(status)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ');
    }
    filters.status = status.toUpperCase();
  }
  return filters;
}

module.exports = {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateStatus,
  validateTags,
  validateMerge,
  validateCustomerId,
  validateCustomerFilters,
};
