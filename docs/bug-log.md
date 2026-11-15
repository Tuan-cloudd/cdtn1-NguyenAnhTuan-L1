# Bug Log

## BUG-01 — Gộp hồ sơ làm thất lạc nhãn và giao dịch

1. **Mã / tiêu đề:** BUG-01 — Không chuyển nhãn và giao dịch khi gộp hồ sơ.
2. **Mức độ:** Major — làm sai lệch dữ liệu khách hàng và lịch sử giao dịch sau khi gộp.
3. **Môi trường / điều kiện:** Node.js 22, SQLite; hai hồ sơ tồn tại; tài khoản QTV; hồ sơ nguồn có nhãn và giao dịch.
4. **Bước tái hiện:** Tạo hồ sơ nguồn và đích; gắn nhãn, thêm giao dịch cho nguồn; gọi `POST /api/customers/merge` với `sourceCustomerId` và `targetCustomerId`; đọc hồ sơ đích và lịch sử giao dịch.
5. **Kết quả mong đợi:** Nhãn và giao dịch nguồn được chuyển sang hồ sơ đích; nhãn trùng không nhân bản; hồ sơ nguồn được đánh dấu `merged`; thao tác gộp nguyên tử.
6. **Kết quả thực tế / nguyên nhân:** API trả thành công nhưng chỉ đánh dấu nguồn `MERGED`; nhãn và giao dịch vẫn liên kết nguồn. Repository trước sửa không chuyển các bản ghi liên quan.
7. **Bản sửa / kiểm thử / commit:** Đã chuyển nhãn và giao dịch trong cùng transaction; test hồi quy xác nhận nhãn trùng, lịch sử đích và nguồn rỗng. [Commit sửa BUG-01](https://github.com/Tuan-cloudd/cdtn1-NguyenAnhTuan-L1/commit/fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7).

## BUG-02 — Endpoint giao dịch bỏ qua phân trang và tìm kiếm

1. **Mã / tiêu đề:** BUG-02 — Query `page`, `limit`, `search` không được áp dụng.
2. **Mức độ:** Medium — client không thể lấy trang hoặc lọc lịch sử như API contract yêu cầu.
3. **Môi trường / điều kiện:** Node.js 22, SQLite; hồ sơ có ít nhất hai giao dịch; token hợp lệ.
4. **Bước tái hiện:** Gọi `GET /api/customers/:id/transactions?limit=1&page=1`; gọi lại với `search=regular`.
5. **Kết quả mong đợi:** Request phân trang trả tối đa một giao dịch; tìm kiếm chỉ trả giao dịch có loại hành vi khớp từ khóa.
6. **Kết quả thực tế / nguyên nhân:** Request `limit=1` vẫn trả toàn bộ hai giao dịch và `search` không lọc; route/service/repository cũ không đọc query.
7. **Bản sửa / kiểm thử / commit:** Đã thêm kiểm tra `page`/`limit` (limit tối đa 100), tìm kiếm theo `behavior_cat`, giữ response dạng mảng; test hồi quy xác nhận trang 1/2, tìm kiếm và dữ liệu sai. [Commit sửa BUG-02](https://github.com/Tuan-cloudd/cdtn1-NguyenAnhTuan-L1/commit/fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7).

## BUG-03 — Sai phân quyền tạo hồ sơ và sai người tạo

1. **Mã / tiêu đề:** BUG-03 — Admin tạo được hồ sơ và hồ sơ không ghi nhận user thực hiện.
2. **Mức độ:** Medium — hành vi không đúng vai trò theo API contract và làm sai thông tin audit `created_by`.
3. **Môi trường / điều kiện:** Node.js 22, SQLite; tài khoản QTV và NVKD hoạt động.
4. **Bước tái hiện:** Đăng nhập bằng QTV; gọi `POST /api/customers` với tên và số điện thoại hợp lệ; kiểm tra mã HTTP và cột `customer.created_by`.
5. **Kết quả mong đợi:** QTV bị từ chối vì tạo hồ sơ dành cho NVKD; khi NVKD tạo hồ sơ, `created_by` phải trỏ đúng user NVKD đang đăng nhập.
6. **Kết quả thực tế / nguyên nhân:** QTV trước sửa nhận `201`; repository chọn NVKD đầu tiên trong database thay vì user từ phiên đăng nhập.
7. **Bản sửa / kiểm thử / commit:** Đã giới hạn endpoint cho NVKD, truyền user ID đang xác thực vào repository, ẩn nút tạo trên UI QTV; test xác nhận QTV nhận `403` và `created_by` trỏ đúng người tạo. [Commit sửa BUG-03](https://github.com/Tuan-cloudd/cdtn1-NguyenAnhTuan-L1/commit/fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7).

## Tổng kết

- Bug đã sửa: **3**.
- Critical/Major: **1 Major**.
- Kiểm thử hồi quy: `npm test` — **12/12 PASS** sau khi sửa.
- Commit chứa các bản sửa: [fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7](https://github.com/Tuan-cloudd/cdtn1-NguyenAnhTuan-L1/commit/fa9bab464d9203bd1fe3f1115aa67e6eb3fafee7).
