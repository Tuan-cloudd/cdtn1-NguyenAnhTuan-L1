-- 1. Bảng USER (Tài khoản người dùng/nhân viên)
CREATE TABLE users (
user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
full_name VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
role VARCHAR(20) NOT NULL CHECK (role IN ('NVKD', 'QTV')),
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng CUSTOMER (Hồ sơ khách hàng cốt lõi)
CREATE TABLE customer (
customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
full_name VARCHAR(100) NOT NULL,
phone VARCHAR(20) NOT NULL UNIQUE, -- Bắt buộc & Unique theo US1, US5
email VARCHAR(150) CHECK (email IS NULL OR email LIKE '%@%'), -- Ràng buộc định dạng email
status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'MERGED')),
merged_into_id INT NULL REFERENCES customer(customer_id) ON DELETE SET NULL, -- FK tự tham chiếu (US3)
created_by INT NOT NULL REFERENCES users(user_id),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng TAG (Danh mục thẻ/nhãn)
CREATE TABLE tag (
tag_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
tag_name VARCHAR(50) NOT NULL UNIQUE, -- Tên nhãn không trùng lặp
description TEXT NULL
);

-- 4. Bảng CUSTOMER_TAG (Bảng trung gian N-N giữa Customer và Tag)
CREATE TABLE customer_tag (
customer_id INT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
tag_id INT NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE,
assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
assigned_by INT NOT NULL REFERENCES users(user_id),
PRIMARY KEY (customer_id, tag_id)
);

-- 5. Bảng TRANSACTION (Lịch sử giao dịch & hành vi)
CREATE TABLE transaction (
transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
customer_id INT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
behavior_cat VARCHAR(50) NULL, -- Phân loại hành vi mua sắm (US6)
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DANH SÁCH INDEX PHỤC VỤ TRUY VẤN VÀ TỐI ƯU HIỆU NĂNG
-- ============================================================

-- Phục vụ US1, US5: Kiểm tra / tra cứu nhanh theo số điện thoại
CREATE INDEX idx_customer_phone ON customer(phone);

-- Phục vụ US8: Lọc danh sách hồ sơ theo trạng thái (ACTIVE/LOCKED)
CREATE INDEX idx_customer_status ON customer(status);

-- Phục vụ US7: Lấy lịch sử giao dịch của khách hàng sắp xếp theo thời gian
CREATE INDEX idx_transaction_customer ON transaction(customer_id, created_at DESC);

-- Phục vụ US6: Lọc danh sách giao dịch theo phân loại hành vi mua sắm
CREATE INDEX idx_transaction_behavior ON transaction(customer_id, behavior_cat);

-- Phục vụ US4: Tìm kiếm và lọc nhanh khách hàng theo nhãn dán (VIP, v.v.)
CREATE INDEX idx_customer_tag ON customer_tag(customer_id, tag_id);
