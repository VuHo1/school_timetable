import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { fetchUserProfile, updateAvatar, updateUserInfo, changePassword, fetchGenderList } from '../api';
import { memo } from 'react';
import { useToast } from '../components/ToastProvider';
import { Eye, EyeOff } from 'lucide-react';

const ProfileContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background-color: #d83333;
  color: white;
  padding: 15px;
  text-align: center;
  position: relative;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
  cursor: pointer;
`;

const Username = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const InfoSection = styled.div`
  padding: 20px;
`;

const InfoItem = styled.div`
  margin-bottom: 20px;
  font-size: 15px;
  display: flex;
  align-items: center;
  position: relative;
`;

const Label = styled.div`
  min-width: 180px;
  margin-right: 10px;
  text-align: start;
  font-weight: bold;
  font-size: 15px;
`;

const PasswordInputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  padding-right: 30px; /* Space for the eye icon */
`;

const EyeIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1px;
  color: #323437;
  &:hover {
    color: #8c9eb0;
  }
`;

const Select = styled.select`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: #1E90FF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #0056b3;
  }
`;

const ForgotButton = styled.button`
  padding: 8px 16px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #d1d5d9;
  }
`;

function Profile() {
    const { user, setUser } = useAuth();
    const [isEditProfile, setIsEditProfile] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [gender, setGender] = useState(''); // Khởi tạo rỗng
    const [dob, setDob] = useState(user?.dob ? user.dob.split('T')[0] : '');
    const [genderOptions, setGenderOptions] = useState([]);
    const [isGenderOptionsReady, setIsGenderOptionsReady] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toast = useToast();

    const avatarUrl = user?.avatar || '';
    const cacheBustUrl = `${avatarUrl}?t=${new Date().getTime()}`;

    useEffect(() => {
        const fetchGenderOptions = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetchGenderList(token); // Lấy response từ API
                const codes = response?.data || response || []; // Xử lý nếu response là object hoặc array
                const genderCodes = Array.isArray(codes) ? codes.filter(code => code.code_name === 'GENDER') : [];
                setGenderOptions(genderCodes);
                // Set gender chỉ khi có dữ liệu
                if (user?.gender && genderCodes.length > 0) {
                    const initialGender = genderCodes.find(opt => opt.caption === user.gender)?.code_id || '';
                    setGender(initialGender);
                }
                setIsGenderOptionsReady(true);
            } catch (error) {
                console.error('Error fetching gender options:', error);
                toast.showToast('Không thể tải dữ liệu giới tính. Vui lòng thử lại.', 'error');
                setIsGenderOptionsReady(true); // Đặt true để tránh treo, dù không có dữ liệu
                setGenderOptions([]); // Đặt mảng rỗng nếu lỗi
            }
        };
        fetchGenderOptions();
    }, [user]);

    if (!user) {
        return <div>Unable to load profile. Please try logging in again.</div>;
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            try {
                const token = localStorage.getItem('authToken');
                const response = await updateAvatar(token, file);
                const updatedUser = await fetchUserProfile(token);
                if (setUser && updatedUser) {
                    setUser(prevUser => ({ ...prevUser, ...updatedUser }));
                } else {
                    toast.showToast('Cập nhật avatar thành công!', 'success', 2000);
                }
            } catch (error) {
                console.error('Avatar upload error:', error);
                setAvatarFile(null);
            }
        }
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        const currentDate = new Date();
        const inputDate = new Date(dob);
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            toast.showToast('Số điện thoại không hợp lệ', 'error');
            return;
        }
        if (inputDate > currentDate) {
            toast.showToast('Ngày sinh không được là ngày tương lai.', 'error');
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
            const data = await updateUserInfo(token, updateData);
            if (!data.success) throw new Error(data.description || 'Update failed');
            const updatedUser = await fetchUserProfile(token);
            if (setUser && updatedUser) {
                setUser(prevUser => ({ ...prevUser, ...updatedUser }));
            } else {
                setTimeout(() => window.location.reload(), 2000);
            }
            setIsEditProfile(false);
            toast.showToast('Cập nhật thông tin thành công!', 'success');
        } catch (error) {
            console.error('Update info error:', error);
            toast.showToast(error.message || 'Cập nhật thông tin thất bại', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const passwordData = { old_password: oldPassword, new_password: newPassword, confirm_new_password: confirmPassword };
        try {
            const token = localStorage.getItem('authToken');
            const response = await changePassword(token, passwordData);
            if (response.success) {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsChangePassword(false);
                toast.showToast(response.description || 'Đổi mật khẩu thành công!', 'success');
            } else {
                toast.showToast(response.description || 'Đổi mật khẩu thất bại', 'error');
            }
        } catch (error) {
            console.error('Change password error:', error);
            toast.showToast('Lỗi kết nối hoặc máy chủ', 'error');
        }
    };

    return (
        <ProfileContainer>
            <Card>
                <Header>
                    {user.avatar && <Avatar src={cacheBustUrl} alt="User Avatar" onClick={() => document.getElementById('avatarInput').click()} />}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                        id="avatarInput"
                    />
                </Header>
                <InfoSection>
                    {!isEditProfile && !isChangePassword && (
                        <>
                            <InfoItem>
                                <Label>Họ và tên:</Label> {user.full_name || 'N/A'}
                            </InfoItem>
                            <InfoItem>
                                <Label>Email:</Label> {user.email || 'N/A'}
                            </InfoItem>
                            <InfoItem>
                                <Label>Số điện thoại:</Label> {user.phone || 'N/A'}
                            </InfoItem>
                            <InfoItem>
                                <Label>Giới tính:</Label> {user.gender || 'N/A'}
                            </InfoItem>
                            <InfoItem>
                                <Label>Ngày sinh:</Label> {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'N/A'}
                            </InfoItem>
                            <InfoItem>
                                <Label>Vai trò:</Label> {user.role_name || 'N/A'}
                            </InfoItem>
                            <InfoItem>
                                <Label>Tình trạng:</Label> {user.status || 'N/A'}
                            </InfoItem>
                            <ButtonContainer>
                                <EditButton onClick={() => {
                                    if (isGenderOptionsReady) {
                                        setFullName(user.full_name || '');
                                        setPhone(user.phone || '');
                                        setDob(user.dob ? user.dob.split('T')[0] : '');
                                        setGender(genderOptions.find(opt => opt.caption === user.gender)?.code_id || '');
                                        setIsEditProfile(true);
                                    }
                                }}>Sửa hồ sơ</EditButton>
                                <ForgotButton onClick={() => setIsChangePassword(true)}>Đổi mật khẩu</ForgotButton>
                            </ButtonContainer>
                        </>
                    )}
                    {isEditProfile && (
                        <form onSubmit={handleUpdateInfo}>
                            <InfoItem>
                                <Label>Họ và tên:</Label>
                                <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </InfoItem>
                            <InfoItem>
                                <Label>Số điện thoại:</Label>
                                <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </InfoItem>
                            <InfoItem>
                                <Label>Giới tính:</Label>
                                <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                                    {genderOptions.length === 0 ? (
                                        <option value="">Không tải được dữ liệu giới tính</option>
                                    ) : (
                                        genderOptions.map(option => (
                                            <option key={option.code_id} value={option.code_id}>
                                                {option.caption}
                                            </option>
                                        ))
                                    )}
                                </Select>
                            </InfoItem>
                            <InfoItem>
                                <Label>Ngày sinh:</Label>
                                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                            </InfoItem>
                            <ButtonContainer>
                                <EditButton type="submit">Lưu</EditButton>
                                <ForgotButton onClick={() => setIsEditProfile(false)}>Hủy</ForgotButton>
                            </ButtonContainer>
                        </form>
                    )}
                    {isChangePassword && (
                        <form onSubmit={handleChangePassword}>
                            <InfoItem>
                                <Label>Mật khẩu cũ:</Label>
                                <PasswordInputWrapper>
                                    <Input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                    <EyeIcon onClick={() => setShowOldPassword(!showOldPassword)}>
                                        {showOldPassword ? <EyeOff /> : <Eye />}
                                    </EyeIcon>
                                </PasswordInputWrapper>
                            </InfoItem>
                            <InfoItem>
                                <Label>Mật khẩu mới:</Label>
                                <PasswordInputWrapper>
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <EyeIcon onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <EyeOff /> : <Eye />}
                                    </EyeIcon>
                                </PasswordInputWrapper>
                            </InfoItem>
                            <InfoItem>
                                <Label>Nhập lại mật khẩu mới:</Label>
                                <PasswordInputWrapper>
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <EyeIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                                    </EyeIcon>
                                </PasswordInputWrapper>
                            </InfoItem>
                            <ButtonContainer>
                                <EditButton type="submit">Thay đổi</EditButton>
                                <ForgotButton onClick={() => setIsChangePassword(false)}>Hủy</ForgotButton>
                            </ButtonContainer>
                        </form>
                    )}
                </InfoSection>
            </Card>
        </ProfileContainer>
    );
}

export default memo(Profile, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.user) === JSON.stringify(nextProps.user);
});