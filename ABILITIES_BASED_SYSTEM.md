# Hệ thống Navigation dựa trên Abilities

## Tổng quan

Hệ thống đã được cập nhật từ role-based navigation sang abilities-based navigation. Thay vì sử dụng sidebar cố định dựa trên role, giờ đây hệ thống sử dụng header với dropdown menu chứa các trang mà user có quyền truy cập.

## Thay đổi chính

### 1. AuthContext cập nhật
- Thêm state `abilities` để lưu trữ danh sách quyền của user
- Lưu abilities vào localStorage khi login
- Abilities được lấy từ API `/api/user/profile` trong field `abilities`

### 2. Layout mới: HeaderWithMenu
- Thay thế AdminLayout và StaffLayout
- Header với dropdown menu dựa trên abilities
- Chỉ hiển thị các trang mà user có quyền truy cập
- UI modern với icons và animations

### 3. ProtectedRoute component
- Kiểm tra quyền truy cập trước khi render page
- Hiển thị thông báo "Access Denied" nếu không có quyền
- Tự động redirect về trang trước đó

### 4. Routing linh hoạt
- Tất cả routes được định nghĩa trong App.jsx
- Mỗi route được wrap trong ProtectedRoute với ability tương ứng
- Default route được chọn dựa trên abilities có sẵn

## Mapping Abilities với Routes

```javascript
const PAGE_MAPPINGS = {
  'Cá nhân': '/profile',
  'Điểm danh': '/attendance',
  'Quản lí giáo viên': '/teacher',
  'Quản lí lớp học': '/staff/class',
  'Quản lí môn học': '/subject',
  'Quản lí phòng học': '/room',
  'Quản lí tiết học': '/timeslot',
  'Thời khóa biểu': '/staff/schedule',
   'Quản lí học kỳ': '/staff/semesters',
  'Thông báo': '/notification',
  'Ủy quyền chức năng': '/permission',
  'Quản lí vai trò': '/role',
  'Quản lí tài khoản': '/admin/user_account',
  'Quản lí chức năng': '/admin/user_command',
  'Cấu hình hệ thống': '/admin/setting',
  'Danh mục dùng chung': '/admin/code_list',
  'Nhật ký & Giám sát': '/log'
};
```

## Ví dụ Response từ API

API `/api/user/profile` cần trả về abilities trong format:

```json
{
  "success": true,
  "data": {
    "user_name": "tuyendht",
    "full_name": "Nguyễn Văn A",
    "email": "test@example.com",
    "avatar": "https://...",
    "abilities": [
      "Cá nhân",
      "Quản lí lớp học", 
      "Thời khóa biểu",
      "Quản lí tài khoản"
    ]
  }
}
```

## Cách thức hoạt động

1. **Login**: User đăng nhập, hệ thống lưu token và role vào localStorage
2. **Fetch Profile**: Gọi `/api/user/profile` để lấy abilities 
3. **Save Abilities**: Lưu abilities vào localStorage và state
4. **Render Menu**: HeaderWithMenu hiển thị dropdown với các trang có trong abilities
5. **Access Control**: Mỗi route được bảo vệ bởi ProtectedRoute
6. **Navigation**: User click vào menu item sẽ navigate đến trang tương ứng

## Ưu điểm

- **Linh hoạt**: Không cần thay đổi code khi thêm/bớt quyền cho user
- **Bảo mật**: Mỗi trang được kiểm tra quyền truy cập riêng biệt  
- **UX tốt**: Chỉ hiển thị những gì user có thể truy cập
- **Scalable**: Dễ dàng thêm trang mới và abilities mới

## Thêm trang mới

1. Thêm mapping vào `PAGE_MAPPINGS` trong HeaderWithMenu.jsx
2. Thêm icon vào `getMenuIcon()` function
3. Thêm route vào App.jsx với ProtectedRoute wrapper
4. Tạo component page mới

## Cấu hình Backend

Backend cần đảm bảo:
- API `/api/user/profile` trả về field `abilities` 
- Abilities là array chứa tên các quyền bằng tiếng Việt
- Tên abilities phải match chính xác với PAGE_MAPPINGS

## Files đã thay đổi

- `src/context/AuthContext.jsx` - Thêm abilities management
- `src/components/layout/HeaderWithMenu.jsx` - Layout mới
- `src/components/ProtectedRoute.jsx` - Access control
- `src/App.jsx` - Routing logic mới
- Các page components - Không thay đổi, vẫn hoạt động bình thường

## Testing

1. Login với user có abilities khác nhau
2. Kiểm tra dropdown menu chỉ hiển thị trang được phép
3. Thử truy cập trực tiếp URL của trang không có quyền
4. Xác nhận redirect đúng khi không có quyền 