import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ModernHeader from './components/layout/ModernHeader';
import ProtectedRoute from './components/ProtectedRoute';
import PlaceholderPage from './components/PlaceholderPage';
import Login from './pages/auth/Login';
import UserAccount from './pages/admin/UserAccount';
import CodeList from './pages/admin/CodeList';
import UserCommand from './pages/admin/UserCommand';
import Setting from './pages/admin/Setting';
import ViewSchedule from './pages/staff/ViewSchedule';
import ClassManagement from './pages/staff/ClassManagement';
import ClassDetail from './pages/staff/ClassDetail';
import CreateClass from './pages/staff/CreateClass';
import UpdateClass from './pages/staff/UpdateClass';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import TeacherManagement from './pages/teacher/TeacherManagement';
import SubjectManagement from './pages/subject/SubjectManagement';
import RoomManagement from './pages/room/RoomManagement';
import TimeslotManagement from './pages/timeslot/TimeslotManagement';
import Notification from './pages/admin/Notification';
import { useMemo } from 'react';

function AppRoutes() {
  const { role, abilities, loading } = useAuth();

  // Tạo default route dựa trên abilities
  const getDefaultRoute = () => {
    return '/profile';
  };

  const routes = useMemo(() => (
    <Routes>
      {role ? (
        <Route element={<ModernHeader />}>
          {/* Admin routes */}
          <Route path="/admin/user_account" element={
            <ProtectedRoute requiredAbility="Quản lí tài khoản">
              <UserAccount />
            </ProtectedRoute>
          } />
          <Route path="/admin/code_list" element={
            <ProtectedRoute requiredAbility="Danh mục dùng chung">
              <CodeList />
            </ProtectedRoute>
          } />
          <Route path="/admin/user_command" element={
            <ProtectedRoute requiredAbility="Quản lí chức năng">
              <UserCommand />
            </ProtectedRoute>
          } />
          <Route path="/admin/setting" element={
            <ProtectedRoute requiredAbility="Cấu hình hệ thống">
              <Setting />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          {/* Staff routes */}
          <Route path="/staff/schedule" element={
            <ProtectedRoute requiredAbility="Thời khóa biểu">
              <ViewSchedule />
            </ProtectedRoute>
          } />
          <Route path="/staff/class" element={
            <ProtectedRoute requiredAbility="Quản lí lớp học">
              <ClassManagement />
            </ProtectedRoute>
          } />
          <Route path="/staff/class/create" element={
            <ProtectedRoute requiredAbility="Quản lí lớp học">
              <CreateClass />
            </ProtectedRoute>
          } />
          <Route path="/staff/class/update/:classCode" element={
            <ProtectedRoute requiredAbility="Quản lí lớp học">
              <UpdateClass />
            </ProtectedRoute>
          } />
          <Route path="/staff/class/:classCode" element={
            <ProtectedRoute requiredAbility="Quản lí lớp học">
              <ClassDetail />
            </ProtectedRoute>
          } />

          {/* Common routes */}
          <Route path="/profile" element={
            <ProtectedRoute requiredAbility="Cá nhân">
              <Profile />
            </ProtectedRoute>
          } />

          {/* School Management pages */}
          <Route path="/teacher" element={
            <ProtectedRoute requiredAbility="Quản lí giáo viên">
              <TeacherManagement />
            </ProtectedRoute>
          } />
          <Route path="/subject" element={
            <ProtectedRoute requiredAbility="Quản lí môn học">
              <SubjectManagement />
            </ProtectedRoute>
          } />
          <Route path="/room" element={
            <ProtectedRoute requiredAbility="Quản lí phòng học">
              <RoomManagement />
            </ProtectedRoute>
          } />
          <Route path="/timeslot" element={
            <ProtectedRoute requiredAbility="Quản lí tiết học">
              <TimeslotManagement />
            </ProtectedRoute>
          } />

          {/* Placeholder routes for remaining pages */}
          <Route path="/attendance" element={
            <ProtectedRoute requiredAbility="Điểm danh">
              <PlaceholderPage title="Điểm danh" icon="✅" />
            </ProtectedRoute>
          } />
          <Route path="/notification" element={
            <ProtectedRoute requiredAbility="Thông báo">
              <PlaceholderPage title="Thông báo" icon="📢" />
            </ProtectedRoute>
          } />
          <Route path="/permission" element={
            <ProtectedRoute requiredAbility="Ủy quyền chức năng">
              <PlaceholderPage title="Ủy quyền chức năng" icon="🔐" />
            </ProtectedRoute>
          } />
          <Route path="/role" element={
            <ProtectedRoute requiredAbility="Quản lí vai trò">
              <PlaceholderPage title="Quản lí vai trò" icon="👥" />
            </ProtectedRoute>
          } />
          <Route path="/log" element={
            <ProtectedRoute requiredAbility="Nhật ký & Giám sát">
              <PlaceholderPage title="Nhật ký & Giám sát" icon="📊" />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Route>
      ) : (
        <Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      )}
    </Routes>
  ), [role, abilities, loading]); // Thêm abilities vào dependencies

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🔄 Đang tải...
      </div>
    );
  }

  return routes;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;