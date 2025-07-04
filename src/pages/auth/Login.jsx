import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import styled from 'styled-components';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import logo from '../../assets/tkb4-1.jpg';
import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase/init";


const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
`;

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

const TitleDangnhap = styled.h2`
  margin-left: 9px;
  font-size: 35px;
  font-weight: bold;
  color: #343a40;
`;

const TitleReset = styled.h2`
  margin-left: 11px;
  font-size: 23px;
  font-weight: bold;
  color: #343a40;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 85%;
  height: 40px;
  padding: 8px 12px 8px 36px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  font-size: 14px;
  color: #495057;
  background: #fff;
  
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #6c757d;
`;

const EyeIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: ${(props) => (props.active ? '#6c757d' : '#6c757d')};
  cursor: pointer;
`;

const OptionsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0;
`;

const ForgotPasswordLink = styled.a`
  font-size: 13px;
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 40px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const BackButton = styled(Button)`
  background: #e9ecef;
  color: #343a40;
  &:hover {
    background: #dee2e6;
  }
`;

const GoogleButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Text = styled.p`
  font-size: 12px;
  margin: -1px;
`;


function Login() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const getDeviceId = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (Notification.permission === "denied") {
                alert("Trình duyệt đang chặn quyền thông báo. Vui lòng mở lại quyền trong cài đặt.");
            }
            if (permission !== "granted") {
                return null;
            }
            const registration = await navigator.serviceWorker.ready;

            const deviceId = await getToken(messaging, {
                vapidKey: "BPhsTV8zE59_96oWucSrB8gJM9Wutldm7LcHKdoz3WF0dsEARcP1rCL_bbdMgn6XAbs3GIkFRyZ2ehOPFlofa-k",
                serviceWorkerRegistration: registration,
            });
            console.log('✅ Lấy FCM token thành công');
            return deviceId;
        } catch (error) {
            console.error("❌ Lỗi khi lấy FCM token:", error);
            return null;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const deviceId = await getDeviceId();
            const response = await login(userName, password, deviceId || "");
            if (response.success) {
                showToast(response.description || 'Đăng nhập thành công!', 'success');
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 3000);
            } else {
                showToast(response.description || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Đã có lỗi xảy ra khi đăng nhập.', 'error');
            console.error('Login error:', err.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const credential = credentialResponse?.credential;
            if (!credential) {
                throw new Error('Không nhận được credential từ Google.');
            }
            console.log('Google Sign-In credential:', credential);
            const deviceId = await getDeviceId();
            const response = await signInWithGoogle(credential, deviceId || "");
            if (response.success) {
                showToast(response.description || 'Đăng nhập thành công!', 'success');
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 3000);
            } else {
                showToast(response.description || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Đã có lỗi xảy ra khi đăng nhập bằng Google.', 'error');
            console.error('Google Sign-In error1:', err.message);
        }
    };

    const handleGoogleError = () => {
        showToast('Đăng nhập bằng Google thất bại.', 'error');
        console.error('Google Sign-In error2');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            if (!email || typeof email !== 'string') {
                throw new Error('Email không hợp lệ. Vui lòng nhập email.');
            }

            const body = JSON.stringify({ email });

            const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'https://api.hast-app.online')}/api/auth/reset-password`, {
                method: 'PUT',
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    throw new Error('Không thể phân tích phản hồi từ server.');
                }
                throw new Error(errorData.description || 'Đặt lại mật khẩu thất bại');
            }

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error('Không thể phân tích phản hồi từ server.');
            }

            const message = data.description || 'Email đặt lại mật khẩu đã được gửi thành công.';
            showToast(message, 'success');
        } catch (error) {
            const message = error.message || 'Gửi email đặt lại thất bại. Vui lòng thử lại.';
            showToast(message, 'error');
            console.error('Reset password error:', error.message);
        }
    };

    const formFields = [
        {
            id: 'username',
            placeholder: 'Tên đăng nhập hoặc email',
            icon: <User size={16} />,
            type: 'text',
            value: userName,
            onChange: (e) => setUserName(e.target.value),
        },
        {
            id: 'password',
            placeholder: 'Mật khẩu',
            icon: <Lock size={16} />,
            type: showPassword ? 'text' : 'password',
            showPasswordIcon: showPassword ? <EyeOff size={16} /> : <Eye size={16} />,
            value: password,
            onChange: (e) => setPassword(e.target.value),
        },
    ];

    return (
        <Container>
            <Card>
                {showResetPassword ? (
                    <Form onSubmit={handleResetPassword}>
                        <Header>
                            <Logo src={logo}></Logo>
                            <TitleReset>Lấy lại mật khẩu</TitleReset>
                        </Header>
                        <InputWrapper>
                            <Input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Tên đăng nhập hoặc email"
                                required
                                autoComplete="username"
                            />
                            <IconWrapper>
                                <User size={16} />
                            </IconWrapper>
                        </InputWrapper>
                        <Text>Lưu ý: Nhập tên tài khoản hoặc Email của bạn</Text>
                        <Button type="submit">Gửi yêu cầu</Button>
                        <BackButton type="button" onClick={() => setShowResetPassword(false)}>
                            Quay lại
                        </BackButton>
                    </Form>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Header>
                            <Logo src={logo}></Logo>
                            <TitleDangnhap>Đăng nhập</TitleDangnhap>
                        </Header>
                        {formFields.map((field) => (
                            <InputWrapper key={field.id}>
                                <Input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={field.onChange}
                                    required
                                    autoComplete={field.id === 'username' ? 'username' : 'current-password'}
                                />
                                <IconWrapper>{field.icon}</IconWrapper>
                                {field.showPasswordIcon && (
                                    <EyeIconWrapper
                                        active={showPassword}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {field.showPasswordIcon}
                                    </EyeIconWrapper>
                                )}
                            </InputWrapper>
                        ))}
                        <OptionsWrapper>
                            <ForgotPasswordLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowResetPassword(true);
                                }}
                            >
                                Quên mật khẩu
                            </ForgotPasswordLink>
                        </OptionsWrapper>
                        <Button type="submit">Đăng nhập</Button>
                        <GoogleButtonWrapper>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                shape="rectangular"
                                width="100%"
                            />
                        </GoogleButtonWrapper>
                    </Form>
                )}
            </Card>
        </Container>
    );
}

export default Login;