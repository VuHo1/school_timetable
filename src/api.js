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
    if (params.filter && typeof params.filter === 'object') {
        Object.keys(params.filter).forEach(key => {
            queryParams.append(`filter[${key}]`, params.filter[key]);
        });
    }
    const url = `${API_BASE_URL}/api/class?${queryParams.toString()}`;
    console.log('[FETCH URL]', url);

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
    return data;
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
    return data.data_set;
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

// Class Update APIs
export const updateClassTeacher = async (token, classCode, teacherUserName) => {
    const response = await fetch(`${API_BASE_URL}/api/class/update/class-teacher`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify({
            class_code: classCode,
            teacher_user_name: teacherUserName
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update class teacher');
    }
    const data = await response.json();
    return data; // Trả về toàn bộ response
};

export const updateClassRoom = async (token, classCode, roomCode) => {
    const response = await fetch(`${API_BASE_URL}/api/class/update/class-room`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify({
            class_code: classCode,
            room_code: roomCode
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update class room');
    }
    const data = await response.json();
    return data; // Trả về toàn bộ response
};

export const fetchAvailableTeachers = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/teacher/available`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch available teachers');
    const data = await response.json();
    return data.data_set || []; // Trả về mảng data_set
};

export const fetchAvailableRooms = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/room/available`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch available rooms');
    const data = await response.json();
    return data.data_set || []; // Trả về mảng data_set
};

// Add APIs to fetch all teachers and rooms (not just available)
export const fetchAllTeachers = async (token, params = {}) => {
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
    const url = `${API_BASE_URL}/api/teacher?${queryParams.toString()}`;
    console.log('[FETCH URL]', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch teacher: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

export const fetchAllRooms = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit || 100);

    const url = `${API_BASE_URL}/api/room?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch all rooms');
    const data = await response.json();
    return data.data_set || []; // Trả về mảng data_set
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

//setting
export const fetchAppSetting = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/setting/app-setting`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch app settings');
    const data = await response.json();
    return data.data_set || [];
};

export const updateAppSetting = async (token, settingData) => {
    const response = await fetch(`${API_BASE_URL}/api/setting/app-setting/update`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update app setting');
    }
    return await response.json();
};

export const fetchSystemLogs = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const url = `${API_BASE_URL}/api/log?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch system logs');
    }
    const data = await response.json();
    return data;
};

//UserRole
export const fetchCodeListSYSSTS = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/SYSSTS`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch SYSSTS code list');
    }
    const data = await response.json();
    return data.data_set || [];
};
export const updateRole = async (token, roleData) => {
    const response = await fetch(`${API_BASE_URL}/api/user-role/update`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update role');
    }
    return await response.json();
};
export const createRole = async (token, roleData) => {
    const response = await fetch(`${API_BASE_URL}/api/user-role/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to create role');
    }
    return await response.json();
};
export const deleteRole = async (token, roleId) => {
    const response = await fetch(`${API_BASE_URL}/api/user-role/remove/${roleId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to delete role');
    }
    return await response.json();
};


// Subject Management APIs
export const fetchSubjects = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit || 20);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);

    // Add filters
    if (params.filter) {
        Object.keys(params.filter).forEach(key => {
            queryParams.append(`filter[${key}]`, params.filter[key]);
        });
    }

    const url = `${API_BASE_URL}/api/subject?${queryParams.toString()}`;

    if (!response.ok) throw new Error('Failed to fetch subjects');
    const data = await response.json();
    return data; // Return full response for pagination
};

export const fetchSubjectByCode = async (token, subjectCode, classCode = null) => {
    let url = `${API_BASE_URL}/api/subject/${subjectCode}`;
    if (classCode) {
        url += `?classCode=${classCode}`;
    }

    const response = await fetch(url, {

        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch subject detail');
    const data = await response.json();
    return data.data || data.data_set || [];
};

export const fetchSubjectsByGrade = async (token, gradeLevel) => {
    const response = await fetch(`${API_BASE_URL}/api/subject/grade/${gradeLevel}`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch subjects by grade');
    const data = await response.json();
    return data.data_set || data.data || [];
};

export const createSubject = async (token, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/subject/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to create subject');
    }
    const data = await response.json();
    return data;
};

export const updateSubject = async (token, subjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/subject/update`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update subject');
    }
    const data = await response.json();
    return data;
};

export const deleteSubject = async (token, subjectCode) => {
    const response = await fetch(`${API_BASE_URL}/api/subject/remove/${subjectCode}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/plain'

        },
    });
    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.description || 'Failed to delete subject');
    }
    const data = await response.json();
    return data;
};

