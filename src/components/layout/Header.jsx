import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';
import logo from '../../assets/tkb4-1.jpg';
import styled from 'styled-components';
import UserAvatar from '../UserAvatar';
import { memo, useState } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { IoIosNotifications } from "react-icons/io";

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

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 200px;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    color: #007bff;
  }

  svg {
    margin-right: 10px;
    font-size: 18px;
  }
`;

function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    console.log('AdminLayout rendering');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    const handleMouseEnter = () => {
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        setIsDropdownOpen(false);
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
                        <DropdownContainer
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span style={{ cursor: 'pointer' }}>
                                <UserAvatar />
                            </span>
                            <Dropdown isOpen={isDropdownOpen}>
                                <DropdownItem onClick={() => navigate('/profile')}>
                                    <FaUser /> Hồ sơ
                                </DropdownItem>
                                <DropdownItem onClick={() => navigate('admin/notification')}>
                                    <IoIosNotifications /> Thông báo
                                </DropdownItem>
                                <DropdownItem onClick={handleLogout}>
                                    <FaSignOutAlt /> Đăng xuất
                                </DropdownItem>
                            </Dropdown>
                        </DropdownContainer>
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
    return true; // Tạm thời, cần điều chỉnh nếu có props động
});