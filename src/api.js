const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hast-app.online';

export const fetchUserProfile = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data = await response.json();
    return data.data;
};

export const updateAvatar = async (token, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/user/update-avatar`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Update avatar error:', errorData);
        throw new Error(errorData.description || 'Failed to update avatar');
    }
    const data = await response.json();
    return data.data;
};

export const updateUserInfo = async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/api/user/update`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': 'text/plain'
        },
        body: JSON.stringify(data),
    });
    const responseData = await response.json();
    if (!response.ok) {
        console.error('Update user info error:', responseData);
        throw new Error(responseData.description || 'Failed to update profile');
    }
    return responseData; // Trả về toàn bộ responseData (có success, description, data, v.v.)
};

export const changePassword = async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result; // Trả về toàn bộ response (success, description, v.v.)
};
export const fetchCodeList = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch code list');
    const data = await response.json();
    return data.data_set; // Return the array of code items
};
export const fetchGenderList = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/gender`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch gender list');
    const data = await response.json();
    return data.data_set || []; // Trả về mảng data_set, dùng [] nếu không có
};