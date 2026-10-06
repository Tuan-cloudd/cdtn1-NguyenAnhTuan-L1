## 1. Giới thiệu và Bảng thuật ngữ

**1.1. Mục đích**
Tài liệu này đặc tả các yêu cầu phần mềm cho hệ thống (Epic 1) "Quản lý hồ sơ khách hàng"[cite: 9]. Tài liệu dùng làm cơ sở để đội ngũ phát triển xây dựng chức năng quản lý, phân loại và theo dõi lịch sử giao dịch của khách hàng[cite: 9, 10].

**1.2. Bảng thuật ngữ**

- **Epic:** Nhóm tính năng lớn trong hệ thống phần mềm (ở đây là Quản lý hồ sơ khách hàng)[cite: 9].
- **NVKD (Nhân viên kinh doanh):** Người dùng trực tiếp thao tác tạo mới, xem, cập nhật và phân loại hồ sơ khách hàng[cite: 9, 10].
- **QTV (Quản trị viên):** Người dùng cấp cao có quyền gộp hồ sơ trùng lặp và khóa/mở khóa hồ sơ[cite: 9, 10].
- **US (User Story):** Cấu trúc mô tả yêu cầu chức năng dưới góc nhìn người dùng[cite: 9].
- **AC (Acceptance Criteria - Tiêu chí chấp nhận):** Các điều kiện cụ thể (bao gồm cả luồng thành công và ngoại lệ) mà hệ thống phải đáp ứng để hoàn thành một US[cite: 9].

---

## 2. Mô tả tổng quan

Hệ thống "Quản lý hồ sơ khách hàng" phục vụ hai nhóm người dùng chính là Nhân viên kinh doanh và Quản trị viên[cite: 9, 10]. Hệ thống cho phép khởi tạo hồ sơ bằng các thông tin liên hệ bắt buộc như Tên và Số điện thoại[cite: 9]. Xuyên suốt quá trình vận hành, hệ thống cung cấp công cụ để phân loại khách hàng theo nhãn dán, lọc khách hàng theo hành vi mua sắm, tra cứu lịch sử giao dịch và duy trì tính toàn vẹn của dữ liệu thông qua việc kiểm soát định dạng nhập liệu và loại bỏ dữ liệu trùng lặp[cite: 9, 10].

---

## 3. Yêu cầu chức năng (User Stories)

Các yêu cầu chức năng của hệ thống được chia theo độ ưu tiên:

**Mức độ ưu tiên Cao:**

- **US1:** Là Nhân viên kinh doanh, tôi muốn tạo mới hồ sơ khách hàng để lưu trữ thông tin liên hệ và lịch sử giao dịch ban đầu[cite: 9].
- **US2:** Là Nhân viên kinh doanh, tôi muốn xem chi tiết hồ sơ khách hàng để nắm được thông tin liên hệ và thông tin liên quan của khách hàng[cite: 9].
- **US3:** Là Quản trị viên, tôi muốn hệ thống tự động gộp các hồ sơ khách hàng bị trùng lặp để tránh dư thừa dữ liệu và quản lý tập trung[cite: 9].
- **US5:** Là Nhân viên kinh doanh, tôi muốn cập nhật thông tin chi tiết hồ sơ khách hàng để đảm bảo dữ liệu luôn chính xác khi có thay đổi[cite: 10].
- **US8:** Là Quản trị viên, tôi muốn khóa hoặc mở khóa hồ sơ khách hàng để kiểm soát những hồ sơ không còn được phép sử dụng trong hệ thống[cite: 10].

**Mức độ ưu tiên Trung bình:**

- **US4:** Là Nhân viên kinh doanh, tôi muốn gắn thẻ/nhãn khách hàng theo giá trị mua sắm để dễ dàng nhận diện khách hàng VIP[cite: 9].
- **US6:** Là Nhân viên kinh doanh, tôi muốn phân loại khách hàng theo hành vi mua để có kế hoạch chăm sóc phù hợp[cite: 10].
- **US7:** Là Nhân viên kinh doanh, tôi muốn xem lịch sử giao dịch của khách hàng để theo dõi quá trình mua hàng và hỗ trợ khách hàng tốt hơn[cite: 10].

---

## 4. Yêu cầu phi chức năng

Hệ thống cần đáp ứng các điều kiện về xác thực và kiểm soát dữ liệu:

- **Bảo mật & Phân quyền:** Các chức năng nhạy cảm như "Gộp hồ sơ" bắt buộc phải được ẩn đối với Nhân viên kinh doanh; chỉ có tài khoản Quản trị viên mới được phép thao tác[cite: 9].
- **Ràng buộc dữ liệu (Validation):**
  - Hệ thống không cho phép lưu nếu bỏ trống trường Số điện thoại[cite: 9].
  - Hệ thống sẽ báo lỗi và chặn tạo mới nếu Số điện thoại đã tồn tại trên hệ thống[cite: 9].
  - Trường địa chỉ email khi cập nhật bắt buộc phải đúng định dạng (có ký tự "@")[cite: 10].
  - Tên thẻ/nhãn tạo mới không được trùng lặp hoàn toàn với nhãn đã có trong danh mục[cite: 9].
