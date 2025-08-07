import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../api';

const Container = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 80vh;
  overflow-x: hidden;
`;

const NotificationContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  overflow-y: none;
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 80vh; 
  padding-right: 8px; 
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
  margin-bottom: 15px;
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

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #2ecc71;
  color: white;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 8px 16px;
  align-self: flex-end;
  position: sticky;
  bottom: 0;
  background: #2ecc71;
  z-index: 1;
  
  &:hover {
    background: #27ae60;
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

function Notification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notificationContainerRef = useRef(null);

  useEffect(() => {
    const token = user?.token;
    if (token) {
      console.log('[Notification] Fetching notifications with token:', token);
      fetchNotifications(token)
        .then(data => {
          console.log('[Notification] Notifications received:', data);
          setNotifications(data);
        })
        .catch(error => console.error('[Notification] Error fetching notifications:', error));
    } else {
      console.warn('[Notification] No token available for fetching notifications');
    }
  }, [user?.token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectedNotification && !event.target.closest('.modal-content')) {
        setSelectedNotification(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedNotification]);

  const handleNotificationClick = async (notification) => {
    console.log('[Notification] Notification clicked:', notification);
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(user?.token, notification.id);
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        console.log('[Notification] Notification marked as read:', notification.id);
        // Phát custom event để thông báo cho ModernHeader
        const event = new CustomEvent('notificationMarkedAsRead');
        window.dispatchEvent(event);
      } catch (error) {
        console.error('[Notification] Error marking notification as read:', error);
      }
    }
    setSelectedNotification(notification);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user?.token);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      console.log('[Notification] All notifications marked as read');
      // Phát custom event để thông báo cho ModernHeader
      const event = new CustomEvent('notificationMarkedAsRead');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Notification] Error marking all notifications as read:', error);
    }
  };

  const handleCloseModal = () => {
    console.log('[Notification] Closing notification modal');
    setSelectedNotification(null);
  };

  return (
    <Container>
      <NotificationContainer ref={notificationContainerRef}>
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
          <ActionButton onClick={handleMarkAllAsRead}>
            <FaCheck /> Đánh dấu đã đọc tất cả
          </ActionButton>
        )}
      </NotificationContainer>

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
    </Container>
  );
}

export default Notification;