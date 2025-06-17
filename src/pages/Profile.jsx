import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { useState } from 'react';
import { fetchUserProfile, updateAvatar, updateUserInfo, changePassword } from '../api';
import { memo } from 'react';

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  background-color: #1E90FF;
  color: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
  text-align: center;
  position: relative;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  margin-top: -50px;
  position: relative;
  z-index: 1;
`;

const Username = styled.h2`
  margin: 0;
  font-size: 24px;
`;

const InfoSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: -20px;
`;

const InfoItem = styled.div`
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  strong {
    margin-right: 10px;
  }
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: #1E90FF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  input, select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #1E90FF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

function Profile() {
    const { user, setUser } = useAuth();
    const [isEditProfile, setIsEditProfile] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [dob, setDob] = useState(user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '');

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const avatarUrl = user?.avatar || '';
    const cacheBustUrl = `${avatarUrl}?t=${new Date().getTime()}`;



    if (!user) {
        return <div>Unable to load profile. Please try logging in again.</div>;
    }

    const handleAvatarUpload = async (e) => {
        e.preventDefault();
        if (!avatarFile) return;

        try {
            const token = localStorage.getItem('authToken');
            console.log('Avatar upload token:', token);
            const response = await updateAvatar(token, avatarFile);
            console.log('Avatar upload response:', response);
            const updatedUser = await fetchUserProfile(token);
            console.log('Fetched updated user:', updatedUser);
            if (setUser && updatedUser) {
                setUser(prevUser => ({ ...prevUser, ...updatedUser }));
            } else {
                window.location.reload();
            }
            alert('Avatar updated successfully!');
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('An error occurred while updating avatar: ' + (error.message || 'Unknown error'));
        }
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        const currentDate = new Date();
        const inputDate = new Date(dob);
        if (inputDate > currentDate) {
            alert('Ngày sinh không thể là ngày tương lai!');
            return;
        }
        const updateData = {
            full_name: fullName,
            phone,
            gender,
            dob: new Date(dob).toISOString()
        };
        try {
            const token = localStorage.getItem('authToken');
            console.log('Update info token:', token, 'Data:', updateData);
            const data = await updateUserInfo(token, updateData); // data là JSON từ API
            console.log('Update info response (parsed):', data);
            if (!data.success) throw new Error(data.description || 'Update failed');
            const updatedUser = await fetchUserProfile(token);
            if (setUser && updatedUser) {
                setUser(prevUser => ({ ...prevUser, ...updatedUser }));
                console.log('Updated user info:', updatedUser);
            } else {
                window.location.reload();
            }
            setIsEditProfile(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update info error:', error);
            alert('An error occurred while updating profile: ' + (error.message || 'Unknown error'));
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('New password and confirmation do not match!');
            return;
        }

        const passwordData = { old_password: oldPassword, new_password: newPassword, confirm_new_password: confirmPassword };
        try {
            const token = localStorage.getItem('authToken');
            console.log('Change password token:', token, 'Data:', passwordData);
            const response = await changePassword(token, passwordData);
            console.log('Change password response:', response);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangePassword(false);
            alert('Password changed successfully!');
        } catch (error) {
            console.error('Change password error:', error);
            alert('An error occurred while changing password: ' + (error.message || 'Unknown error'));
        }
    };

    return (
        <ProfileContainer>
            <Header>
                <Username>{user.user_name}</Username>
                {user.avatar && <Avatar src={cacheBustUrl} alt="User Avatar" />}
                <form onSubmit={handleAvatarUpload} style={{ marginTop: '10px' }}>
                    <FormGroup>
                        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
                    </FormGroup>
                    <SaveButton type="submit">Upload Avatar</SaveButton>
                </form>
            </Header>
            <InfoSection>
                {!isEditProfile && !isChangePassword && (
                    <>
                        <InfoItem>
                            <strong>Họ và Tên:</strong> {user.full_name || 'N/A'}
                        </InfoItem>
                        <InfoItem>
                            <strong>Phone:</strong> {user.phone || 'N/A'}
                        </InfoItem>
                        <InfoItem>
                            <strong>Giới Tính:</strong> {user.gender || 'N/A'}
                        </InfoItem>
                        <InfoItem>
                            <strong>Ngày sinh:</strong> {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'N/A'}
                        </InfoItem>
                        <InfoItem>
                            <strong>Vai Trò:</strong> {user.role_name || 'N/A'}
                        </InfoItem>
                        <EditButton onClick={() => setIsEditProfile(true)}>Sửa hồ sơ</EditButton>
                        <EditButton onClick={() => setIsChangePassword(true)} style={{ marginLeft: '10px' }}>Đổi mật khẩu</EditButton>
                    </>
                )}
                {isEditProfile && (
                    <form onSubmit={handleUpdateInfo}>
                        <FormGroup>
                            <strong>Họ và Tên:</strong>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <strong>Phone:</strong>
                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <strong>Giới Tính:</strong>
                            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                <option value="">Chọn giới tính</option>
                                <option value="1">Nam</option>
                                <option value="2">Nữ</option>
                                <option value="3">Khác</option>
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <strong>Ngày sinh:</strong>
                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                        </FormGroup>
                        <SaveButton type="submit">Lưu</SaveButton>
                        <EditButton onClick={() => setIsEditProfile(false)} style={{ marginLeft: '10px' }}>Hủy</EditButton>
                    </form>
                )}
                {isChangePassword && (
                    <form onSubmit={handleChangePassword}>
                        <FormGroup>
                            <strong>Mật khẩu cũ:</strong>
                            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <strong>Mật khẩu mới:</strong>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <strong>Xác nhận mật khẩu mới:</strong>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </FormGroup>
                        <SaveButton type="submit">Thay đổi</SaveButton>
                        <EditButton onClick={() => setIsChangePassword(false)} style={{ marginLeft: '10px' }}>Hủy</EditButton>
                    </form>
                )}
            </InfoSection>
        </ProfileContainer>
    );
}

export default memo(Profile, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.user) === JSON.stringify(nextProps.user);
});