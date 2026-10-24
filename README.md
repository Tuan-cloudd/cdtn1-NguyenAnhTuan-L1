# cdtn1-NguyenAnhTuan-L1

Nguyễn Anh Tuấn - 2374802013438 - Track SE  
Chuyên đề Tốt nghiệp 1, HK1 2026-2027  
Luồng nghiệp vụ: L1 – Hồ sơ khách hàng & phân khúc

## 1. Mục tiêu

Backend REST API quản lý hồ sơ khách hàng, gồm tạo và cập nhật hồ sơ, phân loại bằng nhãn, lọc theo hành vi mua, tra cứu giao dịch, gộp hồ sơ trùng và khóa/mở khóa hồ sơ.

## 2. Yêu cầu môi trường

- Node.js 20 LTS trở lên
- npm
- SQLite (dùng thư viện `sqlite3`, không cần cài database server riêng)

## 3. Hướng dẫn chạy

1. Sao chép `.env.example` thành `.env` và chỉnh `DB_PATH` hoặc `PORT` nếu cần.
2. Chạy `npm install`.
3. Chạy `npm run db:migrate` để tạo schema và nạp dữ liệu mẫu.
4. Chạy `npm run dev`, sau đó mở `http://localhost:3000` để sử dụng giao diện hoặc kiểm tra API tại `http://localhost:3000/health`.

## 4. Cấu trúc thư mục

```text
.
├── data/                       # SQLite database và tài liệu DDL thiết kế
├── docs/                       # SRS, API contract, sơ đồ và tài liệu
├── migrations/                 # SQL tạo/cập nhật schema, chạy theo thứ tự
├── public/                     # Giao diện Dashboard, danh sách và chi tiết khách hàng
├── seeds/                      # SQL dữ liệu mẫu
├── src/
│   ├── database/               # Kết nối SQLite và migration runner
│   ├── errors/                 # Lỗi ứng dụng dùng chung
│   ├── repositories/           # Truy cập và truy vấn dữ liệu
│   ├── routes/                 # Khai báo HTTP routes
│   ├── services/               # Logic nghiệp vụ, không biết HTTP
│   ├── validators/             # Kiểm tra dữ liệu đầu vào
│   ├── app.js                  # Ghép middleware, routes, error handler
│   ├── db.js                   # Cầu nối tương thích đến database/connection.js
│   └── server.js               # Khởi tạo DB và chạy HTTP server
└── tests/                      # Kiểm thử API
```

Chiều phụ thuộc chính: `routes → services → repositories → database`. Validator và lỗi dùng chung cho các tầng; service không phụ thuộc Express.

## 5. Kiểm thử

Chạy `npm test` để thực thi kiểm thử API.
