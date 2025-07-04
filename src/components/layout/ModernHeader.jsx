import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

// Page mappings based on abilities (excluding items in avatar dropdown)
const PAGE_MAPPINGS = {
  'Cấu hình hệ thống': '/admin/setting',
  'Danh mục dùng chung': '/admin/code_list',
  'Nhật ký & Giám sát': '/log',
  'Quản lí chức năng': '/admin/user_command',
  'Quản lí tài khoản': '/admin/user_account',
  'Quản lí vai trò': '/role',
  'Ủy quyền chức năng': '/permission',
  'Điểm danh': '/attendance',
  'Quản lí giáo viên': '/teacher',
  'Quản lí lớp học': '/staff/class',
  'Quản lí môn học': '/subject',
  'Quản lí phòng học': '/room',
  'Quản lí tiết học': '/timeslot',
  'Thời khóa biểu': '/staff/schedule'
};

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-x: hidden;
  position: sticky;
`;

const Header = styled.header`
  background: #e53e3e;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;


const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-self: start;
`;

const MenuDropdownContainer = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 1001;
  margin-top: 8px;
  padding: 8px 0;
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MenuIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const MenuText = styled.span`
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
`;

const LogoMain = styled.div`
  background: white;
  color: #e53e3e;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 2px;
`;

const LogoSub = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 1px;
`;


const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  justify-self: end;
`;

const AvatarDropdownContainer = styled.div`
  position: relative;
`;

const AvatarButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const AvatarDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1001;
  margin-top: 8px;
`;

const AvatarMenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.logout {
    color: #e74c3c;
    
    &:hover {
      background: #ffebee;
    }
  }
`;

const Content = styled.main`
  min-height: calc(100vh - 70px);
  padding-top: 0px; 
`;

const Overlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'show',
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

function ModernHeader() {
  const { user, abilities, logout } = useAuth();
  const navigate = useNavigate();
  const [currentAbilities, setCurrentAbilities] = useState([]);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const menuDropdownRef = useRef(null);
  const avatarDropdownRef = useRef(null);

  // Update currentAbilities when abilities change (filter out avatar dropdown items)
  useEffect(() => {
    const storedAbilities = localStorage.getItem('abilities');

    let abilitiesToProcess = [];

    if (storedAbilities) {
      try {
        const parsedAbilities = JSON.parse(storedAbilities);
        if (Array.isArray(parsedAbilities) && parsedAbilities.length > 0) {
          abilitiesToProcess = parsedAbilities;
        }
      } catch (error) {
        console.error('Error parsing abilities from localStorage:', error);
      }
    }

    if (!abilitiesToProcess.length && abilities && Array.isArray(abilities) && abilities.length > 0) {
      abilitiesToProcess = abilities;
    }

    // Filter out abilities that are available in avatar dropdown
    const filteredAbilities = abilitiesToProcess.filter(ability =>
      ability !== 'Cá nhân' && ability !== 'Thông báo'
    );

    setCurrentAbilities(filteredAbilities);
  }, [abilities]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        setShowAvatarDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenuClick = (ability) => {
    const path = PAGE_MAPPINGS[ability];
    if (path) {
      navigate(path);
      setShowMenuDropdown(false);
    }
  };

  const getMenuIcon = (ability) => {
    const iconMap = {
      'Cấu hình hệ thống': '⚙️',
      'Danh mục dùng chung': '📋',
      'Nhật ký & Giám sát': '📊',
      'Quản lí chức năng': '🛠️',
      'Quản lí tài khoản': '👨‍💼',
      'Quản lí vai trò': '👥',
      'Ủy quyền chức năng': '🔐',
      'Điểm danh': '✅',
      'Quản lí giáo viên': '👨‍🏫',
      'Quản lí lớp học': '🏫',
      'Quản lí môn học': '📚',
      'Quản lí phòng học': '🏠',
      'Quản lí tiết học': '⏰',
      'Thời khóa biểu': '📅'
    };
    return iconMap[ability] || '📄';
  };

  return (
    <Container>
      <Header>
        <LeftSection>
          {/* Menu Dropdown */}
          <MenuDropdownContainer ref={menuDropdownRef}>
            <MenuButton
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            >
              ☰
            </MenuButton>

            {showMenuDropdown && (
              <MenuDropdown>
                {currentAbilities && currentAbilities.length > 0 ? (
                  currentAbilities.map((ability, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleMenuClick(ability)}
                    >
                      <MenuIcon>{getMenuIcon(ability)}</MenuIcon>
                      <MenuText>{ability}</MenuText>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem>
                    <MenuIcon>📄</MenuIcon>
                    <MenuText>Không có quyền truy cập</MenuText>
                  </MenuItem>
                )}
              </MenuDropdown>
            )}
          </MenuDropdownContainer>

          {/* Logo */}
          <Logo>
            <LogoMain>TKB</LogoMain>
            <LogoSub>THỜI KHÓA BIỂU</LogoSub>
          </Logo>
        </LeftSection>

        {/* Search Section */}

        {/* Avatar Dropdown */}
        <RightSection>
          <AvatarDropdownContainer ref={avatarDropdownRef}>
            <AvatarButton onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}>
              {user?.avatar && !avatarError ? (
                <Avatar
                  src={user.avatar}
                  alt="Avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <DefaultAvatar>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </DefaultAvatar>
              )}
            </AvatarButton>

            {showAvatarDropdown && (
              <AvatarDropdown>
                <AvatarMenuItem onClick={() => {
                  navigate('/profile');
                  setShowAvatarDropdown(false);
                }}>
                  <span>👤</span>
                  <span>Tài khoản</span>
                </AvatarMenuItem>

                <AvatarMenuItem onClick={() => {
                  navigate('/notification');
                  setShowAvatarDropdown(false);
                }}>
                  <span>🔔</span>
                  <span>Thông báo</span>
                </AvatarMenuItem>

                <AvatarMenuItem
                  className="logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>Đăng xuất</span>
                </AvatarMenuItem>
              </AvatarDropdown>
            )}
          </AvatarDropdownContainer>
        </RightSection>
      </Header>

      <Overlay
        show={showMenuDropdown || showAvatarDropdown}
        onClick={() => {
          setShowMenuDropdown(false);
          setShowAvatarDropdown(false);
        }}
      />

      <Content>
        <Outlet />
      </Content>
    </Container>
  );
}

export default ModernHeader; 