# Test Report

## 1. Thông tin báo cáo

- Dự án: cdtn1-NguyenAnhTuan-L1
- Ngày chạy: 15/11/2026
- Người thực hiện: Nguyễn Anh Tuấn
- Môi trường: Windows, Node.js v22.14.0, npm 10.9.2, SQLite in-memory
- Runner: `npm test` (`node --test` + Supertest)
- Commit được kiểm thử: [fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7](https://github.com/Tuan-cloudd/cdtn1-NguyenAnhTuan-L1/commit/fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7)

## 2. Tổng quan kết quả

- Tổng số test case: 12
- PASS: 12
- FAIL: 0
- BLOCKED: 0
- Số lần chạy độc lập sau sửa: 2; cả hai lần đều 12/12 PASS

## 3. Kết quả chi tiết (8 cột)

| ID | Loại | Endpoint / phạm vi | Điều kiện | Dữ liệu / bước chính | Kết quả mong đợi | Kết quả thực tế | Trạng thái / bằng chứng |
|---|---|---|---|---|---|---|---|
| TC-01 | Chức năng | `GET /health` | App hoạt động | Gọi health endpoint | HTTP 200, `status=ok` | Assertion đạt | PASS |
| TC-02 | Auth + dữ liệu sai | `POST /api/auth/login` | Seed admin | Đăng nhập đúng và sai mật khẩu | 200 + token; sai mật khẩu 401 | Assertions đạt | PASS |
| TC-03 | Bảo mật | `GET /api/customers` | Không token | Gọi API không xác thực | 401 `UNAUTHENTICATED` | Assertion đạt | PASS |
| TC-04 | Session | Logout / me | Token hợp lệ | Logout rồi dùng lại token | 204; token bị từ chối | Assertions đạt | PASS |
| TC-05 | Luồng đúng + phân quyền | Tạo và đọc hồ sơ | NVKD và QTV | NVKD tạo; kiểm tra `created_by`; QTV thử tạo | NVKD 201 đúng creator; QTV 403 | Assertions đạt | PASS; BUG-03 regression |
| TC-06 | Chất lượng dữ liệu | Tạo hồ sơ | NVKD đăng nhập | Tạo hai hồ sơ cùng số điện thoại | Lần hai 409 `PHONE_EXISTS` | Assertion đạt | PASS |
| TC-07 | Validation | Cập nhật hồ sơ | Hồ sơ tồn tại | Cập nhật email sai định dạng | 400 `VALIDATION_ERROR` | Assertion đạt | PASS |
| TC-08 | Biên dữ liệu | Cập nhật hồ sơ | Hồ sơ tồn tại | Cập nhật rồi xóa các trường tùy chọn | 200; trường được xóa thành null | Assertions đạt | PASS |
| TC-09 | RBAC + toàn vẹn | Xóa hồ sơ | QTV, NVKD, hồ sơ liên quan | NVKD thử xóa; QTV xóa và kiểm tra dữ liệu liên quan | 403; sau đó 204 và xóa liên quan | Assertions đạt | PASS |
| TC-10 | Chức năng | Đổi trạng thái | QTV, hồ sơ tồn tại | Đổi trạng thái sang `locked` | 200, status `locked` | Assertion đạt | PASS |
| TC-11 | RBAC | Đổi trạng thái | NVKD, hồ sơ tồn tại | NVKD thử thao tác admin-only | 403 `FORBIDDEN` | Assertion đạt | PASS |
| TC-12 | Gộp + phân trang + tìm kiếm | Merge, giao dịch, nhãn | QTV; hai hồ sơ và các dữ liệu liên quan | Gộp hồ sơ; đọc nhãn/giao dịch; thử page 1/2, limit, search, page sai | Dữ liệu chuyển đúng; phân trang/tìm kiếm đúng; page sai 400 | Assertions đạt | PASS; BUG-01/02 regression |

## 4. Kết luận

- Kết quả suite: **PASS (12/12)**.
- Ba lỗi được tái hiện trước sửa và có test hồi quy sau sửa; chi tiết tại [Bug Log](./bug-log.md).
- Kết quả là kiểm thử tự động bằng Supertest, không phải kết quả chạy Postman.
- Bộ test không đại diện cho kiểm thử tải hoặc kiểm thử xâm nhập.

## 5. Screenshots / evidence

Ảnh hiện có tại [docs/screenshots](./screenshots/). Kết luận PASS được xác nhận bằng assertion của `npm test`; ảnh là bằng chứng bổ sung và không thay thế kết quả chạy test.
