import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileFetched, setIsProfileFetched] = useState(false);

    const fetchUserProfile = async (token) => {
        if (isProfileFetched) {
            console.log('Profile already fetched, skipping');
            return;
        }

        try {
            console.log('Fetching user profile with token:', token);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
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
            console.log('Profile API Response:', data);
            if (data.success) {
                setUser(prevUser => {
                    const isAvatarChanged = prevUser?.avatar !== data.data.avatar;
                    if (isAvatarChanged || JSON.stringify(prevUser) !== JSON.stringify(data.data)) {
                        console.log('Updating user due to avatar change or other differences:', data.data);
                        return data.data;
                    }
                    console.log('User unchanged, skipping update. Prev avatar:', prevUser?.avatar, 'New avatar:', data.data.avatar);
                    return prevUser;
                });
                setIsProfileFetched(true);
            }
        } catch (error) {
            console.error('Fetch profile error:', error.message);
            setUser(null);
        } finally {
            if (loading) {
                console.log('Setting loading to false in fetchUserProfile');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        console.log('AuthContext useEffect running');
        const token = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('role');
        console.log('useEffect - token:', token, 'role:', storedRole, 'isProfileFetched:', isProfileFetched);
        if (token && storedRole && !isProfileFetched) {
            setRole(prevRole => {
                if (prevRole !== storedRole) {
                    console.log('Updating role:', storedRole);
                    return storedRole;
                }
                return prevRole;
            });
            fetchUserProfile(token).then(() => {
                console.log('Profile fetch completed');
            });
        } else if (!token || !storedRole) {
            if (loading) {
                console.log('Setting loading to false due to no token');
                setLoading(false);
            }
        }
    }, []); // Chạy một lần khi mount, tránh lặp lại

    const login = async (user_name, password) => {
        try {
            setLoading(true);
            setIsProfileFetched(false);
            console.log('Login attempt:', user_name);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-in`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_name, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.description || 'Login failed');
            }

            const data = await response.json();
            console.log('Login API Response:', data);

            const { token, role_name } = data.data;
            const userRole = role_name === 'Administrator' ? 'admin' : role_name === 'School Staff' ? 'staff' : null;

            if (token && ['admin', 'staff'].includes(userRole)) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', userRole);
                setRole(userRole);
                await fetchUserProfile(token);
                return true;
            } else {
                console.error('Invalid role:', role_name);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async (credential) => {
        try {
            setLoading(true);
            setIsProfileFetched(false);
            console.log('Google Sign-In attempt');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-in-google`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credential),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google Sign-In API Error:', errorData);
                throw new Error(errorData.description || 'Google Sign-In failed');
            }

            const data = await response.json();
            console.log('Google Sign-In API Response:', data);

            const { token, role_name } = data.data;
            const userRole = role_name === 'Administrator' ? 'admin' : role_name === 'School Staff' ? 'staff' : null;

            if (token && ['admin', 'staff'].includes(userRole)) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', userRole);
                setRole(userRole);
                await fetchUserProfile(token);
                return true;
            } else {
                console.error('Invalid role:', role_name);
                return false;
            }
        } catch (error) {
            console.error('Google Sign-In error:', error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            console.log('Logout attempt');
            const token = localStorage.getItem('authToken');
            if (token) {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-out`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': token,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Logout API Error:', errorData);
                    throw new Error(errorData.description || 'Logout failed');
                }

                console.log('Logout API Response:', await response.json());
            }
        } catch (error) {
            console.error('Logout error:', error.message);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('role');
            setRole(null);
            setUser(null);
            setIsProfileFetched(false);
            setLoading(false);
            console.log('Logout completed, user cleared');
        }
    };

    return (
        <AuthContext.Provider value={{ role, user, login, signInWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}