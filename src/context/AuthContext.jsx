import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [abilities, setAbilities] = useState([]);
    const [isProfileFetched, setIsProfileFetched] = useState(false);

    const fetchUserProfile = async (token) => {
        if (isProfileFetched) {
            return;
        }

        try {
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
            if (data.success) {
                setUser(prevUser => {
                    const isAvatarChanged = prevUser?.avatar !== data.data.avatar;
                    if (isAvatarChanged || JSON.stringify(prevUser?.data) !== JSON.stringify(data.data)) {
                        console.log('Updating user due to avatar change or other differences:', { ...data.data, token });
                        return { ...data.data, token }; // Thêm token vào user object
                    }
                    return prevUser;
                });

                // Lưu abilities vào localStorage và state
                if (data.data.abilities && Array.isArray(data.data.abilities)) {
                    localStorage.setItem('abilities', JSON.stringify(data.data.abilities));
                    setAbilities(data.data.abilities);
                } else {
                    setAbilities([]);
                }
                setIsProfileFetched(true);
            }
        } catch (error) {
            console.error('Fetch profile error:', error.message);
            setUser(null);
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('role');
        const storedAbilities = localStorage.getItem('abilities');

        if (token && storedRole && !isProfileFetched) {
            setRole(prevRole => {
                if (prevRole !== storedRole) {
                    return storedRole;
                }
                return prevRole;
            });

            // Load abilities từ localStorage nếu có
            if (storedAbilities) {
                try {
                    const parsedAbilities = JSON.parse(storedAbilities);
                    setAbilities(parsedAbilities);
                } catch (error) {
                    console.error('Error parsing stored abilities:', error);
                }
            }

            fetchUserProfile(token);
        } else if (!token || !storedRole) {
            if (loading) {
                setLoading(false);
            }
        }
    }, []);

    const login = async (user_name, password) => {
        try {
            setLoading(true);
            setIsProfileFetched(false);
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
            const { token, role_name, abilities } = data.data;
            const userRole = role_name === 'Administrator' ? 'admin' : role_name === 'School Staff' ? 'staff' : null;

            if (token && ['admin', 'staff'].includes(userRole)) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', userRole);
                setRole(userRole);

                // Set abilities from login response
                if (abilities && Array.isArray(abilities)) {
                    localStorage.setItem('abilities', JSON.stringify(abilities));
                    setAbilities(abilities);
                }

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
            const { token, role_name, abilities } = data.data;
            const userRole = role_name === 'Administrator' ? 'admin' : role_name === 'School Staff' ? 'staff' : null;

            if (token && ['admin', 'staff'].includes(userRole)) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', userRole);
                setRole(userRole);

                // Set abilities from google signin response
                if (abilities && Array.isArray(abilities)) {
                    localStorage.setItem('abilities', JSON.stringify(abilities));
                    setAbilities(abilities);
                }

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
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-out`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear all data
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