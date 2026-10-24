INSERT OR IGNORE INTO users (full_name, email, role, is_active)
VALUES
  ('Sales Representative', 'sales@example.com', 'NVKD', 1),
  ('System Administrator', 'admin@example.com', 'QTV', 1);

INSERT OR IGNORE INTO tag (tag_name, description)
VALUES
  ('VIP', 'Khách hàng VIP - dữ liệu mẫu'),
  ('NEW', 'Khách hàng mới - dữ liệu mẫu');
