import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Get API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hast-app.online';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [abilities, setAbilities] = useState([]);
    const [isProfileFetched, setIsProfileFetched] = useState(false);
    const navigate = useNavigate();

    const fetchUserProfile = async (token) => {
        if (isProfileFetched) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Profile API Error:', errorData);
                throw new Error(errorData.description || 'Failed to fetch profile');
            }

            const data = await response.json();
            if (data.success) {
                setUser(prevUser => {
                    const isAvatarChanged = prevUser?.avatar !== data.data.avatar;
                    if (isAvatarChanged || JSON.stringify(prevUser?.data) !== JSON.stringify(data.data)) {
                        console.log('Updating user due to avatar change or other differences:', { ...data.data, token });
                        return { ...data.data, token };
                    }
                    return prevUser;
                });

                if (data.data.abilities && Array.isArray(data.data.abilities)) {
                    localStorage.setItem('abilities', JSON.stringify(data.data.abilities));
                    setAbilities(data.data.abilities);
                } else {
                    setAbilities([]);
                }
                setIsProfileFetched(true);
            } else {
                throw new Error('Profile fetch unsuccessful');
            }
        } catch (error) {
            console.error('Fetch profile error:', error.message);
            await logout();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('role');
        const storedAbilities = localStorage.getItem('abilities');

        if (token && storedRole) {
            setRole(prevRole => (prevRole !== storedRole ? storedRole : prevRole));
            if (storedAbilities) {
                try {
                    const parsedAbilities = JSON.parse(storedAbilities);
                    setAbilities(parsedAbilities);
                } catch (error) {
                    console.error('Error parsing stored abilities:', error);
                }
            }
            fetchUserProfile(token);
        } else {
            setLoading(false);
            navigate('/login');
        }
    }, [navigate]);

    const login = async (user_name, password, device_id) => {
        try {
            setLoading(true);
            setIsProfileFetched(false);
            const response = await fetch(`${API_BASE_URL}/api/auth/sign-in`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_name, password, device_id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.description || 'Login failed');
            }

            const data = await response.json();
            const { token, role_name, abilities } = data.data;

            if (data.success) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', role_name);
                setRole(role_name);
                if (abilities && Array.isArray(abilities)) {
                    localStorage.setItem('abilities', JSON.stringify(abilities));
                    setAbilities(abilities);
                }
                await fetchUserProfile(token);
                return { success: true, description: data.description || 'Đăng nhập thành công' };
            } else {
                console.error('No token received');
                return { success: false, description: data.description || 'Đăng nhập thất bại: Không nhận được token' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, description: error.message || 'Đăng nhập thất bại' };
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async (token, device_id) => {
        try {
            setLoading(true);
            setIsProfileFetched(false);
            const response = await fetch(`${API_BASE_URL}/api/auth/sign-in-google`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, device_id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google Sign-In API Error:', JSON.stringify(errorData, null, 2));
                throw new Error(errorData.description || 'Google Sign-In failed');
            }

            const data = await response.json();


            const authToken = data.data.token;
            const role_name = data.data.role_name;
            const abilities = data.data.abilities;

            if (data.success) {
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('role', role_name);
                setRole(role_name);
                if (abilities && Array.isArray(abilities)) {
                    localStorage.setItem('abilities', JSON.stringify(abilities));
                    setAbilities(abilities);
                }
                await fetchUserProfile(authToken);
                return { success: true, description: data.description || 'Đăng nhập bằng Google thành công' };
            } else {
                console.error('No token received');
                return { success: false, description: data.description || 'Đăng nhập thất bại: Không nhận được token' };
            }
        } catch (error) {
            console.error('Google Sign-In error:', error.message);
            return { success: false, description: error.message || 'Đăng nhập bằng Google thất bại' };
        } finally {
            setLoading(false);
        }
    };
    const logout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('role');
            localStorage.removeItem('abilities');
            setUser(null);
            setRole(null);
            setAbilities([]);
            setIsProfileFetched(false);
        }
    };

    const value = {
        user,
        role,
        loading,
        abilities,
        login,
        signInWithGoogle,
        logout,
        fetchUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}