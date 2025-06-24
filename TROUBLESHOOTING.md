# Troubleshooting - Tính Năng Update Class

## Các vấn đề đã được sửa

### 1. ✅ Xung đột file UpdateClass.jsx
**Vấn đề**: Có 2 file cùng tên `UpdateClass.jsx` trong:
- `/src/components/UpdateClass.jsx` (cũ)
- `/src/pages/staff/UpdateClass.jsx` (mới)

**Giải pháp**: Đã xóa file cũ trong `/src/components/`

### 2. ✅ Error "Error is not a constructor"
**Vấn đề**: Conflict giữa styled component tên `Error` và JavaScript built-in `Error` class

**Giải pháp**: Đã đổi tên styled component thành `ErrorMessage`

### 3. ✅ API trả về data_set rỗng
**Vấn đề**: API `/api/teacher/available` và `/api/room/available` chỉ trả về teachers/rooms chưa được assign

**Giải pháp**: 
- Thêm fallback mechanism
- Nếu available rỗng thì gọi API `/api/teacher` và `/api/room` để load tất cả
- Hiển thị thông tin lớp đang dạy/sử dụng trong dropdown

## Checklist kiểm tra

### 1. Routing
- [x] Route `/staff/class/update/:classCode` đã được thêm vào App.jsx
- [x] Import UpdateClass component đúng đường dẫn
- [x] Navigation từ ClassManagement.jsx
- [x] Navigation từ ClassDetail.jsx

### 2. API Functions
- [x] `updateClassTeacher()` đã được export từ api.js
- [x] `updateClassRoom()` đã được export từ api.js  
- [x] `fetchAvailableTeachers()` đã được export từ api.js
- [x] `fetchAvailableRooms()` đã được export từ api.js
- [x] `fetchAllTeachers()` đã được export từ api.js
- [x] `fetchAllRooms()` đã được export từ api.js

### 3. Component Features
- [x] Loading states
- [x] Error handling
- [x] Success notifications  
- [x] Form validation
- [x] Fallback mechanism cho empty data
- [x] Console.log cho debugging

## Cách test

### 1. Test Navigation
1. Vào `/staff/class` (Class Management)
2. Click nút "Cập nhật" của một lớp bất kỳ
3. Kiểm tra URL có chuyển thành `/staff/class/update/{classCode}` không

### 2. Test API Loading
1. Mở Developer Tools > Console
2. Vào trang update class
3. Kiểm tra console.log hiển thị:
   - "Available Teachers: [...]"
   - "Available Rooms: [...]"
   - "Class Data: {...}"

### 3. Test Update Functions
1. Chọn teacher/room khác với hiện tại
2. Click "Cập nhật GVCN" hoặc "Cập nhật phòng học"
3. Kiểm tra có success message không
4. Kiểm tra data có được reload không

## Những vấn đề có thể gặp

### 1. API không trả về data
**Triệu chứng**: Console.log hiển thị `Available Teachers: []` và `Available Rooms: []`

**Nguyên nhân**: 
- API endpoint không hoạt động
- Authentication token hết hạn
- Server response format không đúng

**Cách debug**:
```javascript
// Thêm vào loadData function
console.log('API Base URL:', API_BASE_URL);
console.log('Token:', localStorage.getItem('authToken'));
```

### 2. Update không thành công
**Triệu chứng**: Hiển thị error message khi click update

**Nguyên nhân**:
- API endpoint không hoạt động  
- Request payload format không đúng
- Validation error từ server

**Cách debug**:
```javascript
// Thêm vào update functions
console.log('Update payload:', { class_code: classCode, teacher_user_name: selectedTeacher });
console.log('API response:', result);
```

### 3. Component không render
**Triệu chứng**: Trang trắng hoặc lỗi import

**Nguyên nhân**:
- File path không đúng
- Missing dependencies
- Syntax error

**Cách debug**:
- Kiểm tra browser console có error không
- Kiểm tra network tab có API calls không
- Verify import paths trong App.jsx

## Commands hữu ích

```bash
# Chạy ứng dụng
npm run dev

# Check syntax errors
npm run lint

# Build để test production
npm run build
``` 