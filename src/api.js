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
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.description);
    return data.data_set;
};

export const fetchSubjectCodeList = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/SUBJECT`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.description);
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
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description);
    }
    return data.data_set || []; // Trả về mảng data_set, dùng [] nếu không có
};

export const createTimeSlot = async (token, request) => {
    const response = await fetch(`${API_BASE_URL}/api/time-slot/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description);
    }
    return true;
};
export const updateTimeSlot = async (token, request) => {
    const response = await fetch(`${API_BASE_URL}/api/time-slot/update`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description);
    }
    return true;
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
    return data.data || [];
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

// Fetch all rooms
export const fetchAllRooms = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit || 10);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.search) queryParams.append('search', params.search);
    if (params.filter) {
        if (params.filter.room_type) {
            queryParams.append('filter[room_type]', params.filter.room_type);
        }
        if (params.filter.room_status) {
            queryParams.append('filter[room_status]', params.filter.room_status);
        }
    }

    const url = `${API_BASE_URL}/api/room?${queryParams.toString()}`;
    console.log('Fetching rooms from:', url); // Debug log
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.description || `Failed to fetch rooms: ${response.status}`
        );
    }
    const data = await response.json();
    console.log('Raw API response:', data); // Debug log
    const rooms = (
        data.data_set ||
        data.data ||
        data.items ||
        data.result ||
        data.rooms ||
        (Array.isArray(data) ? data : [])
    );
    if (!Array.isArray(rooms)) {
        console.error('Expected rooms to be an array, got:', rooms);
        return { rooms: [], pagination: { total: 0 } };
    }
    return {
        rooms,
        pagination: data.pagination || { total: rooms.length || 0 },
    };
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
    const data = await response.json();
    return data;
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
    const data = await response.json();
    return data;
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
    const data = await response.json();
    return data;
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
    const data = await response.json();
    return data;
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
    const data = await response.json();
    return data;
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
export const assignUserRole = async (token, roleId, username) => {
    const response = await fetch(`${API_BASE_URL}/api/user-role/assign`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            role_id: roleId,
            user_name: username,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to assign user role');
    }
    const data = await response.json();
    return data;
};

// Subject Management APIs
export const fetchSubjects = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit || 10);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);

    // Add filters
    if (params.filter) {
        Object.keys(params.filter).forEach(key => {
            queryParams.append(`filter[${key}]`, params.filter[key]);
        });
    }

    const url = `${API_BASE_URL}/api/subject?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.description);
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
export const fetchSubjectsConfigByClass = async (token, subjectCode, classCode) => {
    const response = await fetch(`${API_BASE_URL}/api/subject/${subjectCode}?classCode=${classCode}`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch subjects by class');
    const data = await response.json();
    return data.data || data;
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

//Code_List
// Add a new code
export const addCode = async (token, codeData) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(codeData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to add code');
    }
    return await response.json();
};

// Update a code
export const updateCode = async (token, id, caption) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/update`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, caption }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update code');
    }
    return await response.json();
};

// Delete a code
export const deleteCode = async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/remove/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to delete code');
    }
    return await response.json();
};
// UserCommand Management APIs
export const fetchUserCommands = async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);

    const url = `${API_BASE_URL}/api/user-command?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch user commands');
    }
    const data = await response.json();
    return data.data_set || [];
};

export const fetchApplications = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/user-command/application`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch applications');
    }
    const data = await response.json();
    return data.data_set || [];
};

export const createUserCommand = async (token, commandData) => {
    const response = await fetch(`${API_BASE_URL}/api/user-command/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to create user command');
    }
    return await response.json();
};

export const updateUserCommand = async (token, commandData) => {
    const response = await fetch(`${API_BASE_URL}/api/user-command/update`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update user command');
    }
    return await response.json();
};

export const deleteUserCommand = async (token, commandId) => {
    const response = await fetch(`${API_BASE_URL}/api/user-command/remove/${commandId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to delete user command');
    }
    return await response.json();
};

export const fetchBaseSchedules = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/base`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch base schedules');
    }
    const data = await response.json();
    return data.data_set || [];
};

export const fetchScheduleDetails = async (token, scheduleId, code = null, type = 'All') => {
    const queryParams = new URLSearchParams();
    if (code) queryParams.append('code', code);
    if (type) queryParams.append('type', type);

    const url = `${API_BASE_URL}/api/schedule/base/${scheduleId}?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch schedule details');
    }
    const data = await response.json();
    return data.data_set || [];
};

