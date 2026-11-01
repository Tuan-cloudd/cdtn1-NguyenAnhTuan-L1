const API = '/api/customers';
const appView = document.querySelector('#app-view');
const breadcrumb = document.querySelector('#breadcrumb-current');
const toast = document.querySelector('#toast');
const dialog = document.querySelector('#customer-dialog');
const customerForm = document.querySelector('#customer-form');
let customers = [];
let toastTimer;
let currentUserRole = '';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const initials = (name) => String(name || '?').trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi');
const formatDate = (date) => date ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : '—';
const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(amount) || 0);
const titleCase = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('vi'));

async function api(url, options = {}) {
  const token = localStorage.getItem('trackse-token');
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token && url !== '/api/auth/login' ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Yêu cầu thất bại (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return result;
}

function showLogin(message = '') {
  document.body.classList.add('auth-required');
  appView.innerHTML = `
    <section class="login-card">
      <div class="brand-mark">T</div>
      <span class="eyebrow">TRACK SE CUSTOMER PLATFORM</span>
      <h1>Đăng nhập</h1>
      <p>Đăng nhập để tiếp tục quản lý hồ sơ khách hàng.</p>
      <form id="login-form">
        <label>Email<input name="email" type="email" autocomplete="username" required value="admin@example.com"></label>
        <label>Mật khẩu<input name="password" type="password" autocomplete="current-password" required autofocus></label>
        <div class="login-error" role="alert">${escapeHtml(message)}</div>
        <button class="button button-primary" type="submit">Đăng nhập</button>
      </form>
      <small class="login-demo">Tài khoản dùng thử: admin@example.com / Admin123!</small>
    </section>`;
}

function showProfile(user) {
  document.body.classList.remove('auth-required');
  currentUserRole = user.role;
  document.querySelector('#profile-name').textContent = user.name;
  document.querySelector('#profile-role').textContent = user.role === 'QTV' ? 'Quản trị viên' : 'Nhân viên kinh doanh';
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast show${isError ? ' error' : ''}`;
  toastTimer = window.setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function resetCustomerDialog() {
  customerForm.reset();
  customerForm.dataset.mode = 'create';
  delete customerForm.dataset.customerId;
  customerForm.elements.phone.closest('label').hidden = false;
  customerForm.querySelector('.optional-fields').hidden = true;
  dialog.querySelector('.eyebrow').textContent = 'HỒ SƠ MỚI';
  dialog.querySelector('h2').textContent = 'Thêm khách hàng';
  customerForm.querySelector('[type="submit"]').innerHTML = 'Tạo hồ sơ <span>→</span>';
}

function statusLabel(status) {
  const labels = { active: 'Hoạt động', locked: 'Đã khóa', merged: 'Đã gộp' };
  return labels[status] || status;
}

function statusBadge(status) {
  return `<span class="status ${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span>`;
}

function tagMarkup(tags = []) {
  if (!tags.length) return '<span class="tag gray">Chưa phân loại</span>';
  return tags.slice(0, 2).map((tag, index) => `<span class="tag ${index === 1 ? 'green' : ''}">${escapeHtml(tag)}</span>`).join('');
}

function customerRow(customer) {
  return `<tr data-customer-id="${customer.id}" tabindex="0" role="link">
    <td><div class="customer-name-cell"><span class="customer-avatar">${escapeHtml(initials(customer.name))}</span><span><strong>${escapeHtml(customer.name)}</strong><small>ID #${customer.id}</small></span></div></td>
    <td>${escapeHtml(customer.phone)}</td><td>${escapeHtml(customer.email || 'Chưa có email')}</td>
    <td>${tagMarkup(customer.tags)}</td><td>${statusBadge(customer.status)}</td><td>${escapeHtml(formatDate(customer.createdAt))}</td>
  </tr>`;
}

function tableMarkup(rows) {
  if (!rows.length) return '<div class="empty-state">Chưa có hồ sơ phù hợp. Hãy tạo hồ sơ khách hàng đầu tiên.</div>';
  return `<div class="table-wrap"><table class="customer-table"><thead><tr><th>KHÁCH HÀNG</th><th>SỐ ĐIỆN THOẠI</th><th>EMAIL</th><th>PHÂN KHÚC</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th></tr></thead><tbody>${rows.map(customerRow).join('')}</tbody></table></div>`;
}

async function loadCustomers() {
  customers = await api(API);
  return customers;
}

function renderDashboard() {
  breadcrumb.textContent = 'Dashboard';
  const total = customers.length;
  const active = customers.filter((customer) => customer.status === 'active');
  const locked = customers.filter((customer) => customer.status === 'locked');
  const merged = customers.filter((customer) => customer.status === 'merged');
  const tagged = customers.filter((customer) => customer.tags.length);
  const tagCounts = new Map();
  customers.forEach((customer) => customer.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const segments = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const segmentRows = segments.length
    ? segments.map(([name, count]) => `<div class="segment-item"><div class="segment-name"><i></i>${escapeHtml(name)}</div><span class="segment-count">${count}</span><div class="segment-track"><span style="width:${Math.max(5, Math.round(count / total * 100))}%"></span></div></div>`).join('')
    : '<div class="empty-state">Thêm nhãn vào hồ sơ để xem phân khúc khách hàng.</div>';
  const columns = [
    { name: 'Đã phân loại', status: 'active', color: 'green', rows: active.filter((customer) => customer.tags.length) },
    { name: 'Chưa phân loại', status: 'unclassified', color: '', rows: customers.filter((customer) => customer.status === 'active' && !customer.tags.length) },
    { name: 'Đã khóa / gộp', status: 'locked', color: 'orange', rows: [...locked, ...merged] },
  ];
  const pipeline = columns.map((column) => `<section class="pipeline-column"><div class="pipeline-head"><i class="${column.color}"></i>${column.name}<span class="pipeline-count">${column.rows.length}</span></div>${column.rows.slice(0, 3).map((customer) => `<a class="pipeline-card" href="#/customers/${customer.id}"><span class="mini-avatar">${escapeHtml(initials(customer.name))}</span><span><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.phone)}</small></span></a>`).join('') || '<div class="empty-state" style="padding:12px 3px">Chưa có hồ sơ</div>'}</section>`).join('');
  const recent = customers.slice(0, 5);

  appView.innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">TỔNG QUAN</span><h1>Dashboard Phân loại</h1><p>Theo dõi hồ sơ và phân khúc khách hàng của bạn.</p></div><button class="button button-primary" data-add-customer>＋ <span>Thêm khách hàng</span></button></div>
    <section class="metric-grid">
      <article class="metric-card"><div class="metric-top">Tổng khách hàng <span class="metric-icon">♙</span></div><div class="metric-value">${total}</div><div class="metric-note">Tổng hồ sơ trong hệ thống</div></article>
      <article class="metric-card"><div class="metric-top">Đang hoạt động <span class="metric-icon green">✓</span></div><div class="metric-value">${active.length}</div><div class="metric-note"><strong>${total ? Math.round(active.length / total * 100) : 0}%</strong> hồ sơ đang hoạt động</div></article>
      <article class="metric-card"><div class="metric-top">Đã phân loại <span class="metric-icon orange">◇</span></div><div class="metric-value">${tagged.length}</div><div class="metric-note">Có ít nhất một nhãn</div></article>
      <article class="metric-card"><div class="metric-top">Cần theo dõi <span class="metric-icon blue">↗</span></div><div class="metric-value">${locked.length + merged.length}</div><div class="metric-note">${locked.length} đã khóa · ${merged.length} đã gộp</div></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel"><div class="panel-heading"><div><h2>Tăng trưởng hồ sơ</h2><p>Khách hàng mới theo tháng</p></div><div class="chart-legend"><span><i class="legend-dot"></i>Hồ sơ mới</span></div></div>
        <div class="chart"><div class="chart-axis"><span>${Math.max(4, total)}</span><span>${Math.ceil(total / 2)}</span><span>0</span></div><div class="chart-bars">${Array.from({ length: 7 }, (_, index) => { const month = new Date(); month.setMonth(month.getMonth() - (6 - index)); const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`; const count = customers.filter((customer) => String(customer.createdAt || '').slice(0, 7) === monthKey).length; const height = total ? Math.max(count ? 14 : 3, count / Math.max(4, total) * 100) : 3; return `<div class="chart-month"><i class="bar" style="height:${height}%"></i><small>${month.toLocaleDateString('vi-VN', { month: 'short' })}</small></div>`; }).join('')}</div></div>
      </article>
      <article class="panel"><div class="panel-heading"><div><h2>Phân khúc khách hàng</h2><p>Phân loại theo nhãn hồ sơ</p></div><a class="text-link" href="#/customers">Chi tiết →</a></div><div class="segment-list">${segmentRows}<div class="segment-item"><div class="segment-name"><i class="s-red"></i>Chưa gắn nhãn</div><span class="segment-count">${total - tagged.length}</span><div class="segment-track"><span style="width:${total ? Math.max(5, Math.round((total - tagged.length) / total * 100)) : 0}%"></span></div></div></div></article>
    </section>
    <div class="section-heading"><h2>Pipeline khách hàng</h2><a class="text-link" href="#/customers">Xem tất cả hồ sơ →</a></div>
    <section class="pipeline">${pipeline}</section>
    <div class="section-heading"><h2>Hồ sơ mới cập nhật</h2><a class="text-link" href="#/customers">Danh sách khách hàng →</a></div>
    <article class="panel table-panel">${tableMarkup(recent)}</article>`;
}

function renderCustomerList() {
  breadcrumb.textContent = 'Hồ sơ khách hàng';
  appView.innerHTML = `<div class="page-heading"><div><span class="eyebrow">KHÁCH HÀNG</span><h1>Danh sách Hồ sơ Khách hàng</h1><p>Quản lý thông tin liên hệ, nhãn và trạng thái hồ sơ.</p></div><button class="button button-primary" data-add-customer>＋ <span>Thêm khách hàng</span></button></div>
    <div class="toolbar"><label class="search-box"><span>⌕</span><input id="customer-search" type="search" placeholder="Tìm theo tên, số điện thoại hoặc email..." aria-label="Tìm khách hàng"></label><select id="status-filter" aria-label="Lọc trạng thái"><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="locked">Đã khóa</option><option value="merged">Đã gộp</option></select><select id="tag-filter" aria-label="Lọc phân khúc"><option value="">Tất cả phân khúc</option>${[...new Set(customers.flatMap((customer) => customer.tags))].sort().map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join('')}</select></div>
    <div class="list-summary"><span id="result-count"></span><span>Cập nhật theo dữ liệu trực tiếp</span></div><article class="panel table-panel" id="customer-list-table"></article>`;
  const search = document.querySelector('#customer-search');
  const status = document.querySelector('#status-filter');
  const tag = document.querySelector('#tag-filter');
  const results = document.querySelector('#customer-list-table');
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase('vi');
    const filtered = customers.filter((customer) => (!status.value || customer.status === status.value)
      && (!tag.value || customer.tags.includes(tag.value))
      && (!query || [customer.name, customer.phone, customer.email].some((value) => String(value || '').toLocaleLowerCase('vi').includes(query))));
    document.querySelector('#result-count').textContent = `Hiển thị ${filtered.length} / ${customers.length} hồ sơ`;
    results.innerHTML = tableMarkup(filtered);
  };
  search.addEventListener('input', update);
  status.addEventListener('change', update);
  tag.addEventListener('change', update);
  update();
}

async function renderCustomerDetail(id) {
  breadcrumb.textContent = 'Chi tiết hồ sơ';
  const customer = await api(`${API}/${encodeURIComponent(id)}`);
  const transactions = await api(`${API}/${encodeURIComponent(id)}/transactions`);
  const transactionRows = transactions.length
    ? transactions.map((transaction) => `<div class="timeline-item"><i class="timeline-dot"></i><div><span class="transaction-amount">${escapeHtml(formatMoney(transaction.amount))}</span><strong>${escapeHtml(titleCase(transaction.behavior || 'Giao dịch'))}</strong><small>${escapeHtml(formatDate(transaction.createdAt))} · Giao dịch #${transaction.id}</small></div></div>`).join('')
    : '<div class="empty-state" style="padding:22px 5px">Chưa có giao dịch được ghi nhận cho hồ sơ này.</div>';
  const totalValue = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  appView.innerHTML = `<a class="detail-back" href="#/customers">← Quay lại danh sách khách hàng</a>
    <div class="page-heading detail-heading"><div class="detail-title"><span class="customer-avatar">${escapeHtml(initials(customer.name))}</span><div><span class="eyebrow">HỒ SƠ #${customer.id}</span><h1>${escapeHtml(customer.name)}</h1><p>${escapeHtml(customer.phone)} · Tạo ngày ${escapeHtml(formatDate(customer.createdAt))}</p></div></div><div class="detail-actions"><button class="button button-quiet" data-edit-customer="${customer.id}">Chỉnh sửa</button>${currentUserRole === 'QTV' ? `<button class="button button-danger" data-delete-customer="${customer.id}">Xóa hồ sơ</button>` : ''}${statusBadge(customer.status)}</div></div>
    <div class="detail-grid"><div>
      <article class="panel"><div class="panel-heading"><div><h2>Thông tin khách hàng</h2><p>Thông tin liên hệ và phân loại hồ sơ</p></div></div>
        <div class="info-grid"><div><div class="info-label">HỌ VÀ TÊN</div><div class="info-value">${escapeHtml(customer.name)}</div></div><div><div class="info-label">SỐ ĐIỆN THOẠI</div><div class="info-value">${escapeHtml(customer.phone)}</div></div><div><div class="info-label">EMAIL</div><div class="info-value">${escapeHtml(customer.email || 'Chưa cập nhật')}</div></div><div><div class="info-label">ĐỊA CHỈ</div><div class="info-value">${escapeHtml(customer.address || 'Chưa cập nhật')}</div></div><div><div class="info-label">NGÀY SINH</div><div class="info-value">${escapeHtml(customer.birthDate ? formatDate(`${customer.birthDate}T00:00:00`) : 'Chưa cập nhật')}</div></div><div><div class="info-label">GHI CHÚ</div><div class="info-value">${escapeHtml(customer.notes || 'Chưa cập nhật')}</div></div><div><div class="info-label">TRẠNG THÁI</div><div class="info-value">${statusBadge(customer.status)}</div></div><div><div class="info-label">NGÀY TẠO HỒ SƠ</div><div class="info-value">${escapeHtml(formatDate(customer.createdAt))}</div></div><div><div class="info-label">CẬP NHẬT GẦN NHẤT</div><div class="info-value">${escapeHtml(formatDate(customer.updatedAt))}</div></div><div><div class="info-label">PHÂN KHÚC / NHÃN</div><div class="detail-tags">${tagMarkup(customer.tags)}</div></div></div>
      </article>
      <article class="panel detail-section"><div class="panel-heading"><div><h2>Lịch sử giao dịch</h2><p>${transactions.length} giao dịch được ghi nhận</p></div><span class="tag green">${escapeHtml(formatMoney(totalValue))}</span></div><div class="timeline">${transactionRows}</div></article>
    </div><aside><article class="panel"><div class="panel-heading"><div><h2>Phân loại khách hàng</h2><p>Nhãn giúp tìm kiếm và phân khúc</p></div></div><div class="detail-tags">${tagMarkup(customer.tags)}</div><p class="detail-hint">Thêm nhãn để sắp xếp khách hàng theo nhóm như VIP, khách hàng mới hoặc nhóm cần chăm sóc.</p><button class="button button-quiet button-small" style="margin-top:13px" data-add-tag="${customer.id}">＋ Thêm nhãn</button></article>
      <article class="panel detail-section"><div class="panel-heading"><div><h2>Tóm tắt hoạt động</h2><p>Giá trị từ lịch sử giao dịch</p></div></div><div class="info-grid" style="grid-template-columns:1fr"><div><div class="info-label">TỔNG GIAO DỊCH</div><div class="info-value">${transactions.length}</div></div><div><div class="info-label">TỔNG GIÁ TRỊ</div><div class="info-value">${escapeHtml(formatMoney(totalValue))}</div></div></div></article></aside></div>`;
}

async function render() {
  const route = window.location.hash.slice(1) || '/dashboard';
  document.querySelectorAll('[data-nav]').forEach((item) => item.classList.toggle('active', route.startsWith(`/${item.dataset.nav}`)));
  if (!localStorage.getItem('trackse-token')) {
    showLogin();
    return;
  }
  appView.innerHTML = '<div class="loading">Đang tải dữ liệu khách hàng…</div>';
  try {
    const user = await api('/api/auth/me');
    showProfile(user);
    if (route.startsWith('/customers/')) {
      await renderCustomerDetail(route.split('/')[2]);
      return;
    }
    await loadCustomers();
    if (route === '/customers') renderCustomerList();
    else renderDashboard();
  } catch (error) {
    if (error.status === 401) {
      localStorage.removeItem('trackse-token');
      showLogin(error.message);
      return;
    }
    appView.innerHTML = `<div class="panel empty-state"><strong>Không thể tải dữ liệu</strong><p style="margin:8px 0 13px">${escapeHtml(error.message)}</p><button class="button button-quiet" data-retry>Tải lại</button></div>`;
    showToast(error.message, true);
  }
}

document.addEventListener('click', async (event) => {
  if (event.target.closest('[data-logout]')) {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      if (error.status !== 401) showToast(error.message, true);
    }
    localStorage.removeItem('trackse-token');
    render();
    return;
  }
  const addCustomer = event.target.closest('[data-add-customer]');
  if (addCustomer) {
    resetCustomerDialog();
    dialog.showModal();
  }
  if (event.target.closest('[data-close-dialog]')) dialog.close();
  const row = event.target.closest('[data-customer-id]');
  if (row && !event.target.closest('a,button')) window.location.hash = `/customers/${row.dataset.customerId}`;
  const retry = event.target.closest('[data-retry]');
  if (retry) render();
  const editButton = event.target.closest('[data-edit-customer]');
  if (editButton) {
    const customer = await api(`${API}/${editButton.dataset.editCustomer}`).catch((error) => { showToast(error.message, true); return null; });
    if (!customer) return;
    resetCustomerDialog();
    customerForm.dataset.mode = 'edit';
    customerForm.dataset.customerId = customer.id;
    customerForm.elements.name.value = customer.name;
    customerForm.elements.phone.closest('label').hidden = true;
    customerForm.querySelector('.optional-fields').hidden = false;
    customerForm.elements.email.value = customer.email || '';
    customerForm.elements.address.value = customer.address || '';
    customerForm.elements.birthDate.value = customer.birthDate || '';
    customerForm.elements.notes.value = customer.notes || '';
    dialog.querySelector('.eyebrow').textContent = 'CẬP NHẬT HỒ SƠ';
    dialog.querySelector('h2').textContent = 'Chỉnh sửa khách hàng';
    customerForm.querySelector('[type="submit"]').innerHTML = 'Lưu thay đổi <span>→</span>';
    dialog.showModal();
  }
  const deleteButton = event.target.closest('[data-delete-customer]');
  if (deleteButton) {
    if (currentUserRole !== 'QTV') return;
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ khách hàng này? Thao tác này không thể hoàn tác.')) return;
    deleteButton.disabled = true;
    try {
      await api(`${API}/${deleteButton.dataset.deleteCustomer}`, { method: 'DELETE' });
      showToast('Đã xóa hồ sơ khách hàng.');
      window.location.hash = '/customers';
    } catch (error) {
      deleteButton.disabled = false;
      showToast(error.message, true);
    }
  }
  const tagButton = event.target.closest('[data-add-tag]');
  if (tagButton) {
    const tag = window.prompt('Nhập nhãn khách hàng (ví dụ: VIP):');
    if (!tag || !tag.trim()) return;
    try {
      await api(`${API}/${tagButton.dataset.addTag}/tags`, { method: 'POST', body: JSON.stringify({ tags: [tag.trim()] }) });
      showToast('Đã thêm nhãn khách hàng.');
      render();
    } catch (error) { showToast(error.message, true); }
  }
});

appView.addEventListener('submit', async (event) => {
  if (event.target.id !== 'login-form') return;
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('[type="submit"]');
  const errorMessage = form.querySelector('.login-error');
  button.disabled = true;
  button.textContent = 'Đang đăng nhập…';
  errorMessage.textContent = '';
  try {
    const credentials = Object.fromEntries(new FormData(form));
    const session = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('trackse-token', session.token);
    render();
  } catch (error) {
    errorMessage.textContent = error.message;
    button.disabled = false;
    button.textContent = 'Đăng nhập';
  }
});

customerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(customerForm);
  const mode = customerForm.dataset.mode || 'create';
  const body = mode === 'edit'
    ? {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      birthDate: formData.get('birthDate'),
      notes: formData.get('notes'),
    }
    : { name: formData.get('name'), phone: formData.get('phone') };
  try {
    const created = await api(mode === 'edit' ? `${API}/${customerForm.dataset.customerId}` : API, {
      method: mode === 'edit' ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });
    dialog.close();
    showToast(mode === 'edit' ? 'Đã cập nhật hồ sơ khách hàng.' : 'Đã tạo hồ sơ khách hàng.');
    if (mode === 'edit') window.location.hash = `/customers/${created.id}`;
    else render();
  } catch (error) {
    showToast(error.message, true);
  }
});

dialog.addEventListener('close', resetCustomerDialog);
window.addEventListener('hashchange', render);
render();
