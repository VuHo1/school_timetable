import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { FaBell, FaTimes, FaCheck, FaList } from 'react-icons/fa';
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../api';

// Page mappings based on abilities
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
  'Quản lí thời khóa biểu': '/staff/schedule',
  'Thời khóa biểu': '/staff/my-schedule',
  'Quản lí học kỳ': '/staff/semesters',
  'Báo cáo thống kê': '/staff/report',
};

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-x: none;
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

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: white;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
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

const NotificationCount = styled.span`
  position: absolute;
  top: 1px;
  right: 1px;
  background: #5aa7ff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 350px;
  max-height: 400px;
  z-index: 1001;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const NotificationItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isRead',
})`
  position: relative;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: ${props => props.isRead ? 'normal' : 'bold'};
`;

const NotificationTitle = styled.div`
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 7px;
`;

const NotificationBody = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
`;

const NotificationDate = styled.div`
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
`;

const UnreadDot = styled.span`
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #5AA7FF;
  border-radius: 50%;
`;

const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
`;

const ActionButton = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
`;

const MarkAllReadButton = styled(ActionButton)`
  background: white;
  color: #2ecc71;
  
  &:hover {
    background: #e8e8e8;
  }
`;

const ViewAllButton = styled(ActionButton)`
  background: white;
  color: #3498db;
  
  &:hover {
    background: #e8e8e8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  width: 120px;
  flex-shrink: 0;
`;

const Value = styled.div`
  font-size: 14px;
  color: #6b7280;
  flex: 1;
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
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const menuDropdownRef = useRef(null);
  const avatarDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotificationsData = async () => {
    const token = user?.token;
    if (token) {

      try {
        const data = await fetchNotifications(token);

        setNotifications(data);
      } catch (error) {
        console.error('[ModernHeader] Error fetching notifications:', error);
      }
    } else {
      console.warn('[ModernHeader] No token available for fetching notifications');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotificationsData();
  }, [user?.token]);

  // Listen for notification marked as read event
  useEffect(() => {
    const handleNotificationUpdate = () => {

      fetchNotificationsData();
    };

    window.addEventListener('notificationMarkedAsRead', handleNotificationUpdate);
    return () => window.removeEventListener('notificationMarkedAsRead', handleNotificationUpdate);
  }, [user?.token]);

  // Update currentAbilities when abilities change
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
        console.error('[ModernHeader] Error parsing abilities from localStorage:', error);
      }
    }

    if (!abilitiesToProcess.length && abilities && Array.isArray(abilities) && abilities.length > 0) {
      abilitiesToProcess = abilities;
    }

    const filteredAbilities = abilitiesToProcess.filter(ability =>
      ability !== 'Cá nhân' && ability !== 'Thông báo' && ability !== 'Quản lí học kỳ' && ability !== 'Điểm danh' && ability !== 'Danh mục dùng chung'
    );

    setCurrentAbilities(filteredAbilities);
  }, [abilities]);

  // Handle clicks outside dropdowns and modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        setShowAvatarDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (selectedNotification && !event.target.closest('.modal-content')) {
        setSelectedNotification(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedNotification]);

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

  const handleNotificationClick = async (notification) => {

    if (!notification.is_read) {
      try {
        await markNotificationAsRead(user?.token, notification.id);
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));

      } catch (error) {
        console.error('[ModernHeader] Error marking notification as read:', error);
      }
    }
    setSelectedNotification(notification);
    setShowNotificationDropdown(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user?.token);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    } catch (error) {
      console.error('[ModernHeader] Error marking all notifications as read:', error);
    }
  };

  const handleViewAll = () => {

    navigate('/notification');
    setShowNotificationDropdown(false);
  };

  const handleCloseModal = () => {

    setSelectedNotification(null);
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
      'Thời khóa biểu': '📅',
      'Quản lí thời khóa biểu': '📅',
      'Quản lí học kỳ': '📆',
      'Báo cáo thống kê': '📊',
    };
    return iconMap[ability] || '📄';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;



  return (
    <Container>
      <Header>
        <LeftSection>
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

          <Logo onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <LogoMain>TKB</LogoMain>
            <LogoSub>THỜI KHÓA BIỂU</LogoSub>
          </Logo>
        </LeftSection>

        <RightSection>
          <MenuDropdownContainer ref={notificationDropdownRef}>
            <NotificationButton
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            >
              <FaBell />
              {unreadCount > 0 && (
                <NotificationCount>{unreadCount}</NotificationCount>
              )}
            </NotificationButton>

            {showNotificationDropdown && (
              <NotificationDropdown>
                <NotificationList>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        isRead={notification.is_read}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <NotificationContent isRead={notification.is_read}>
                          <NotificationTitle>{notification.title}</NotificationTitle>
                          <NotificationBody>{notification.body}</NotificationBody>
                          <NotificationDate>
                            {new Date(notification.created_date).toLocaleString('vi-VN')}
                          </NotificationDate>
                        </NotificationContent>
                        {!notification.is_read && <UnreadDot />}
                      </NotificationItem>
                    ))
                  ) : (
                    <NotificationItem isRead={true}>
                      <NotificationTitle>Không có thông báo</NotificationTitle>
                    </NotificationItem>
                  )}
                </NotificationList>
                {notifications.length > 0 && (
                  <ActionButtonContainer>
                    <ViewAllButton onClick={handleViewAll}>
                      <FaList /> Xem tất cả
                    </ViewAllButton>
                    <MarkAllReadButton onClick={handleMarkAllAsRead}>
                      <FaCheck /> Đánh dấu đã đọc tất cả
                    </MarkAllReadButton>
                  </ActionButtonContainer>
                )}
              </NotificationDropdown>
            )}
          </MenuDropdownContainer>

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
        show={showMenuDropdown || showAvatarDropdown || showNotificationDropdown || selectedNotification}
        onClick={() => {
          setShowMenuDropdown(false);
          setShowAvatarDropdown(false);
          setShowNotificationDropdown(false);
          setSelectedNotification(null);
        }}
      />

      {selectedNotification && (
        <Modal>
          <ModalContent className="modal-content">
            <CloseButton onClick={handleCloseModal}>
              <FaTimes />
            </CloseButton>
            <ModalTitle>Thông báo</ModalTitle>
            <FormGroup>
              <Label>Tiêu đề:</Label>
              <Value>{selectedNotification.title}</Value>
            </FormGroup>
            <FormGroup>
              <Label>Nội dung:</Label>
              <Value>{selectedNotification.body}</Value>
            </FormGroup>
            <FormGroup>
              <Label>Ngày tạo:</Label>
              <Value>{new Date(selectedNotification.created_date).toLocaleString('vi-VN')}</Value>
            </FormGroup>
          </ModalContent>
        </Modal>
      )}

      <Content>
        <Outlet />
      </Content>
    </Container>
  );
}

export default ModernHeader;