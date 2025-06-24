import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

// Styled Components
const Container = styled.div`
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 70px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #2c3e50;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${props => props.variant === 'danger' ? '#e74c3c' : props.variant === 'warning' ? '#f39c12' : '#3498db'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'Đang hoạt động' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.status === 'Đang hoạt động' ? '#155724' : '#721c24'};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const PaginationButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

// Modal Styled Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #f9f9f9;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  margin-bottom: 5px;
  font-size: 14px;
  
  &:hover {
    background: #f0f7ff;
    border-color: #667eea;
  }
  
  input {
    margin-right: 8px;
  }
`;

// Schedule Grid Components - like timetable
const ScheduleTable = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DayHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  border-right: 1px solid rgba(255,255,255,0.2);
  
  &:last-child {
    border-right: none;
  }
`;

const SlotRow = styled.div`
  display: contents;
`;

const SlotCell = styled.div`
  padding: 8px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  text-align: center;
  font-size: 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:last-child {
    border-right: none;
  }
  
  &.available {
    background: #d4edda;
    color: #155724;
    font-weight: 500;
  }
  
  &.unavailable {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.empty {
    background: #f8f9fa;
    color: #6c757d;
  }
`;



const Input = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 15px;
  
  .label {
    font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
  }
  
  .value {
    color: #666;
    flex: 1;
  }
`;

// Tab Components
const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #f1f1f1;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 5px;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : '#f8f9fa'};
  }
`;

const TabContent = styled.div`
  min-height: 300px;
