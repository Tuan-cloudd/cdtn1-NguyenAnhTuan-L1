# Test Plan

## 1. Thông tin dự án

- Dự án: cdtn1-NguyenAnhTuan-L1
- Mục tiêu: Kiểm thử API và chức năng nghiệp vụ của hệ thống quản lý hồ sơ khách hàng & phân khúc
- Repo:(https://github.com/Tuan-cloudd/cdtn1-NguyenAnhTuan-L1/tree/v0.2)
- Người kiểm thử: Nguyen Anh Tuan
- Ngày tạo: 07/11/2026

## 2. Mục tiêu kiểm thử

- Kiểm tra các API chính hoạt động đúng theo yêu cầu.
- Đảm bảo tính chính xác của dữ liệu và xử lý lỗi.
- Xác nhận các luồng nghiệp vụ quan trọng không bị lỗi.
- Thu thập bằng chứng thực tế cho báo cáo cuối cùng.

## 3. Phạm vi kiểm thử

### 3.1. Phạm vi bao phủ

- Tạo hồ sơ khách hàng
- Cập nhật hồ sơ khách hàng
- Lọc và tìm kiếm khách hàng
- Phân loại theo nhãn / phân khúc
- Gộp hồ sơ trùng
- Khóa / mở khóa hồ sơ
- Xác thực người dùng / session
- Xử lý lỗi dữ liệu đầu vào

### 3.2. Không bao phủ

- Tải performance / stress test
- Test đa người dùng đồng thời
- Test bảo mật nâng cao (nếu không nằm trong scope bài)

## 4. Môi trường kiểm thử

- Hệ điều hành: Windows
- Node.js: v22.14.0
- Database: SQLite
- Server: Express API
- URL test: http://localhost:3000

## 5. Điều kiện chạy test

1. Cài đặt dependency: `npm install`
2. Chạy migration: `npm run db:migrate`
3. Chạy server: `npm run dev`
4. Kiểm tra API bằng Postman, curl hoặc test script

## 6. Test Cases

| ID    | Mô tả test                      | Kịch bản                        | Dữ liệu đầu vào               | Kết quả mong đợi                      | Trạng thái |
| ----- | ------------------------------- | ------------------------------- | ----------------------------- | ------------------------------------- | ---------- |
| TC-01 | Health check API                | Gọi endpoint `/health`          | Không có                      | Trả về status 200 và thông tin server | Pending    |
| TC-02 | Đăng nhập thành công            | Gửi email/password hợp lệ       | admin@example.com / Admin123! | Trả về token và trạng thái 200        | Pending    |
| TC-03 | Đăng nhập sai mật khẩu          | Gửi email hợp lệ + mật khẩu sai | admin@example.com / sai123    | Trả về lỗi 401                        | Pending    |
| TC-04 | Tạo hồ sơ khách hàng            | Gửi payload hợp lệ              | { ... }                       | Tạo mới thành công                    | Pending    |
| TC-05 | Tạo hồ sơ thiếu trường bắt buộc | Gửi payload thiếu thông tin     | { ... }                       | Trả về lỗi validation                 | Pending    |
| TC-06 | Lấy danh sách khách hàng        | Gọi GET `/api/customers`        | Không có                      | Trả về danh sách + status 200         | Pending    |
| TC-07 | Lọc khách hàng theo trạng thái  | Gọi filter theo status          | active                        | Trả về dữ liệu đúng                   | Pending    |
| TC-08 | Cập nhật hồ sơ                  | Gửi dữ liệu cập nhật            | { ... }                       | Dữ liệu được cập nhật                 | Pending    |
| TC-09 | Gộp hồ sơ trùng                 | Gọi API gộp hồ sơ               | 2 hồ sơ có dữ liệu trùng      | Một hồ sơ giữ lại và dữ liệu hợp nhất | Pending    |
| TC-10 | Khóa hồ sơ                      | Gửi request khóa                | customerId                    | Trạng thái chuyển sang locked         | Pending    |
| TC-11 | Mở khóa hồ sơ                   | Gửi request mở khóa             | customerId                    | Trạng thái chuyển về active           | Pending    |
| TC-12 | Lỗi không tìm thấy tài nguyên   | Gọi ID không tồn tại            | customerId không hợp lệ       | Trả về 404                            | Pending    |

## 7. Link liên quan

- Test Report: [Xem Test Report](./test-report.md)
- Bug Log: [Xem Bug Log](./bug-log.md)
- Screenshots: [Xem ảnh minh chứng](./screenshots/)
