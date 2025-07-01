import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { fetchTimeSlots, fetchAllTeachers } from '../../api';

// Get API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hast-app.online';

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
  flex-wrap: nowrap; 
  gap: 15px;
  align-items: center;
  overflow-x: auto; 
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

const SelectMenu = styled.select`
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
  background: ${(props) => {
    switch (props.status) {
      case 'Đang hoạt động':
        return '#d4edda'; // xanh nhạt
      case 'Tạm khóa':
        return '#fff3cd'; // vàng nhạt
      default:
        return '#f8d7da'; // đỏ nhạt
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'Đang hoạt động':
        return '#155724'; // xanh đậm
      case 'Tạm khóa':
        return '#856404'; // vàng đậm
      default:
        return '#721c24'; // đỏ đậm
    }
  }};
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
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
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

// Modern Schedule Table Components
const ScheduleTableContainer = styled.div`
  margin: 20px 0;
  border-radius: 8px;
  overflow-x: auto;
  overflow-y: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ScheduleTableElement = styled.table`
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  background: white;
`;

const TimeSlotHeader = styled.th`
  background:white;
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: black;
  min-width: 100px;
`;

const DayHeaderCell = styled.th`
  background: white;
  color: black;
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  min-width: 120px;
`;

const ScheduleCell = styled.td.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isEditing',
})`
  padding: 16px 12px;
  vertical-align: middle;
  text-align: center;
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
  font-size: 13px;
  white-space: nowrap;
  cursor: ${props => props.isEditing ? 'pointer' : 'default'};
  background: ${props => props.isSelected ? '#c6efce' : '#ffc7ce'};
  color: ${props => props.isSelected ? '#006100' : '#9c0006'};
  
  &:hover {
    opacity: ${props => props.isEditing ? '0.8' : '1'};
  }
`;



const Input = styled.input`
  width: 80%;
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

const APIStatusCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  border-left: 4px solid #007bff;
  
  .status-title {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .status-content {
    font-size: 12px;
    color: #666;
    
    .api-endpoint {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      margin: 2px 0;
      display: inline-block;
    }
  }
`;
const ActionMenuButton = styled.button`
  background: #4f46e5; /* Indigo-600 */
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #4338ca; /* Indigo-700 */
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ActionDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  margin-top: 5px;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
`;

const ActionMenuItem = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #2c3e50;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
  }
`;

const ActionMenuIcon = styled.span`
  font-size: 14px;
  width: 16px;
  text-align: center;
`;

const ActionMenuText = styled.span`
  font-size: 14px;
  color: #2c3e50;