- **Giao diện người dùng (UI/UX):** Khi xảy ra lỗi validation, hệ thống phải giữ nguyên màn hình, bôi đỏ các trường sai và hiển thị cảnh báo rõ ràng thay vì tải lại toàn bộ trang[cite: 9].

---

## 5. Hợp đồng API (API Contract)

Dưới đây là thiết kế danh sách các Endpoint để đáp ứng các User Story nêu trên:

| Phương thức | Đường dẫn (Endpoint)               | Mục đích                                           | Dành cho Actor       | Liên kết US |
| :---------- | :--------------------------------- | :------------------------------------------------- | :------------------- | :---------- |
| **POST**    | `/api/customers`                   | Tạo mới hồ sơ khách hàng                           | Nhân viên kinh doanh | US1         |
| **GET**     | `/api/customers/{id}`              | Lấy chi tiết thông tin hồ sơ                       | Nhân viên kinh doanh | US2         |
| **PUT**     | `/api/customers/{id}`              | Cập nhật thông tin chi tiết (email, sđt)           | Nhân viên kinh doanh | US5         |
| **POST**    | `/api/customers/merge`             | Gộp hai hồ sơ trùng lặp                            | Quản trị viên        | US3         |
| **POST**    | `/api/customers/{id}/tags`         | Gắn thẻ/nhãn (như VIP) cho khách hàng              | Nhân viên kinh doanh | US4         |
| **GET**     | `/api/customers?behavior={filter}` | Lọc danh sách theo hành vi mua                     | Nhân viên kinh doanh | US6         |
| **GET**     | `/api/customers/{id}/transactions` | Lấy lịch sử giao dịch (hỗ trợ phân trang/tìm kiếm) | Nhân viên kinh doanh | US7         |
| **PATCH**   | `/api/customers/{id}/status`       | Khóa/Mở khóa trạng thái hồ sơ                      | Quản trị viên        | US8         |

---

## 6. Bảng truy vết yêu cầu (Traceability Matrix)

| ID      | Tên Yêu Cầu                           | Tác nhân (Actor)               | Độ ưu tiên           | API liên kết                       | Tiêu chí chấp nhận (AC)                         | Trạng thái     |
| :------ | :------------------------------------ | :----------------------------- | :------------------- | :--------------------------------- | :---------------------------------------------- | :------------- |
| **US1** | Tạo mới hồ sơ[cite: 9]                | Nhân viên kinh doanh[cite: 9]  | Cao[cite: 9]         | `POST /api/customers`              | Đã có 3 AC (bao gồm bắt lỗi SĐT)[cite: 9]       | Cần triển khai |
| **US2** | Xem chi tiết hồ sơ[cite: 9]           | Nhân viên kinh doanh[cite: 9]  | Cao[cite: 9]         | `GET /api/customers/{id}`          | Đã có 2 AC[cite: 9]                             | Cần triển khai |
| **US3** | Gộp hồ sơ trùng lặp[cite: 9]          | Quản trị viên[cite: 9]         | Cao[cite: 9]         | `POST /api/customers/merge`        | Đã có 2 AC (phân quyền QTV)[cite: 9]            | Cần triển khai |
| **US4** | Gắn thẻ/nhãn khách hàng[cite: 9]      | Nhân viên kinh doanh[cite: 9]  | Trung bình[cite: 9]  | `POST /api/customers/{id}/tags`    | Đã có 3 AC (đề xuất VIP, bắt trùng)[cite: 9]    | Cần triển khai |
| **US5** | Cập nhật thông tin chi tiết[cite: 10] | Nhân viên kinh doanh[cite: 10] | Cao[cite: 10]        | `PUT /api/customers/{id}`          | Đã có 2 AC (kiểm tra định dạng email)[cite: 10] | Cần triển khai |
| **US6** | Phân loại theo hành vi mua[cite: 10]  | Nhân viên kinh doanh[cite: 10] | Trung bình[cite: 10] | `GET /api/customers?behavior=`     | Đã có 3 AC (lưu tập khách hàng)[cite: 10]       | Cần triển khai |
| **US7** | Xem lịch sử giao dịch[cite: 10]       | Nhân viên kinh doanh[cite: 10] | Trung bình[cite: 10] | `GET /.../{id}/transactions`       | Đã có 3 AC (sắp xếp, tìm kiếm, lọc)[cite: 10]   | Cần triển khai |
| **US8** | Khóa/Mở khóa hồ sơ[cite: 10]          | Quản trị viên[cite: 10]        | Cao[cite: 10]        | `PATCH /api/customers/{id}/status` | Đã có 2 AC (Khóa và Mở khóa)[cite: 10]          | Cần triển khai |