`;

const SubjectCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 4px solid #667eea;
  
  .subject-name {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 5px;
  }
  
  .subject-code {
    font-size: 12px;
    color: #666;
    background: #e9ecef;
    padding: 2px 8px;
    border-radius: 12px;
    display: inline-block;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
  
  .icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
`;

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  
  // Teacher detail extended states
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherScheduleConfig, setTeacherScheduleConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'subjects', 'schedule'
  
  // Edit modes
  const [editingSubjects, setEditingSubjects] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Schedule data state - moved to main component level for proper re-rendering
  const [scheduleData, setScheduleData] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
    weekly_minimum_slot: 0,
    weekly_maximum_slot: 0,
    daily_minimum_slot: 0,
    daily_maximum_slot: 0,
    weekly_minimum_day: 0,
    weekly_maximum_day: 0,
  });

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      let apiUrl = '/api/teacher';
      
      // Special case: if filter is "AVAILABLE", use different endpoint
      if (classFilter === 'AVAILABLE') {
        apiUrl = '/api/teacher/available';
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let teacherList = [];
        if (Array.isArray(data)) {
          teacherList = data;
        } else if (data.data_set && Array.isArray(data.data_set)) {
          teacherList = data.data_set;
        } else if (data.data && Array.isArray(data.data)) {
          teacherList = data.data;
        }
        
        setTeachers(teacherList);
        setTotalPages(1); // Available teachers usually don't have pagination
        toast.success(`Tải thành công ${teacherList.length} giáo viên chưa có lớp`);
        return;
      }
      
      // Regular teacher list with pagination and filters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: 'user_name'
      });

      // Add search parameter if provided
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Add filters if provided
      if (statusFilter) {
        params.append('filter[status]', statusFilter);
      }
      
      if (classFilter && classFilter !== 'AVAILABLE') {
        params.append('filter[homeroom_class]', classFilter);
      }

      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Set data based on actual API response structure
      let teacherList = [];
      if (Array.isArray(data)) {
        teacherList = data;
      } else if (data.data_set && Array.isArray(data.data_set)) {
        teacherList = data.data_set;
      } else if (data.data && Array.isArray(data.data)) {
        teacherList = data.data;
      } else {
        teacherList = [];
      }
      
      setTeachers(teacherList);
      setTotalPages(Math.ceil((data.pagination?.total || teacherList.length || 0) / 20));
      
      toast.success(`Tải thành công ${teacherList.length} giáo viên`);
      
    } catch (error) {
      console.error('Error fetching teachers:', error);
      
      // More detailed error messages
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền truy cập chức năng này.');
      } else if (error.message.includes('404')) {
        toast.error('API endpoint không tồn tại.');
      } else {
        toast.error('Không thể tải danh sách giáo viên. Vui lòng thử lại.');
      }
      
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle view teacher detail
  const handleViewDetail = async (teacherUsername) => {
    try {
      setModalLoading(true);
      setShowDetailModal(true);
      setActiveTab('info'); // Reset to info tab
      setEditingSubjects(false); // Reset edit modes
      setEditingSchedule(false);
      
      const token = localStorage.getItem('authToken');
      
      // Load teacher basic info
      const teacherResponse = await fetch(`/api/teacher/${teacherUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!teacherResponse.ok) {
        throw new Error(`HTTP error! status: ${teacherResponse.status}`);
      }

      const teacherData = await teacherResponse.json();
      const teacherDetail = teacherData.data_set?.[0] || teacherData.data || teacherData;
      setSelectedTeacher(teacherDetail);
      
      // Load teacher subjects and schedule config in parallel
      Promise.all([
        fetch(`/api/teacher/teacher-subject/${teacherUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/teacher/teacher-schedule-config/${teacherUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]).then(async ([subjectsRes, scheduleRes]) => {
        // Handle subjects
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          const subjects = subjectsData.data_set || subjectsData.data || [];
          setTeacherSubjects(subjects);
        } else {
          setTeacherSubjects([]);
        }
        
        // Handle schedule config
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          const schedule = scheduleData.data_set?.[0] || scheduleData.data || null;
          setTeacherScheduleConfig(schedule);
        } else {
          setTeacherScheduleConfig(null);
        }
      }).catch(error => {
        console.error('Error loading teacher additional info:', error);
        setTeacherSubjects([]);
        setTeacherScheduleConfig(null);
      });
      
    } catch (error) {
      console.error('Error fetching teacher detail:', error);
      toast.error('Không thể tải thông tin chi tiết giáo viên');
      setShowDetailModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle create teacher
  const handleCreateTeacher = async (teacherData) => {
    try {
      setModalLoading(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: teacherData.email,
          full_name: teacherData.full_name,
          phone: teacherData.phone,
          gender: teacherData.gender,
          dob: teacherData.dob,
          role_id: teacherData.role_id, // Teacher role ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Không thể tạo giáo viên');
      }

      toast.success('Tạo giáo viên thành công! Mật khẩu đã được gửi qua email.');
      setShowCreateModal(false);
      fetchTeachers(); // Refresh data
      
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast.error('Lỗi tạo giáo viên: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (type, value) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'class') {
      setClassFilter(value);
    }
    setCurrentPage(1);
  };

  // Fetch roles for create form
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user-role?filter[status]=Đang hoạt động&filter[is_teacher]=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const roleList = data.data_set || data.data || [];
        setRoles(roleList);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Use default fallback
      setRoles([{ id: 2, role_name: 'Teacher' }]);
    }
  };

  // Fetch available subjects for assignment
  const fetchAvailableSubjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/subject?filter[status]=Đang hoạt động&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const subjectList = data.data_set || data.data || [];
        setAvailableSubjects(subjectList);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setAvailableSubjects([]);
    }
  };

  // Fetch time slots for schedule configuration
  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/time-slot', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const slotList = data.data_set || data.data || [];
        setTimeSlots(slotList);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    }
  };

  // Fetch teacher subjects separately (for refresh after save)
  const fetchTeacherSubjects = async (teacherUsername) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/teacher/teacher-subject/${teacherUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const subjects = data.data_set || data.data || [];
        setTeacherSubjects(subjects);
      } else {
        setTeacherSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      setTeacherSubjects([]);
    }
  };

  // Fetch teacher schedule config separately (for refresh after save)
  const fetchTeacherScheduleConfig = async (teacherUsername) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/teacher/teacher-schedule-config/${teacherUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const schedule = data.data_set?.[0] || data.data || null;

        setTeacherScheduleConfig(schedule);
      } else {
        setTeacherScheduleConfig(null);
      }
    } catch (error) {
      console.error('Error fetching teacher schedule config:', error);
      setTeacherScheduleConfig(null);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchTeachers();
    fetchRoles(); // Load roles for create modal
    fetchAvailableSubjects(); // Load subjects for assignment
    fetchTimeSlots(); // Load time slots for schedule
  }, [currentPage, searchTerm, statusFilter, classFilter]);

  // Update scheduleData when teacherScheduleConfig changes (moved from renderScheduleConfig)
  useEffect(() => {
    if (teacherScheduleConfig) {
      const convertApiScheduleToInternal = (apiSchedule) => {
        if (!apiSchedule) return {};
        const result = {};
        Object.keys(apiSchedule).forEach(day => {
          if (Array.isArray(apiSchedule[day])) {
            result[day] = apiSchedule[day].join('|');
          } else if (typeof apiSchedule[day] === 'string') {
            result[day] = apiSchedule[day];
          } else {
            result[day] = '';
          }
        });
        return result;
      };

      const newConvertedSchedule = convertApiScheduleToInternal(teacherScheduleConfig);
      const newData = {
        monday: newConvertedSchedule.monday || '',
        tuesday: newConvertedSchedule.tuesday || '',
        wednesday: newConvertedSchedule.wednesday || '',
        thursday: newConvertedSchedule.thursday || '',
        friday: newConvertedSchedule.friday || '',
        saturday: newConvertedSchedule.saturday || '',
        sunday: newConvertedSchedule.sunday || '',
        weekly_minimum_slot: teacherScheduleConfig?.weekly_minimum_slot || 0,
        weekly_maximum_slot: teacherScheduleConfig?.weekly_maximum_slot || 0,
        daily_minimum_slot: teacherScheduleConfig?.daily_minimum_slot || 0,
        daily_maximum_slot: teacherScheduleConfig?.daily_maximum_slot || 0,
        weekly_minimum_day: teacherScheduleConfig?.weekly_minimum_day || 0,
        weekly_maximum_day: teacherScheduleConfig?.weekly_maximum_day || 0,
      };
      console.log('🎯 LOADING scheduleData from API (fixed):', newData);
      setScheduleData(newData);
    }
  }, [teacherScheduleConfig]);

  // Handle save teacher subjects
  const handleSaveSubjects = async (selectedSubjects) => {
    if (!selectedTeacher) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/teacher/teacher-subject/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_user_name: selectedTeacher.user_name,
          subject_code: selectedSubjects
        }),
      });

      if (response.ok) {
        toast.success('Cập nhật môn học thành công!');
        setEditingSubjects(false);
        // Reload teacher subjects
        fetchTeacherSubjects(selectedTeacher.user_name);
      } else {
        const errorData = await response.text();
        if (response.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn');
        } else if (response.status === 403) {
          toast.error('Không có quyền thực hiện thao tác này');
        } else {
          toast.error('Có lỗi khi cập nhật môn học: ' + errorData);
        }
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast.error('Có lỗi kết nối khi cập nhật môn học');
    }
  };

  // Handle save teacher schedule
  const handleSaveSchedule = async (scheduleData) => {
    if (!selectedTeacher) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const requestData = {
        teacher_user_name: selectedTeacher.user_name,
        ...scheduleData
      };
      
      const response = await fetch('/api/teacher/teacher-schedule-config/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('Cập nhật lịch làm việc thành công!');
        setEditingSchedule(false);
        // Reload teacher schedule config
        await fetchTeacherScheduleConfig(selectedTeacher.user_name);
      } else {
        const errorData = await response.text();
        if (response.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn');
        } else if (response.status === 403) {
          toast.error('Không có quyền thực hiện thao tác này');
        } else {
          toast.error('Có lỗi khi cập nhật lịch làm việc: ' + errorData);
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Có lỗi kết nối khi cập nhật lịch làm việc');
    }
  };

  // Create Teacher Form Component
  const CreateTeacherForm = () => {
    const [formData, setFormData] = useState({
      email: '',
      full_name: '',
      phone: '',
      gender: '1', // Default male
      dob: '',
      role_id: roles.length > 0 ? roles[0].id : 2 // Use first available teacher role
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Basic validation
      if (!formData.email || !formData.full_name || !formData.phone) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      
      handleCreateTeacher(formData);
    };

    return (
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Email *</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Nhập email giáo viên"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Họ và tên *</Label>
          <Input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Số điện thoại *</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Giới tính</Label>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="1">Nam</option>
            <option value="2">Nữ</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Ngày sinh</Label>
          <Input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Vai trò</Label>
          <Select
            name="role_id"
            value={formData.role_id}
            onChange={handleInputChange}
          >
            {roles.length > 0 ? (
              roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))
            ) : (
              <option value="2">Teacher (Default)</option>
            )}
          </Select>
        </FormGroup>

        <ModalActions>
          <ActionButton 
            type="button" 
            onClick={() => setShowCreateModal(false)}
            disabled={modalLoading}
          >
            Hủy
          </ActionButton>
          <ActionButton 
            type="submit" 
            variant="primary"
            disabled={modalLoading}
          >
            {modalLoading ? 'Đang tạo...' : 'Tạo giáo viên'}
          </ActionButton>
        </ModalActions>
      </form>
    );
  };

  // Teacher Detail Modal Component
  const TeacherDetailModal = () => {
    if (!selectedTeacher) return null;

    const renderBasicInfo = () => (
      <TabContent>
        <DetailItem>
          <span className="label">Tên đăng nhập:</span>
          <span className="value">{selectedTeacher.user_name}</span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Họ và tên:</span>
          <span className="value">{selectedTeacher.full_name}</span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Email:</span>
          <span className="value">{selectedTeacher.email}</span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Số điện thoại:</span>
          <span className="value">{selectedTeacher.phone || 'Chưa cập nhật'}</span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Giới tính:</span>
          <span className="value">{selectedTeacher.gender || 'Chưa cập nhật'}</span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Ngày sinh:</span>
          <span className="value">
            {selectedTeacher.dob ? new Date(selectedTeacher.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
          </span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Lớp chủ nhiệm:</span>
          <span className="value">{selectedTeacher.homeroom_class || selectedTeacher.class_code || 'Chưa có lớp'}</span>
        </DetailItem>
        
        <DetailItem>
          <span className="label">Trạng thái:</span>
          <span className="value">
            <StatusBadge status={selectedTeacher.status}>
              {selectedTeacher.status}
            </StatusBadge>
          </span>
        </DetailItem>
      </TabContent>
    );

    const renderSubjects = () => {
      const [selectedSubjectCodes, setSelectedSubjectCodes] = useState(() => {
        // Initialize with current teacher subjects
        return teacherSubjects.map(s => s.subject_code || s.code).filter(Boolean);
      });

      // Update selected subjects when teacherSubjects changes
      useEffect(() => {
        setSelectedSubjectCodes(teacherSubjects.map(s => s.subject_code || s.code).filter(Boolean));
      }, [teacherSubjects]);

      const handleSubjectSelection = (subjectCode, isSelected) => {
        if (isSelected) {
          setSelectedSubjectCodes(prev => [...prev, subjectCode]);
        } else {
          setSelectedSubjectCodes(prev => prev.filter(code => code !== subjectCode));
        }
      };

      const handleSaveSubjectsLocal = () => {
        handleSaveSubjects(selectedSubjectCodes);
      };

      return (
        <TabContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: '#2c3e50', margin: 0 }}>
              📚 Môn học đang dạy ({teacherSubjects.length} môn)
            </h4>
            <ActionButton 
              variant="primary" 
              onClick={() => setEditingSubjects(!editingSubjects)}
            >
              {editingSubjects ? 'Hủy' : 'Chỉnh sửa'}
            </ActionButton>
          </div>

          {editingSubjects ? (
            <div>
              <h5 style={{ color: '#2c3e50', marginBottom: '10px' }}>Chọn môn học:</h5>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                {availableSubjects.map((subject) => (
                  <div key={subject.subject_code} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      id={subject.subject_code}
                      checked={selectedSubjectCodes.includes(subject.subject_code)}
                      onChange={(e) => handleSubjectSelection(subject.subject_code, e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor={subject.subject_code} style={{ flex: 1, cursor: 'pointer' }}>
                      <strong>{subject.subject_code}</strong> - {subject.subject_name}
                    </label>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <ActionButton variant="primary" onClick={handleSaveSubjectsLocal}>
                  Lưu thay đổi
                </ActionButton>
                <ActionButton onClick={() => setEditingSubjects(false)}>
                  Hủy
                </ActionButton>
              </div>
            </div>
          ) : (
            <div>
              {teacherSubjects.length > 0 ? (
                teacherSubjects.map((subject, index) => (
                  <SubjectCard key={index}>
                    <div className="subject-name">
                      {subject.subject_name || subject.name || 'Không có tên môn'}
                    </div>
                    <div className="subject-code">
                      {subject.subject_code || subject.code || 'N/A'}
                    </div>
                  </SubjectCard>
                ))
              ) : (
                <EmptyMessage>
                  <div className="icon">📚</div>
                  <div>Giáo viên chưa được phân công môn học nào</div>
                </EmptyMessage>
              )}
            </div>
          )}
        </TabContent>
      );
    };

    const renderScheduleConfig = () => {
      const dayNames = {
        monday: 'Thứ 2',
        tuesday: 'Thứ 3', 
        wednesday: 'Thứ 4',
        thursday: 'Thứ 5',
        friday: 'Thứ 6',
        saturday: 'Thứ 7',
        sunday: 'Chủ nhật'
      };

      const handleSlotToggle = (day, slotCode) => {
        const currentSlots = scheduleData[day] ? scheduleData[day].split('|').filter(Boolean) : [];
        const slotStr = String(slotCode);
        
        let newSlots;
        if (currentSlots.includes(slotStr)) {
          // Remove slot
          newSlots = currentSlots.filter(s => s !== slotStr);
        } else {
          // Add slot
          newSlots = [...currentSlots, slotStr].sort((a, b) => parseInt(a) - parseInt(b));
        }
        
        setScheduleData(prev => ({
          ...prev,
          [day]: newSlots.join('|')
        }));
      };

      const handleNumberChange = (field, value) => {
        const numValue = value === '' ? 0 : parseInt(value) || 0;
        setScheduleData(prev => ({
          ...prev,
          [field]: numValue
        }));
      };

      const handleSaveScheduleLocal = () => {
        handleSaveSchedule(scheduleData);
        setEditingSchedule(false);
      };

      return (
        <TabContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ color: '#2c3e50', margin: 0 }}>
              📅 Cấu hình lịch làm việc
            </h4>
            <ActionButton 
              variant="primary" 
              onClick={() => setEditingSchedule(!editingSchedule)}
            >
              {editingSchedule ? '❌ Hủy' : '✏️ Chỉnh sửa'}
            </ActionButton>
          </div>

          {editingSchedule ? (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  💡 <strong>Hướng dẫn:</strong> Click vào các checkbox để chọn tiết học mà giáo viên có thể dạy. 
                  Theo API document: <code>monday: "1|3|4|5|6"</code> nghĩa là thứ 2 dạy tiết 1,3,4,5,6
                </p>
              </div>

              {/* Schedule Grid */}
              <ScheduleTable>
                {/* Headers */}
                {Object.keys(dayNames).map(day => (
                  <DayHeader key={day}>
                    {dayNames[day]}
                  </DayHeader>
                ))}
                
                {/* Slot rows */}
                {timeSlots && timeSlots.length > 0 ? timeSlots.map(slot => (
                  <SlotRow key={slot.time_slot_code}>
                    {Object.keys(dayNames).map(day => {
                      const currentSlots = scheduleData[day] ? scheduleData[day].split('|').filter(Boolean) : [];
                      const slotCode = String(slot.time_slot_code);
                      const isSelected = currentSlots.includes(slotCode);
                      
                      return (
                        <SlotCell 
                          key={`${day}-${slot.time_slot_code}`}
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#d4edda' : '#f8d7da',
                            border: '1px solid ' + (isSelected ? '#28a745' : '#dc3545'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50px',
                            fontSize: '12px'
                          }}
                          onClick={() => handleSlotToggle(day, slot.time_slot_code)}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>
                              Tiết {slot.time_slot_code}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '2px' }}>
                              {slot.start_time}-{slot.end_time}
                            </div>
                            <div style={{ fontSize: '16px', marginTop: '4px' }}>
                              {isSelected ? '✅' : '❌'}
                            </div>
                          </div>
                        </SlotCell>
                      );
                    })}
                  </SlotRow>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                    Đang tải thông tin tiết học...
                  </div>
                )}
              </ScheduleTable>

              {/* Number Inputs */}
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <FormGroup>
                  <Label>Tiết tối thiểu/tuần:</Label>
                  <Input
                    type="number"
                    min="0"
                    value={scheduleData.weekly_minimum_slot}
                    onChange={(e) => handleNumberChange('weekly_minimum_slot', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Tiết tối đa/tuần:</Label>
                  <Input
                    type="number"
                    min="0"
                    value={scheduleData.weekly_maximum_slot}
                    onChange={(e) => handleNumberChange('weekly_maximum_slot', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Tiết tối thiểu/ngày:</Label>
                  <Input
                    type="number"
                    min="0"
                    value={scheduleData.daily_minimum_slot}
                    onChange={(e) => handleNumberChange('daily_minimum_slot', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Tiết tối đa/ngày:</Label>
                  <Input
                    type="number"
                    min="0"
                    value={scheduleData.daily_maximum_slot}
                    onChange={(e) => handleNumberChange('daily_maximum_slot', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Ngày tối thiểu/tuần:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    value={scheduleData.weekly_minimum_day}
                    onChange={(e) => handleNumberChange('weekly_minimum_day', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Ngày tối đa/tuần:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    value={scheduleData.weekly_maximum_day}
                    onChange={(e) => handleNumberChange('weekly_maximum_day', e.target.value)}
                  />
                </FormGroup>
              </div>

              {/* Current Data Preview */}
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                <strong>📋 Data sẽ gửi lên API:</strong>
                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {Object.keys(dayNames).map(day => (
                    <div key={day} style={{ fontSize: '12px', padding: '8px', backgroundColor: '#fff', borderRadius: '4px' }}>
                      <strong>{dayNames[day]}:</strong> "{scheduleData[day] || ''}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <ActionButton variant="primary" onClick={handleSaveScheduleLocal}>
                  💾 Lưu cấu hình
                </ActionButton>
                <ActionButton variant="secondary" onClick={() => setEditingSchedule(false)}>
                  ❌ Hủy
                </ActionButton>
              </div>
            </div>
          ) : (
            <div>
              {teacherScheduleConfig ? (
                <div>
                  {/* View Mode Schedule Grid */}
                  <ScheduleTable>
                    {Object.keys(dayNames).map(day => (
                      <DayHeader key={day}>
                        {dayNames[day]}
                      </DayHeader>
                    ))}
                    
                    {timeSlots && timeSlots.map(slot => (
                      <SlotRow key={slot.time_slot_code}>
                        {Object.keys(dayNames).map(day => {
                          let slots = [];
                          const dayData = teacherScheduleConfig[day];
                          
                          if (Array.isArray(dayData)) {
                            slots = dayData;
                          } else if (typeof dayData === 'string' && dayData) {
                            slots = dayData.split('|').filter(Boolean);
                          }
                          
                          const slotCode = slot.time_slot_code;
                          const hasSlot = slots.includes(String(slotCode)) || slots.includes(slotCode);
                          
                          return (
                            <SlotCell 
                              key={`${day}-${slot.time_slot_code}`}
                              style={{
                                backgroundColor: hasSlot ? '#d4edda' : '#f8d7da',
                                color: hasSlot ? '#155724' : '#721c24',
                                textAlign: 'center',
                                fontSize: '12px',
                                padding: '8px'
                              }}
                            >
                              <div>Tiết {slot.time_slot_code}</div>
                              <div style={{ fontSize: '10px' }}>{slot.start_time}-{slot.end_time}</div>
                              <div>{hasSlot ? '✅' : '❌'}</div>
                            </SlotCell>
                          );
                        })}
                      </SlotRow>
                    ))}
                  </ScheduleTable>
                  
                  {/* Summary */}
                  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <DetailItem>
                      <span className="label">Tiết tối thiểu/tuần:</span>
                      <span className="value">{teacherScheduleConfig.weekly_minimum_slot || 0}</span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Tiết tối đa/tuần:</span>
                      <span className="value">{teacherScheduleConfig.weekly_maximum_slot || 'Không giới hạn'}</span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Tiết tối thiểu/ngày:</span>
                      <span className="value">{teacherScheduleConfig.daily_minimum_slot || 0}</span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Tiết tối đa/ngày:</span>
                      <span className="value">{teacherScheduleConfig.daily_maximum_slot || 'Không giới hạn'}</span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Ngày tối thiểu/tuần:</span>
                      <span className="value">{teacherScheduleConfig.weekly_minimum_day || 0}</span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Ngày tối đa/tuần:</span>
                      <span className="value">{teacherScheduleConfig.weekly_maximum_day || 'Không giới hạn'}</span>
                    </DetailItem>
                  </div>
                </div>
              ) : (
                <EmptyMessage>
                  <div className="icon">📅</div>
                  <div>Chưa có cấu hình lịch làm việc</div>
                </EmptyMessage>
              )}
            </div>
          )}
        </TabContent>
      );
    };

    return (
      <div>
        <TabContainer>
          <Tab 
            active={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
          >
            👤 Thông tin cơ bản
          </Tab>
          <Tab 
            active={activeTab === 'subjects'} 
            onClick={() => setActiveTab('subjects')}
          >
            📚 Môn học ({teacherSubjects.length})
          </Tab>
          <Tab 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
          >
            📅 Lịch làm việc
          </Tab>
        </TabContainer>

        {activeTab === 'info' && renderBasicInfo()}
        {activeTab === 'subjects' && renderSubjects()}
        {activeTab === 'schedule' && renderScheduleConfig()}

        <ModalActions>
          <ActionButton onClick={() => setShowDetailModal(false)}>
            Đóng
          </ActionButton>
        </ModalActions>
      </div>
    );
  };

  return (
    <Container>
      <Header>
        <Title>👨‍🏫 Quản lí giáo viên</Title>
        <AddButton onClick={() => setShowCreateModal(true)}>
          + Thêm giáo viên
        </AddButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={searchTerm}
          onChange={handleSearch}
        />
        
        <Select 
          value={statusFilter} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Tạm khóa">Tạm khóa</option>
        </Select>

        <Select 
          value={classFilter} 
          onChange={(e) => handleFilterChange('class', e.target.value)}
        >
          <option value="">Tất cả lớp</option>
          <option value="NONE">Chưa có lớp</option>
          <option value="AVAILABLE">Chỉ GV chưa có lớp</option>
        </Select>
      </FilterSection>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>
            🔄 Đang tải dữ liệu...
          </LoadingSpinner>
        ) : teachers.length === 0 ? (
          <EmptyState>
            <div className="icon">👨‍🏫</div>
            <div>Không tìm thấy giáo viên nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Tên đăng nhập</TableHeaderCell>
                  <TableHeaderCell>Họ và tên</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Số điện thoại</TableHeaderCell>
                  <TableHeaderCell>Lớp chủ nhiệm</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                  <TableHeaderCell>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.user_name}>
                    <TableCell>{teacher.user_name}</TableCell>
                    <TableCell>{teacher.full_name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone || 'N/A'}</TableCell>
                    <TableCell>{teacher.homeroom_class || teacher.class_code || 'Chưa có lớp'}</TableCell>
                    <TableCell>
                      <StatusBadge status={teacher.status}>
                        {teacher.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton 
                        variant="primary"
                        onClick={() => handleViewDetail(teacher.user_name)}
                      >
                        👁️ Xem chi tiết
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <Pagination>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Trước
                </PaginationButton>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <PaginationButton
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}
                
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Tiếp →
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </TableContainer>

      {/* Create Teacher Modal */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>👨‍🏫 Thêm giáo viên mới</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <CreateTeacherForm />
          </ModalContent>
        </Modal>
      )}

      {/* Teacher Detail Modal */}
      {showDetailModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>👨‍🏫 Chi tiết giáo viên</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            {modalLoading ? (
              <LoadingSpinner>🔄 Đang tải thông tin...</LoadingSpinner>
            ) : (
              <TeacherDetailModal />
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default TeacherManagement; 