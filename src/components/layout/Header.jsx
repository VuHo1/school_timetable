import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';
import logo from '../../assets/tkb4-1.jpg';
import styled from 'styled-components';
import UserAvatar from '../UserAvatar';
import { memo } from 'react';

const Logo = styled.img`
  width: 130px;
  height: 50px;
  border-radius: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    console.log('AdminLayout rendering');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-content">
                    <Link to="/admin/dashboard">
                        <Logo src={logo} />
                    </Link>
                    <nav>
                        <Link to="/admin/user_account">Quản lý tài khoản</Link>
                        <Link to="/admin/user_command">Quản lý chức năng</Link>
                        <Link to="/admin/code_list">Danh mục dùng chung</Link>
                        <Link to="/admin/setting">Cấu hình hệ thống</Link>
                        <Link to="/profile"><UserAvatar /></Link>

                        <button onClick={handleLogout}>Đăng xuất</button>
                    </nav>
                </div>
            </header>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
export default memo(AdminLayout, (prevProps, nextProps) => {
    // Memo dựa trên user hoặc route không thay đổi
    return true; // Tạm thời, cần điều chỉnh nếu có props động
});