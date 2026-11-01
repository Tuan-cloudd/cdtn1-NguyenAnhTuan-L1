# Thay đổi thiết kế: quản lý hồ sơ khách hàng

## Chỉnh sửa thông tin

Biểu mẫu chỉnh sửa hồ sơ cho phép cập nhật các thông tin không bắt buộc: email, địa chỉ, ngày sinh và ghi chú. Các trường có thể để trống hoặc xóa giá trị đã lưu. Tên khách hàng vẫn bắt buộc; số điện thoại không thay đổi trong luồng chỉnh sửa. Chi tiết hồ sơ hiển thị giá trị đã lưu hoặc trạng thái chưa cập nhật.

## Xóa hồ sơ

Chỉ tài khoản Quản trị viên (QTV) được nhìn thấy và sử dụng nút xóa hồ sơ. Giao diện yêu cầu xác nhận trước khi gọi API; API tiếp tục kiểm tra vai trò để bảo vệ thao tác. Hồ sơ không tồn tại trả về lỗi 404. Xóa hồ sơ cũng xóa các nhãn và giao dịch liên kết theo khóa ngoại; hồ sơ khác từng gộp vào hồ sơ này vẫn được giữ lại.