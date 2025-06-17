import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import defaultAvatar from '../assets/default-avatar.png';
import { memo, useMemo } from 'react';

const AvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #ccc;
  cursor: pointer;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

function UserAvatar({ to }) {
  const { user } = useAuth();
  const avatarUrl = user?.avatar || defaultAvatar;
  const cacheBustUrl = useMemo(() => `${avatarUrl}?t=${Date.now()}`, [avatarUrl]); // Tạo timestamp khi avatarUrl thay đổi

  console.log('Rendering UserAvatar with user:', user, 'avatarUrl:', avatarUrl, 'cacheBustUrl:', cacheBustUrl);

  return to ? (
    <Link to={to}>
      <AvatarWrapper>
        <AvatarImage src={cacheBustUrl} alt="User Avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
      </AvatarWrapper>
    </Link>
  ) : (
    <AvatarWrapper>
      <AvatarImage src={cacheBustUrl} alt="User Avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
    </AvatarWrapper>
  );
}

export default memo(UserAvatar, (prevProps, nextProps) => {
  return prevProps.to === nextProps.to && prevProps.user?.avatar === nextProps.user?.avatar;
});