`;


function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Add state for action dropdown
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
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

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const params = ({
        page: currentPage,
        limit: 10,
      });
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (statusFilter) {
        params.filter = params.filter || {};
        params.filter.status = statusFilter;
      }
      const result = await fetchAllTeachers(token, params);

      if (result && result.data_set) {
        setTeachers(result.data_set);
        if (result.pagination) {
          setTotalPages(result.pagination.last || 1);
        } else {
          setTotalPages(Math.ceil((result.data_set.length) / 10));
        }
      } else {
        setClasses([]);
        setTotalPages(1);
      }
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
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // Handle click outside to close action menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionMenuToggle = (userId) => {
    setOpenActionMenu(openActionMenu === userId ? null : userId);
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
      const teacherResponse = await fetch(`${API_BASE_URL}/api/teacher/${teacherUsername}`, {
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
        fetch(`${API_BASE_URL}/api/teacher/teacher-subject/${teacherUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/api/teacher/teacher-schedule-config/${teacherUsername}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/user/add`, {
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
    }
    setCurrentPage(1);
  };

  // Fetch roles for create form
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/user-role?filter[status]=Đang hoạt động&filter[is_teacher]=true`, {
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
      const response = await fetch(`${API_BASE_URL}/api/subject?filter[status]=Đang hoạt động`, {
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
  const fetchTimeSlotsData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const slotList = await fetchTimeSlots(token);

      if (!slotList || !Array.isArray(slotList)) {
        setTimeSlots([]);
        return;
      }

      // Filter and normalize slots
      const validSlots = slotList.filter(slot => {
        if (!slot) return false;
        const hasCode = slot.time_slot_code !== undefined || slot.code !== undefined || slot.id !== undefined;
        const hasStartTime = slot.start_time || slot.startTime || slot.start;
        const hasEndTime = slot.end_time || slot.endTime || slot.end;
        return hasCode && hasStartTime && hasEndTime;
      });

      const normalizedSlots = validSlots.map(slot => ({
        time_slot_code: slot.time_slot_code || slot.code || slot.slot_code || slot.id,
        start_time: slot.start_time || slot.startTime || slot.start,
        end_time: slot.end_time || slot.endTime || slot.end
      }));

      setTimeSlots(normalizedSlots);

      if (normalizedSlots.length === 0) {
        toast.error('Không có dữ liệu tiết học');
      }

    } catch (error) {
      // Fallback to default time slots if API fails
      const fallbackSlots = [
        { time_slot_code: 1, start_time: '07:00', end_time: '07:45' },
        { time_slot_code: 2, start_time: '08:00', end_time: '08:45' },
        { time_slot_code: 3, start_time: '09:00', end_time: '09:45' },
        { time_slot_code: 4, start_time: '10:00', end_time: '10:45' },
        { time_slot_code: 5, start_time: '13:00', end_time: '13:45' },
        { time_slot_code: 6, start_time: '14:00', end_time: '14:45' },
        { time_slot_code: 7, start_time: '15:00', end_time: '15:45' },
        { time_slot_code: 8, start_time: '16:00', end_time: '16:45' },
      ];

      setTimeSlots(fallbackSlots);
      toast.warning('Sử dụng dữ liệu mặc định');
    }
  };

  // Fetch teacher subjects separately (for refresh after save)
  const fetchTeacherSubjects = async (teacherUsername) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/teacher/teacher-subject/${teacherUsername}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/teacher/teacher-schedule-config/${teacherUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const schedule = data.data || data.data_set?.[0] || null;
        setTeacherScheduleConfig(schedule);
      } else {
        setTeacherScheduleConfig(null);
      }
    } catch (error) {
      console.error('Error fetching teacher schedule config:', error);
      setTeacherScheduleConfig(null);
    }
  };

  // Fetch time slots once when component mounts
  useEffect(() => {
    fetchTimeSlotsData(); // Load time slots for schedule
  }, []); // Run only once

  // Fetch data when dependencies change
  useEffect(() => {
    fetchTeachers();
    fetchRoles(); // Load roles for create modal
    fetchAvailableSubjects(); // Load subjects for assignment
  }, [currentPage, searchTerm, statusFilter]);

  // Convert API schedule format to internal format and vice versa
  const convertApiScheduleToInternal = (apiSchedule) => {
    if (!apiSchedule) return {};
    const result = {};

    // Handle each day - API returns arrays, we need strings with "|" separator
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      if (Array.isArray(apiSchedule[day])) {
        // Filter out empty strings and join with "|"
        result[day] = apiSchedule[day].filter(slot => slot && slot.trim()).join('|');
      } else if (typeof apiSchedule[day] === 'string') {
        result[day] = apiSchedule[day];
      } else {
        result[day] = '';
      }
    });

    return result;
  };

  const convertInternalScheduleToApi = (internalSchedule) => {
    const result = { ...internalSchedule };

    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      if (!result[day]) {
        result[day] = '';
      }
    });

    return result;
  };

  useEffect(() => {
    if (teacherScheduleConfig) {
      const convertedSchedule = convertApiScheduleToInternal(teacherScheduleConfig);
      const newData = {
        monday: convertedSchedule.monday || '',
        tuesday: convertedSchedule.tuesday || '',
        wednesday: convertedSchedule.wednesday || '',
        thursday: convertedSchedule.thursday || '',
        friday: convertedSchedule.friday || '',
        saturday: convertedSchedule.saturday || '',
        sunday: convertedSchedule.sunday || '',
        weekly_minimum_slot: teacherScheduleConfig?.weekly_minimum_slot || 0,
        weekly_maximum_slot: teacherScheduleConfig?.weekly_maximum_slot || 0,
        daily_minimum_slot: teacherScheduleConfig?.daily_minimum_slot || 0,
        daily_maximum_slot: teacherScheduleConfig?.daily_maximum_slot || 0,
        weekly_minimum_day: teacherScheduleConfig?.weekly_minimum_day || 0,
        weekly_maximum_day: teacherScheduleConfig?.weekly_maximum_day || 0,
      };

      setScheduleData(newData);
    } else {
      setScheduleData({
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
    }
  }, [teacherScheduleConfig]);

  // Handle save teacher subjects
  const handleSaveSubjects = async (selectedSubjects) => {
    if (!selectedTeacher) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/teacher/teacher-subject/add`, {
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
  const handleSaveSchedule = async (internalScheduleData) => {
    if (!selectedTeacher) {
      console.error('❌ No selected teacher');
      return;
    }

    try {
      setModalLoading(true);
      const token = localStorage.getItem('authToken');

      const apiScheduleData = convertInternalScheduleToApi(internalScheduleData);

      const requestData = {
        teacher_user_name: selectedTeacher.user_name,
        ...apiScheduleData
      };

      const response = await fetch(`${API_BASE_URL}/api/teacher/teacher-schedule-config/add`, {
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
        await fetchTeacherScheduleConfig(selectedTeacher.user_name);
      } else {
        const errorData = await response.text();

        if (response.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn');
        } else if (response.status === 403) {
          toast.error('Không có quyền thực hiện thao tác này');
        } else {
          toast.error(`Có lỗi khi cập nhật lịch làm việc (${response.status}): ${errorData}`);
        }
      }
    } catch (error) {
      toast.error('Có lỗi kết nối khi cập nhật lịch làm việc');
    } finally {
      setModalLoading(false);
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
          <SelectMenu
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="1">Nam</option>
            <option value="2">Nữ</option>
          </SelectMenu>
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
          <SelectMenu
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
          </SelectMenu>
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
          <span className="label">Tên tài khoản:</span>
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
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <ActionButton variant="primary" onClick={handleSaveSubjectsLocal}>
                  Xác nhận
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
        if (!day || slotCode === undefined || slotCode === null) return;

        const currentSlots = scheduleData[day] ? scheduleData[day].split('|').filter(Boolean) : [];
        const slotStr = String(slotCode);

        const slotExists = timeSlots.some(slot => String(slot.time_slot_code) === slotStr);
        if (!slotExists) return;

        let newSlots;
        if (currentSlots.includes(slotStr)) {
          newSlots = currentSlots.filter(s => s !== slotStr);
        } else {
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
        const hasAnySlots = Object.keys(scheduleData)
          .filter(key => !key.includes('_slot') && !key.includes('_day'))
          .some(day => scheduleData[day] && scheduleData[day].length > 0);

        if (!hasAnySlots) {
          toast.warning('Vui lòng chọn ít nhất một tiết học trước khi lưu');
          return;
        }

        handleSaveSchedule(scheduleData);
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
              {editingSchedule ? 'Hủy' : 'Chỉnh sửa'}
            </ActionButton>
          </div>



          {editingSchedule ? (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Click vào các ô để chọn tiết học mà giáo viên có thể dạy
                  </p>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <ActionButton
                      variant="secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => {
                        const allSlots = timeSlots
                          .map(slot => String(slot.time_slot_code))
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .join('|');

                        setScheduleData(prev => ({
                          ...prev,
                          monday: allSlots,
                          tuesday: allSlots,
                          wednesday: allSlots,
                          thursday: allSlots,
                          friday: allSlots
                        }));
                      }}
                    >
                      Chọn tất cả T2-T6
                    </ActionButton>
                    {/* <ActionButton
                      variant="secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => {
                        const morningSlots = timeSlots
                          .filter(slot => parseInt(slot.time_slot_code) <= 4)
                          .map(slot => String(slot.time_slot_code))
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .join('|');

                        setScheduleData(prev => ({
                          ...prev,
                          monday: morningSlots,
                          tuesday: morningSlots,
                          wednesday: morningSlots,
                          thursday: morningSlots,
                          friday: morningSlots
                        }));
                      }}
                    >
                      Chỉ ca sáng
                    </ActionButton> */}
                    <ActionButton
                      variant="secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => {
                        setScheduleData(prev => ({
                          ...prev,
                          monday: '',
                          tuesday: '',
                          wednesday: '',
                          thursday: '',
                          friday: '',
                          saturday: '',
                          sunday: ''
                        }));
                      }}
                    >
                      Xóa tất cả
                    </ActionButton>
                  </div>
                </div>
              </div>

              {/* Schedule Grid */}
              <ScheduleTableContainer>
                <ScheduleTableElement>
                  <thead>
                    <tr>
                      <TimeSlotHeader>Tiết</TimeSlotHeader>
                      {Object.keys(dayNames).map(day => (
                        <DayHeaderCell key={day}>
                          {dayNames[day]}
                        </DayHeaderCell>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots && timeSlots.length > 0 ? timeSlots.map((slot, index) => {
                      if (!slot || slot.time_slot_code === undefined) return null;

                      return (
                        <tr key={`slot-${slot.time_slot_code}-${index}`}>
                          <TimeSlotHeader>
                            <div style={{ fontWeight: 'bold' }}>Tiết {slot.time_slot_code}</div>
                          </TimeSlotHeader>
                          {Object.keys(dayNames).map(day => {
                            const currentSlots = scheduleData[day] ? scheduleData[day].split('|').filter(Boolean) : [];
                            const slotCode = String(slot.time_slot_code);
                            const isSelected = currentSlots.includes(slotCode);

                            return (
                              <ScheduleCell
                                key={`${day}-${slot.time_slot_code}`}
                                isSelected={isSelected}
                                isEditing={true}
                                onClick={() => handleSlotToggle(day, slot.time_slot_code)}
                              >
                                {isSelected ? 'Trống' : 'Nghỉ'}
                              </ScheduleCell>
                            );
                          })}
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                          Đang tải thông tin tiết học...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </ScheduleTableElement>
              </ScheduleTableContainer>

              {/* Number Inputs */}
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>


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
                  <Label>Tiết tối đa/ngày:</Label>
                  <Input
                    type="number"
                    min="0"
                    value={scheduleData.daily_maximum_slot}
                    onChange={(e) => handleNumberChange('daily_maximum_slot', e.target.value)}
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



              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <ActionButton
                  variant="primary"
                  onClick={handleSaveScheduleLocal}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Đang lưu...' : 'Xác nhận'}
                </ActionButton>
              </div>
            </div>
          ) : (
            <div>
              {teacherScheduleConfig ? (
                <div>
                  {/* View Mode Schedule Table */}
                  <ScheduleTableContainer>
                    <ScheduleTableElement>
                      <thead>
                        <tr>
                          <TimeSlotHeader>Tiết học</TimeSlotHeader>
                          {Object.keys(dayNames).map(day => (
                            <DayHeaderCell key={day}>
                              {dayNames[day]}
                            </DayHeaderCell>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots && timeSlots.length > 0 ? timeSlots.map((slot, index) => {
                          if (!slot || slot.time_slot_code === undefined) return null;

                          return (
                            <tr key={`view-slot-${slot.time_slot_code}-${index}`}>
                              <TimeSlotHeader>
                                <div style={{ fontWeight: 'bold' }}>Tiết {slot.time_slot_code}</div>
                              </TimeSlotHeader>
                              {Object.keys(dayNames).map(day => {
                                let slots = [];
                                const dayData = teacherScheduleConfig[day];

                                if (Array.isArray(dayData)) {
                                  slots = dayData.filter(s => s && s.trim());
                                } else if (typeof dayData === 'string' && dayData) {
                                  slots = dayData.split('|').filter(Boolean);
                                }

                                const slotCode = String(slot.time_slot_code);
                                const hasSlot = slots.includes(slotCode);

                                return (
                                  <ScheduleCell
                                    key={`view-${day}-${slot.time_slot_code}`}
                                    isSelected={hasSlot}
                                    isEditing={false}
                                  >
                                    {hasSlot ? 'Trống' : 'Nghỉ'}
                                  </ScheduleCell>
                                );
                              })}
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                              Không có dữ liệu tiết học
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </ScheduleTableElement>
                  </ScheduleTableContainer>


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

      </div>
    );
  };

  return (
    <Container>
      <Header>
        <Title>👨‍🏫 Quản lí giáo viên</Title>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <SelectMenu
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Tạm khóa">Tạm khóa</option>
          <option value="Ngưng hoạt động">Ngưng hoạt động</option>
        </SelectMenu>

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
                  <TableHeaderCell style={{ width: '10%' }}>Tên tài khoản</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Họ và tên</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Email</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Số điện thoại</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Lớp chủ nhiệm</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.user_name}>
                    <TableCell>{teacher.user_name}</TableCell>
                    <TableCell>{teacher.full_name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone || 'N/A'}</TableCell>
                    <TableCell>{teacher.homeroom_class || teacher.hoomroom_class || 'Chưa có lớp'}</TableCell>
                    <TableCell>
                      <StatusBadge status={teacher.status}>
                        {teacher.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(teacher.user_name)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === teacher.user_name}>
                        <ActionMenuItem onClick={() => {
                          handleViewDetail(teacher.user_name);
                          setOpenActionMenu(null);
                        }}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                      </ActionDropdown>
                    </TableCell>


                  </TableRow>
                ))}
              </tbody>
            </Table>


          </>
        )}
      </TableContainer>
      {totalPages > 1 && (
        <Pagination>
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </PaginationButton>
            );
          })}

          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau →
          </PaginationButton>
        </Pagination>
      )}
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