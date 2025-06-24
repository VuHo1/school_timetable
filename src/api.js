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

// Class Management APIs
export const fetchClasses = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    // Add filters
    if (params.filter) {
        Object.keys(params.filter).forEach(key => {
            queryParams.append(`filter[${key}]`, params.filter[key]);
        });
    }
    const url = `${API_BASE_URL}/api/class?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Trả về toàn bộ response để có thể access data_set và pagination
};

export const fetchClassDetail = async (token, classCode) => {
    const response = await fetch(`${API_BASE_URL}/api/class/${classCode}`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch class detail');
    const data = await response.json();
    return data.data;
};

export const fetchClassSubjects = async (token, classCode) => {
    const response = await fetch(`${API_BASE_URL}/api/class/class-subject/${classCode}`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch class subjects');
    const data = await response.json();
    return data.data;
};

export const createClass = async (token, classData) => {
    const response = await fetch(`${API_BASE_URL}/api/class/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify(classData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to create class');
    }
    const data = await response.json();
    return data.data;
};

export const deleteClass = async (token, classCode) => {
    const response = await fetch(`${API_BASE_URL}/api/class/remove/${classCode}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/plain'
        },
    });
    if (!response.ok) throw new Error('Failed to delete class');
    const data = await response.json();
    return data.data;
};

// Toggle class status (activate/deactivate)
export const toggleClassStatus = async (token, classCode, currentStatus) => {
    // Luôn gọi API deleteClass để toggle trạng thái (deactive hoặc active)
    return await deleteClass(token, classCode);
};

export const fetchGradeLevels = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/GRADELVL`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch grade levels');
    const data = await response.json();
    return data.data_set;
};

export const fetchClassScheduleConfig = async (token, classCode) => {
    const response = await fetch(`${API_BASE_URL}/api/class/class-schedule-config/${classCode}`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch class schedule config');
    const data = await response.json();
    return data.data;
};

export const fetchTimeSlots = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/time-slot`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch time slots');
    const data = await response.json();
    console.log('API /api/time-slot response:', data);
    return data.data_set;
};

// Code list APIs
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

//Quản lý tài khoản
export const fetchUserList = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);

    const url = `${API_BASE_URL}/api/user?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch user list');
    }
    const data = await response.json();
    return data.data_set || [];
};

export const fetchUserByUsername = async (token, username) => {
    const response = await fetch(`${API_BASE_URL}/api/user/${username}`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch user by username');
    const data = await response.json();
    return data.data || null; // Trả về data nếu có, null nếu không tìm thấy
};

export const createUser = async (token, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/user/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to create user');
    }
    return await response.json();
};

export const activateUser = async (token, username) => {
    const response = await fetch(`${API_BASE_URL}/api/user/active/${username}`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to activate user');
    }
    return await response.json();
};

export const blockUser = async (token, username) => {
    const response = await fetch(`${API_BASE_URL}/api/user/block/${username}`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to block user');
    }
    return await response.json();
};

export const deleteUser = async (token, username) => {
    const response = await fetch(`${API_BASE_URL}/api/user/remove/${username}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to delete user');
    }
    return await response.json();
};
export const fetchRoles = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/user-role`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch roles');
    }
    const data = await response.json();
    return data.data_set || [];
};