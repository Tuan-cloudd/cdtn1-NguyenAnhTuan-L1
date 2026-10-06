## 1. Quy ước chung (General Conventions)

- **Định dạng dữ liệu:** Trao đổi dữ liệu thông qua định dạng `JSON` cho tất cả Request và Response.
- **Xác thực (Authentication):** Sử dụng `Bearer Token` truyền trong Header (`Authorization: Bearer {token}`).
- **Múi giờ:** Định dạng chuẩn ISO 8601 (ví dụ: `2026-10-06T12:29:00Z`).
- **Cấu trúc lỗi chung (Error Response):**
  ```json
  {
    "error": true,
    "code": "ERROR_CODE",
    "message": "Mô tả lỗi chi tiết cho người dùng"
  }
  ```

---

## 2. Danh sách Endpoints

| Phương thức | Đường dẫn (Endpoint)               | Mục đích                               | User Story | Mức quyền |
| :---------- | :--------------------------------- | :------------------------------------- | :--------- | :-------- |
| **POST**    | `/api/customers`                   | Tạo mới hồ sơ khách hàng[cite: 9]      | US1        | NVKD      |
| **GET**     | `/api/customers/{id}`              | Xem chi tiết hồ sơ khách hàng[cite: 9] | US2        | NVKD      |
| **POST**    | `/api/customers/merge`             | Gộp các hồ sơ bị trùng lặp[cite: 9]    | US3        | QTV       |
| **POST**    | `/api/customers/{id}/tags`         | Gắn thẻ/nhãn cho khách hàng[cite: 9]   | US4        | NVKD      |
| **PUT**     | `/api/customers/{id}`              | Cập nhật thông tin chi tiết[cite: 10]  | US5        | NVKD      |
| **GET**     | `/api/customers`                   | Phân loại và lọc khách hàng[cite: 10]  | US6        | NVKD      |
| **GET**     | `/api/customers/{id}/transactions` | Xem lịch sử giao dịch[cite: 10]        | US7        | NVKD      |
| **PATCH**   | `/api/customers/{id}/status`       | Khóa hoặc mở khóa hồ sơ[cite: 10]      | US8        | QTV       |

---

## 3. Chi tiết từng Endpoint và Bảng Validation

### 3.1. Tạo mới hồ sơ khách hàng (US1)

**Mô tả:** Khởi tạo hồ sơ khách hàng mới để lưu trữ thông tin liên hệ[cite: 9].

- **Endpoint:** `POST /api/customers`
- **Bảng Validation:**

| Trường dữ liệu | Bắt buộc | Kiểu dữ liệu | Ràng buộc / Dải giá trị                   | Thông báo lỗi                                                                            |
| :------------- | :------- | :----------- | :---------------------------------------- | :--------------------------------------------------------------------------------------- |
| `name`         | Có       | String       | Max 100 ký tự                             | "Vui lòng nhập Tên khách hàng"                                                           |
| `phone`        | Có       | String       | 10-11 số, duy nhất trên hệ thống[cite: 9] | "Vui lòng nhập Số điện thoại"[cite: 9] / "Số điện thoại này đã được sử dụng..."[cite: 9] |

- **Request JSON mẫu:**
  ```json
  {
    "name": "Nguyễn Văn A",
    "phone": "0901234567"
  }
  ```
- **Response thành công (201 Created):**
  ```json
  {
    "id": "CUST-1001",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "status": "active",
    "createdAt": "2026-10-06T12:29:00Z"
  }
  ```

### 3.2. Xem chi tiết hồ sơ khách hàng (US2)

**Mô tả:** Truy xuất thông tin liên hệ và các thông tin liên quan của một khách hàng cụ thể[cite: 9].

- **Endpoint:** `GET /api/customers/{id}`
- **Response thành công (200 OK):**
  ```json
  {
    "id": "CUST-1001",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@email.com",
    "tags": ["VIP"],
    "status": "active"
  }
  ```
- **Response lỗi (404 Not Found):** Trả về khi truy cập hồ sơ đã bị xóa hoặc không tồn tại[cite: 9].
  ```json
  {
    "error": true,
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Hồ sơ không tồn tại hoặc đã bị xóa"
  }
  ```

### 3.3. Cập nhật thông tin chi tiết hồ sơ (US5)

**Mô tả:** Cập nhật các thông tin liên hệ (như email) khi có sự thay đổi[cite: 10].

- **Endpoint:** `PUT /api/customers/{id}`
- **Bảng Validation:**

| Trường dữ liệu | Bắt buộc | Kiểu dữ liệu | Ràng buộc / Dải giá trị                                     | Thông báo lỗi                            |
| :------------- | :------- | :----------- | :---------------------------------------------------------- | :--------------------------------------- |
| `email`        | Không    | String       | Phải chứa ký tự "@" và đúng chuẩn định dạng email[cite: 10] | "Định dạng email không hợp lệ"[cite: 10] |
| `name`         | Không    | String       | Max 100 ký tự                                               | "Tên không được vượt quá 100 ký tự"      |

- **Request JSON mẫu:**
  ```json
  {
    "email": "nguyenvana_new@email.com"
  }
  ```
- **Response thành công (200 OK):** Trả về object khách hàng đã được cập nhật thành công[cite: 10].

### 3.4. Khóa hoặc mở khóa hồ sơ (US8)

**Mô tả:** Thay đổi trạng thái hồ sơ để kiểm soát quyền sử dụng, chỉ dành cho Quản trị viên[cite: 10].

- **Endpoint:** `PATCH /api/customers/{id}/status`
- **Bảng Validation:**

| Trường dữ liệu | Bắt buộc | Kiểu dữ liệu | Ràng buộc / Dải giá trị                                              | Thông báo lỗi             |
| :------------- | :------- | :----------- | :------------------------------------------------------------------- | :------------------------ |
| `status`       | Có       | String       | Chỉ chấp nhận "active" (hoạt động) hoặc "locked" (đã khóa)[cite: 10] | "Trạng thái không hợp lệ" |

- **Request JSON mẫu:**
  ```json
  {
    "status": "locked"
  }
  ```
- **Response thành công (200 OK):**
  ```json
  {
    "id": "CUST-1001",
    "status": "locked",
    "updatedAt": "2026-10-06T13:00:00Z"
  }
  ```
- **Response lỗi (403 Forbidden):**
  ```json
  {
    "error": true,
    "code": "FORBIDDEN",
    "message": "Chỉ Quản trị viên mới có quyền thực hiện thao tác này"
  }
  ```
