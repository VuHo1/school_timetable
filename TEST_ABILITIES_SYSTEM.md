# Hướng dẫn Test Hệ thống Abilities

## Chuẩn bị Test

### 1. Setup Backend Mock (nếu cần)
Đảm bảo API `/api/user/profile` trả về format đúng:

```json
{
  "success": true,
  "data": {
    "user_name": "testuser",
    "full_name": "Test User",
    "email": "test@example.com", 
    "avatar": "https://example.com/avatar.png",
    "abilities": [
      "Cá nhân",
      "Quản lí lớp học",
      "Thời khóa biểu"
    ]
  }
}
```

### 2. Test Cases cần chạy

#### Test Case 1: User có nhiều abilities
**Bước:**
1. Login với user có abilities: `["Cá nhân", "Quản lí lớp học", "Thời khóa biểu", "Quản lí tài khoản"]`
2. Click vào menu dropdown
3. Kiểm tra các items hiển thị

**Kết quả mong đợi:**
- Menu hiển thị 4 items với icons tương ứng
- Có thể click vào từng item và navigate đúng route
- Default route là "/staff/schedule" (ưu tiên đầu tiên)

#### Test Case 2: User chỉ có 1 ability  
**Bước:**
1. Login với user có abilities: `["Cá nhân"]`
2. Kiểm tra menu dropdown
3. Thử truy cập trực tiếp `/staff/class`

**Kết quả mong đợi:**
- Menu chỉ hiển thị "Cá nhân"
- Truy cập `/staff/class` hiển thị trang "Access Denied"
- Default route là "/profile"

#### Test Case 3: User không có abilities
**Bước:**
1. Login với user có abilities: `[]` hoặc `null`
2. Kiểm tra menu dropdown

**Kết quả mong đợi:**
- Menu hiển thị "Không có quyền truy cập"
- Default route là "/profile"

#### Test Case 4: Conditional rendering trong components
**Bước:**
1. Login với user có abilities: `["Quản lí lớp học"]`
2. Vào trang `/staff/class`
3. Kiểm tra nút "Tạo lớp mới"

**Kết quả mong đợi:**
- Nút "Tạo lớp mới" hiển thị (vì có quyền "Quản lí lớp học")

**Bước:**
1. Login với user có abilities: `["Thời khóa biểu"]` (không có "Quản lí lớp học")
2. Vào trang `/staff/class`

**Kết quả mong đợi:**
- Hiển thị trang "Access Denied"

#### Test Case 5: Navigation flow
**Bước:**
1. Login với user có abilities: `["Thời khóa biểu", "Quản lí lớp học"]`
2. Kiểm tra URL root "/" redirect đúng
3. Click vào menu items khác nhau

**Kết quả mong đợi:**
- URL "/" redirect đến "/staff/schedule" (ưu tiên đầu tiên)
- Mỗi menu item navigate đúng route
- Back button hoạt động bình thường

### 3. Test bằng Browser DevTools

#### Kiểm tra localStorage:
```javascript
// Kiểm tra abilities đã lưu
console.log(localStorage.getItem('abilities'));

// Kiểm tra token và role
console.log(localStorage.getItem('authToken'));
console.log(localStorage.getItem('role'));
```

#### Kiểm tra AuthContext state:
```javascript
// Trong React DevTools, tìm AuthContext
// Kiểm tra values: role, user, abilities, loading
```

### 4. Test với Network tab

#### Kiểm tra API calls:
1. Login → gọi `/api/auth/sign-in`
2. Sau login → gọi `/api/user/profile`
3. Logout → gọi `/api/auth/sign-out`

#### Kiểm tra Response:
- `/api/user/profile` phải có field `abilities`
- Abilities phải là array of strings
- Tên abilities phải match với `PAGE_MAPPINGS`

### 5. Testing useAbilities hook

#### Tạo test component:
```jsx
function TestAbilities() {
  const { hasAbility, hasAnyAbility, isAdmin, isStaff } = useAbilities();
  
  return (
    <div>
      <p>Has "Quản lí lớp học": {hasAbility('Quản lí lớp học') ? 'Yes' : 'No'}</p>
      <p>Has any of ["Thời khóa biểu", "Điểm danh"]: {hasAnyAbility(['Thời khóa biểu', 'Điểm danh']) ? 'Yes' : 'No'}</p>
      <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
      <p>Is Staff: {isStaff() ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 6. Edge Cases cần test

#### Case 1: Abilities thay đổi giữa sessions
1. Login với user A (abilities A)
2. Logout
3. Login với user B (abilities B)
4. Kiểm tra menu cập nhật đúng

#### Case 2: Token expire
1. Login bình thường
2. Manually xóa token trong localStorage
3. Refresh page
4. Kiểm tra redirect về login

#### Case 3: API response lỗi
1. Mock API `/api/user/profile` trả về error
2. Kiểm tra error handling
3. User vẫn có thể navigate được

#### Case 4: Abilities field không tồn tại
1. Mock API trả về response không có field `abilities`
2. Kiểm tra default behavior

### 7. Performance Testing

#### Kiểm tra re-renders:
- AuthContext chỉ re-render khi cần thiết
- HeaderWithMenu chỉ re-render khi abilities thay đổi
- ProtectedRoute không gây performance issues

#### Kiểm tra memory leaks:
- Event listeners được cleanup đúng cách
- useEffect cleanup functions hoạt động

### 8. Automation Test Scripts

#### Test script mẫu:
```javascript
// test-abilities.js
const testCases = [
  {
    name: 'Admin user',
    abilities: ['Cá nhân', 'Quản lí tài khoản', 'Cấu hình hệ thống'],
    expectedMenuItems: 3,
    expectedDefaultRoute: '/admin/user_account'
  },
  {
    name: 'Staff user', 
    abilities: ['Cá nhân', 'Quản lí lớp học', 'Thời khóa biểu'],
    expectedMenuItems: 3,
    expectedDefaultRoute: '/staff/schedule'
  },
  {
    name: 'Limited user',
    abilities: ['Cá nhân'],
    expectedMenuItems: 1,
    expectedDefaultRoute: '/profile'
  }
];

// Chạy test cho từng case
testCases.forEach(runTest);
```

### 9. Checklist hoàn thành

- [ ] Login flow hoạt động đúng
- [ ] Abilities được lưu và load từ localStorage  
- [ ] Menu dropdown hiển thị đúng items
- [ ] Navigation hoạt động đúng
- [ ] ProtectedRoute block unauthorized access
- [ ] Default route logic đúng
- [ ] Conditional rendering trong components
- [ ] Logout clear data đúng cách
- [ ] Error handling hoạt động
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Cross-browser compatibility

### 10. Troubleshooting

#### Common issues:
1. **Menu không hiển thị**: Kiểm tra abilities format trong API response
2. **Access Denied luôn**: Kiểm tra ability name matching
3. **Navigation không hoạt động**: Kiểm tra PAGE_MAPPINGS
4. **Default route sai**: Kiểm tra getDefaultRoute() logic
5. **Performance chậm**: Kiểm tra unnecessary re-renders 