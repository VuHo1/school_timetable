import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/Header';
import StaffLayout from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import UserAccount from './pages/admin/UserAccount';
import CodeList from './pages/admin/CodeList';
import UserCommand from './pages/admin/UserCommand';
import Setting from './pages/admin/Setting';
import ViewSchedule from './pages/staff/ViewSchedule';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import { useMemo } from 'react';

function AppRoutes() {
  const { role, loading } = useAuth();

  console.log('AppRoutes rendering - role:', role, 'loading:', loading);

  const routes = useMemo(() => (
    <Routes>
      {role ? (
        role === 'admin' ? (
          <Route element={<AdminLayout />}>
            <Route path="/admin/user_account" element={<UserAccount />} />
            <Route path="/admin/code_list" element={<CodeList />} />
            <Route path="/admin/user_command" element={<UserCommand />} />
            <Route path="/admin/setting" element={<Setting />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        ) : (
          <Route element={<StaffLayout />}>
            <Route path="/staff/schedule" element={<ViewSchedule />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/staff/schedule" replace />} />
          </Route>
        )
      ) : (
        <Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      )}
    </Routes>
  ), [role, loading]); // Chỉ re-render khi role hoặc loading thay đổi

  if (loading) {
    return <div>Loading...</div>;
  }

  return routes;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;