INSERT OR IGNORE INTO users (full_name, email, role, is_active, password_hash)
VALUES
  ('Sales Representative', 'sales@example.com', 'NVKD', 1, 'scrypt$ec66ff556aab7ae277e56995839e5186$02a0656d67be55c2c60bf798dcd1c3288afcdd915c521943e213b70a39ed85bbcc3b9e0786577ded9e4d3ffe8b73fb381bd7cd412d72264f9f16e2acaac85695'),
  ('System Administrator', 'admin@example.com', 'QTV', 1, 'scrypt$54b96e18b5c39717c5e5babc11393656$4799553a9475ef0a6ac1745c952cc8a716b79abfdfbc824ae0a4ccbc4ec856900a90e177b7bd536a48113dd7576cb797dc51444cb907b8e836e66950f402f678');

UPDATE users
SET password_hash = 'scrypt$ec66ff556aab7ae277e56995839e5186$02a0656d67be55c2c60bf798dcd1c3288afcdd915c521943e213b70a39ed85bbcc3b9e0786577ded9e4d3ffe8b73fb381bd7cd412d72264f9f16e2acaac85695'
WHERE email = 'sales@example.com' AND password_hash = '';

UPDATE users
SET password_hash = 'scrypt$54b96e18b5c39717c5e5babc11393656$4799553a9475ef0a6ac1745c952cc8a716b79abfdfbc824ae0a4ccbc4ec856900a90e177b7bd536a48113dd7576cb797dc51444cb907b8e836e66950f402f678'
WHERE email = 'admin@example.com' AND password_hash = '';

INSERT OR IGNORE INTO tag (tag_name, description)
VALUES
  ('VIP', 'Khách hàng VIP - dữ liệu mẫu'),
  ('NEW', 'Khách hàng mới - dữ liệu mẫu');
