# Hướng Dẫn Sử Dụng Tính Năng Cập Nhật Lớp Học

## Tổng quan
Tính năng cập nhật lớp học cho phép staff cập nhật thông tin giáo viên chủ nhiệm và phòng học cho các lớp đã tồn tại.

## Cách truy cập
1. Từ trang danh sách lớp học (`/staff/class`), click vào nút "Cập nhật" ở cột Actions
2. Hoặc từ trang chi tiết lớp học (`/staff/class/{classCode}`), click vào nút "Cập nhật lớp học"

## Chức năng

### 1. Cập nhật giáo viên chủ nhiệm
- Hiển thị thông tin GVCN hiện tại
- Dropdown chọn GVCN mới từ danh sách available teachers
- Nếu không có available teachers, hệ thống sẽ load tất cả teachers
- Validation: không cho cập nhật trùng với GVCN hiện tại

### 2. Cập nhật phòng học
- Hiển thị thông tin phòng học hiện tại
- Dropdown chọn phòng học mới từ danh sách available rooms
- Nếu không có available rooms, hệ thống sẽ load tất cả rooms
- Validation: không cho cập nhật trùng với phòng hiện tại

## API Endpoints sử dụng

### 1. Lấy danh sách giáo viên
- **Available Teachers**: `GET /api/teacher/available`
- **All Teachers**: `GET /api/teacher` (fallback)

### 2. Lấy danh sách phòng học
- **Available Rooms**: `GET /api/room/available`
- **All Rooms**: `GET /api/room` (fallback)

### 3. Cập nhật thông tin
- **Update Teacher**: `PUT /api/class/update/class-teacher`
- **Update Room**: `PUT /api/class/update/class-room`

## Cấu trúc file

### Components
- `src/pages/staff/UpdateClass.jsx` - Component chính
- `src/api.js` - Chứa API functions

### Routes
- `/staff/class/update/:classCode` - Route cho trang cập nhật

## Xử lý lỗi
- Loading states cho các API calls
- Error handling với thông báo chi tiết
- Success notifications khi cập nhật thành công
- Fallback mechanism khi không có available resources

## Debugging
- Console.log để debug API responses
- Error messages chi tiết cho user
- Loading states để UX tốt hơn

## Lưu ý
- Chỉ staff mới có quyền truy cập
- Phải có authentication token hợp lệ
- Auto-reload data sau khi cập nhật thành công 