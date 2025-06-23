import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';
import { memo, useState } from 'react';
import UserAvatar from '../UserAvatar';
import styled from 'styled-components';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

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

function StaffLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    console.log('StaffLayout rendering');

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
        <div className="staff-container">
            <aside className="staff-sidebar">
                <h2>Staff Menu</h2>
                <nav>
                    <Link to="/staff/schedule">View Schedule</Link>

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
                            <DropdownItem onClick={handleLogout}>
                                <FaSignOutAlt /> Đăng xuất
                            </DropdownItem>
                        </Dropdown>
                    </DropdownContainer>

                </nav>
            </aside>
            <main className="staff-main">
                <Outlet />
            </main>
        </div>
    );
}

export default memo(StaffLayout, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});