export const fetchTimeTable = async (token, { code, type = 'All', option = 'Weekly', current = 0 }) => {
    const queryParams = new URLSearchParams();
    if (code) queryParams.append('code', code);
    if (type) queryParams.append('type', type);
    if (option) queryParams.append('option', option);
    if (current !== null && current !== undefined) queryParams.append('current', current);

    const url = `${API_BASE_URL}/api/schedule/time-table?${queryParams.toString()}`;
    console.log('[fetchTimeTable] URL:', url);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('[fetchTimeTable] Response status:', response.status, 'Headers:', Object.fromEntries(response.headers));
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[fetchTimeTable] Error:', errorData);
            throw new Error(errorData.description || `Lỗi khi gọi API: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('[fetchTimeTable] Response data:', data);

        return {
            success: data.success ?? true,
            data_set: Array.isArray(data.data_set) ? data.data_set : [],
            description: data.description || 'Không có mô tả',
            pagination: data.pagination || { current: Number(current), last: 1, next: null, previous: null, total: 0 }
        };
    } catch (err) {
        console.error('[fetchTimeTable] Exception:', err);
        throw err;
    }
};

export const fetchMyTimeTable = async (token, { option = 'Weekly', current = 0 }) => {
    const queryParams = new URLSearchParams();
    if (option) queryParams.append('option', option);
    if (current !== null && current !== undefined) queryParams.append('current', current);

    const url = `${API_BASE_URL}/api/schedule/my-time-table?${queryParams.toString()}`;
    console.log('[fetchMyTimeTable] URL:', url);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('[fetchMyTimeTable] Response status:', response.status, 'Headers:', Object.fromEntries(response.headers));
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[fetchMyTimeTable] Error:', errorData);
            throw new Error(errorData.description || `Lỗi khi gọi API: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('[fetchMyTimeTable] Response data:', data);

        return {
            success: data.success ?? true,
            data_set: Array.isArray(data.data_set) ? data.data_set : [],
            description: data.description || 'Không có mô tả',
            pagination: data.pagination || { current: Number(current), last: 1, next: null, previous: null, total: 0 }
        };
    } catch (err) {
        console.error('[fetchMyTimeTable] Exception:', err);
        throw err;
    }
};

export const addSchedule = async (token, scheduleData) => {
    console.log('[addSchedule] Gọi API thêm thời khóa biểu:', scheduleData);
    try {
        const response = await fetch(`${API_BASE_URL}/api/schedule/add`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleData),
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.description || 'Failed to add schedule');
        }
        return {
            success: data.success ?? true,
            description: data.description || 'Thêm thời khóa biểu thành công',
            data: data.data || '',
            data_set: data.data_set || []
        };
    } catch (err) {
        console.error('[addSchedule] Exception:', err);
        throw new Error(err.message || 'Lỗi không xác định khi thêm thời khóa biểu');
    }
};
export const generateSchedule = async (token, { schedule_name, semester_id, option, use_class_config }) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/generate`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schedule_name: schedule_name || '',
            semester_id: parseInt(semester_id),
            option,
            use_class_config,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to generate schedule');
    }
    const data = await response.json();
    return data;
};

export const updateBaseSchedule = async (token, { id, schedule_name }) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/base/update`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
            schedule_name,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update base schedule');
    }
    const data = await response.json();
    return data;
};

