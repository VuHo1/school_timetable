import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  margin: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const AccessDeniedIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const AccessDeniedTitle = styled.h2`
  color: #495057;
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
`;

const AccessDeniedMessage = styled.p`
  color: #6c757d;
  font-size: 16px;
  max-width: 400px;
  line-height: 1.5;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-top: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
  
  &::before {
    content: "← ";
    margin-right: 4px;
  }
`;

function ProtectedRoute({ children, requiredAbility }) {
  const { abilities } = useAuth();

  // Nếu không yêu cầu ability cụ thể, cho phép truy cập
  if (!requiredAbility) {
    return children;
  }

  // Fallback: check localStorage nếu abilities từ context trống
  let currentAbilities = abilities;
  if (!abilities || abilities.length === 0) {
    const storedAbilities = localStorage.getItem('abilities');
    if (storedAbilities) {
      try {
        currentAbilities = JSON.parse(storedAbilities);
      } catch (error) {
        console.error('Error parsing abilities from localStorage:', error);
        currentAbilities = [];
      }
    }
  }

  // Kiểm tra xem user có ability này không
  const hasAccess = currentAbilities && currentAbilities.includes(requiredAbility);

  if (!hasAccess) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedIcon>🚫</AccessDeniedIcon>
        <AccessDeniedTitle>Không có quyền truy cập</AccessDeniedTitle>
        <AccessDeniedMessage>
          Bạn không có quyền truy cập vào trang này. 
          Vui lòng liên hệ quản trị viên để được cấp quyền "{requiredAbility}".
        </AccessDeniedMessage>
        <BackButton onClick={() => window.history.back()}>
          Quay lại
        </BackButton>
      </AccessDeniedContainer>
    );
  }

  return children;
}

export default ProtectedRoute; 