export const removeTimeTable = async (token, { begin_date, end_date }) => {
    console.log(`[removeTimeTable] Gọi API xóa thời khóa biểu với begin_date=${begin_date}, end_date=${end_date}`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/schedule/time-table/remove`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                begin_date,
                end_date,
            }),
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.description || 'Failed to remove timetable');
        }
        return {
            success: data.success ?? true,
            description: data.description || 'Xóa thời khóa biểu thành công',
            data: data.data || '',
            data_set: data.data_set || []
        };
    } catch (err) {
        console.error('[removeTimeTable] Exception:', err);
        throw new Error(err.message || 'Lỗi không xác định khi xóa thời khóa biểu');
    }
};
export const deleteBaseSchedule = async (token, scheduleId) => {
    console.log(`[deleteBaseSchedule] Gọi API xóa scheduleId=${scheduleId}`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/schedule/base/remove/${scheduleId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.description);
        }

        return {
            success: data.success ?? true,
            description: data.description,
            data: data.data || '',
            data_set: data.data_set || []
        };
    } catch (err) {
        throw new Error(err.message || 'Lỗi không xác định khi xóa mẫu thời khóa biểu');
    }
};
export const fetchSemesters = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/semester`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch semesters');
    }
    const data = await response.json();
    return data.data_set || [];
};
export const updateScheduleConfig = async (token, settingData) => {
    const response = await fetch(`${API_BASE_URL}/api/setting/schedule-config/update`, {
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
    const data = await response.json();
    return data;
};
export const fetchScheduleConfig = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/setting/schedule-config`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch schedule config');
    }
    const data = await response.json();
    return data.data_set || [];
};
export const addSemester = async (token, { semester_name, start_date, end_date }) => {
    const response = await fetch(`${API_BASE_URL}/api/semester/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
        },
        body: JSON.stringify({ semester_name, start_date, end_date }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description || 'Failed to add semester');
    }

    return {
        success: data.success,
        description: data.description,
        data: data.data,
        data_set: data.data_set,
        pagination: data.pagination,
    };
};

export const removeSemester = async (token, semesterId) => {
    const response = await fetch(`${API_BASE_URL}/api/semester/remove/${semesterId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/plain',
        },
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description || 'Failed to remove semester');
    }

    return {
        success: data.success,
        description: data.description,
        data: data.data,
        data_set: data.data_set,
        pagination: data.pagination,
    };
};
export const getDatesInUse = async (token, semesterId) => {
    console.log(`[getDatesInUse] Gọi API lấy ngày đã có lịch với semesterId=${semesterId}`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/schedule/date-in-use/${semesterId}`, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.description || 'Failed to fetch dates in use');
        }
        return {
            success: data.success ?? true,
            description: data.description || 'Lấy ngày đã có lịch thành công',
            data: data.data || '',
            data_set: Array.isArray(data.data_set) ? data.data_set : [],
            pagination: data.pagination
        };
    } catch (err) {
        console.error('[getDatesInUse] Exception:', err);
        throw new Error(err.message || 'Lỗi không xác định khi lấy ngày đã có lịch');
    }
};
export const addClassSubject = async (token, classSubjectData) => {
    const response = await fetch(`${API_BASE_URL}/api/class/class-subject/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(classSubjectData),
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.description);
    }

    return data;
};

export const addClassScheduleConfig = async (token, scheduleConfigData) => {
    console.log('🔁 [API CALL] addClassScheduleConfig - Payload:', scheduleConfigData);

    const response = await fetch(`${API_BASE_URL}/api/class/class-schedule-config/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleConfigData),
    });

    const text = await response.text();
    console.log('📩 [API RESPONSE TEXT]', text);

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('❌ [API ERROR] Không parse được JSON:', e);
        throw new Error(text);
    }

    if (!response.ok || data.success === false) {
        console.error('❌ [API ERROR] Gọi API thất bại:', data);
        throw new Error(data.description || 'Lỗi không xác định');
    }

    console.log('✅ [API SUCCESS] addClassScheduleConfig:', data);
    return data;
};

export const addClassScheduleConfigSame = async (token, { class_code, target_class_code }) => {
    const response = await fetch(`${API_BASE_URL}/api/class/class-schedule-config/add-same`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            class_code,
            target_class_code
        }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description || 'Failed to copy schedule configuration');
    }
    return data;
};

export const addClassSubjectSame = async (token, { class_code, target_class_code }) => {
    const response = await fetch(`${API_BASE_URL}/api/class/class-subject/add-same`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            class_code,
            target_class_code
        }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.description || 'Failed to copy subjects');
    }
    return data;
};

// api.js

// ... (existing imports and functions)

// Fetch room types
export const fetchRoomTypes = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/code-list/ROOMTYPE`, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to fetch room types');
    }
    const data = await response.json();
    return data.data_set || [];
};

// Create a new room
export const createRoom = async (token, roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/room/add`, {
        method: 'POST',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to create room');
    }
    const data = await response.json();
    return data;
};

// Update a room
export const updateRoom = async (token, roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/room/update`, {
        method: 'PUT',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to update room');
    }
    const data = await response.json();
    return data;
};

export const deleteRoom = async (token, roomCode) => {
    const response = await fetch(`${API_BASE_URL}/api/room/remove/${roomCode}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to delete room');
    }
    const data = await response.json();
    return data;
};