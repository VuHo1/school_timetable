import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import {
  fetchSubjects as apiFetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchGradeLevels,
  fetchSubjectCodeList,
  fetchTimeSlots
} from '../../api';

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
  background: #10B981;
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
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
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
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
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
    border-color: #27ae60;
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

const OnlineBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOnline',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.isOnline ? '#cce5ff' : '#f0f0f0'};
  color: ${props => props.isOnline ? '#0066cc' : '#666'};
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

const ModalOverlay = styled.div`
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
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

const ModalBody = styled.div`
  padding: 30px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #2c3e50;
  
  input[type="radio"] {
    margin: 0;
  }
`;

const ModalActions = styled.div`
  padding: 20px 30px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${(props) => props.variant === 'primary' ? '#3b82f6' : '#e74c3c'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionMenuButton = styled.button`
  background: #4f46e5;
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
    background: #4338ca;
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
`;

const ActionMenuText = styled.span`
  font-size: 14px;
  color: #2c3e50;
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

const SlotConfigButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  }
`;

const EditableTableCell = styled.td.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isEditing' && prop !== 'slotType',
})`
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #2c3e50;
  text-align: center;
  font-weight: 500;
  cursor: ${props => props.isEditing ? 'pointer' : 'default'};
  background: ${props => {
    if (props.slotType === 'fixed') {
      return '#d3d3d3';
    }
    if (props.slotType === 'avoid') {
      return '#ffc7ce';
    }
    return '#c6efce';
  }};
  color: ${props => {
    if (props.slotType === 'fixed') {
      return '#000';
    }
    if (props.slotType === 'avoid') {
      return '#9c0006';
    }
    return '#006100';
  }};
  
  &:hover {
    opacity: ${props => props.isEditing ? '0.8' : '1'};
  }
`;

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showDetailSlotModal, setShowDetailSlotModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [slotModalData, setSlotModalData] = useState({ fixed_slot: [], avoid_slot: [] });
  const [slotSelectionMode, setSlotSelectionMode] = useState('fixed');
  const [timeSlots, setTimeSlots] = useState([]);
  const actionMenuRef = useRef(null);
  const newSubjectCodeRef = useRef(null);
  const newSubjectNameRef = useRef(null);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    grade_level: [],
    is_online_course: false,
    weekly_slot: 1,
    continuous_slot: 1,
    limit: 0,
    fixed_slot: [],
    avoid_slot: []
  });
  const [subjectCodeType, setSubjectCodeType] = useState('existing'); // 'existing' or 'new'
  const [newSubjectCode, setNewSubjectCode] = useState(''); // Separate state for new subject code input
  const [newSubjectName, setNewSubjectName] = useState(''); // Separate state for new subject name input
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjectCodes, setSubjectCodes] = useState([]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = {
        page: currentPage,
        limit: 10,
        sort: 'subject_code'
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (gradeFilter || statusFilter) {
        params.filter = {};
        if (gradeFilter) params.filter.grade_level_id = gradeFilter;
        if (statusFilter) params.filter.status = statusFilter;
      }
      const data = await apiFetchSubjects(token, params);
      const subjectList = data.data_set || data.data || [];
      setSubjects(subjectList);
      setTotalPages(data.pagination.last);
    } catch (error) {
      toast.error(error.message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const grades = await fetchGradeLevels(token);
      setGradeLevels(grades || []);
      const subjectCodeList = await fetchSubjectCodeList(token);
      setSubjectCodes(subjectCodeList || []);
      const timeSlotsData = await fetchTimeSlots(token);
      setTimeSlots(timeSlotsData || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreate = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('authToken');

      // Prepare data based on subject code type
      const submitData = { ...formData };

      if (subjectCodeType === 'new') {
        submitData.subject_code = newSubjectCode;
        submitData.subject_name = newSubjectName;
        submitData.is_new = true;
      } else {

        submitData.is_new = false;
      }

      // Validation
      if (!submitData.subject_code || submitData.grade_level.length === 0) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }

      // Additional validation for new subject code
      if (subjectCodeType === 'new' && !submitData.subject_name) {
        toast.error('Vui lòng nhập tên môn học');
        return;
      }

      const response = await createSubject(token, submitData);
      if (response.success) {
        toast.success(response.description);
        fetchSubjects();
      } else {
        toast.error(response.description);
      }
      setShowCreateModal(false);
      setShowSlotModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Có lỗi khi tạo môn học: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('authToken');
      const updateData = {
        subject_code: selectedSubject.subject_code,
        is_online_course: formData.is_online_course,
        weekly_slot: formData.weekly_slot,
        continuous_slot: formData.continuous_slot,
        limit: formData.limit,
        fixed_slot: formData.fixed_slot,
        avoid_slot: formData.avoid_slot,
        also_update_for_class_subject: formData.also_update_for_class_subject || 'N'
      };
      const response = await updateSubject(token, updateData);
      if (response.success) {
        toast.success(response.description);
        fetchSubjects();
      } else {
        toast.error(response.description);
      }
      setShowEditModal(false);
      setShowSlotModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error('Có lỗi khi cập nhật môn học: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (subjectCode) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await deleteSubject(token, subjectCode);

      if (response.success) {
        toast.success(response.description || 'Xóa thành công!');
        fetchSubjects();
      } else {
        toast.error(response.description || 'Xóa thất bại!');
      }

    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Có lỗi khi xóa môn học: ' + (error.message || 'Không rõ lỗi'));
    }
  };


  const handleViewDetails = (subject) => {
    setSelectedSubject(subject);
    setShowDetailModal(true);
    setOpenActionMenu(null);
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name || '',
      grade_level: subject.grade_level || [],
      is_online_course: subject.is_online_course || false,
      weekly_slot: subject.weekly_slot || 1,
      continuous_slot: subject.continuous_slot || 1,
      limit: subject.limit || 0,
      fixed_slot: subject.fixed_slot || [],
      avoid_slot: subject.avoid_slot || []
    });
    setShowEditModal(true);
    setOpenActionMenu(null);
  };

  const resetForm = () => {
    setFormData({
      subject_code: '',
      subject_name: '',
      grade_level: [],
      is_online_course: false,
      weekly_slot: 1,
      continuous_slot: 1,
      limit: 0,
      fixed_slot: [],
      avoid_slot: []
    });
    setSubjectCodeType('existing');
    setNewSubjectCode('');
    setNewSubjectName('');
    setSelectedSubject(null);
    setSlotModalData({ fixed_slot: [], avoid_slot: [] });
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleGradeLevelChange = (gradeId, isChecked) => {
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        grade_level: [...prev.grade_level, gradeId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        grade_level: prev.grade_level.filter(id => id !== gradeId)
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'grade') {
      setGradeFilter(value);
    } else if (type === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const openSlotModal = () => {
    setSlotModalData({
      fixed_slot: formData.fixed_slot || [],
      avoid_slot: formData.avoid_slot || []
    });
    setShowSlotModal(true);
  };

  const handleSlotToggle = (dayKey, slotId) => {
    const dayMap = {
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };

    const dayOfWeek = dayMap[dayKey];

    setSlotModalData(prev => {
      const newData = { ...prev };

      const existsInFixed = newData.fixed_slot.some(s => s.time_slot_id === slotId && s.day_of_week === dayOfWeek);
      const existsInAvoid = newData.avoid_slot.some(s => s.time_slot_id === slotId && s.day_of_week === dayOfWeek);

      if (slotSelectionMode === 'fixed') {
        if (existsInFixed) {
          newData.fixed_slot = newData.fixed_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === dayOfWeek));
        } else {
          newData.fixed_slot = [...newData.fixed_slot, { time_slot_id: slotId, day_of_week: dayOfWeek }];
          newData.avoid_slot = newData.avoid_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === dayOfWeek));
        }
      } else {
        if (existsInAvoid) {
          newData.avoid_slot = newData.avoid_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === dayOfWeek));
        } else {
          newData.avoid_slot = [...newData.avoid_slot, { time_slot_id: slotId, day_of_week: dayOfWeek }];
          newData.fixed_slot = newData.fixed_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === dayOfWeek));
        }
      }

      return newData;
    });
  };

  const handleSlotModalSave = () => {
    setFormData(prev => ({
      ...prev,
      fixed_slot: slotModalData.fixed_slot,
      avoid_slot: slotModalData.avoid_slot
    }));
    setShowSlotModal(false);
  };


  useEffect(() => {
    fetchSubjects();
  }, [currentPage, searchTerm, gradeFilter, statusFilter]);


  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep focus on input when component re-renders
  useEffect(() => {
    if (subjectCodeType === 'new' && newSubjectCodeRef.current) {
      const currentFocus = document.activeElement;
      if (currentFocus === newSubjectCodeRef.current) {
        // If the input was focused, keep it focused after re-render
        setTimeout(() => {
          if (newSubjectCodeRef.current) {
            newSubjectCodeRef.current.focus();
            // Restore cursor position if possible
            const length = newSubjectCodeRef.current.value.length;
            newSubjectCodeRef.current.setSelectionRange(length, length);
          }
        }, 0);
      }
    }
  });

  const handleActionMenuToggle = (subject_code) => {
    setOpenActionMenu(openActionMenu === subject_code ? null : subject_code);
  };

  const handleSubjectCodeTypeChange = (value) => {
    setSubjectCodeType(value);

    // Auto focus to the appropriate input when switching to "new"
    if (value === 'new') {
      setTimeout(() => {
        if (newSubjectCodeRef.current) {
          newSubjectCodeRef.current.focus();
        }
      }, 100);
    }
  };

  function SubjectSlotTable({ config, timeSlots, isEditing, onToggleSlot, slotSelectionMode }) {
    const days = [
      'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'
    ];
    const dayKeys = [
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];
    const slots = timeSlots;
    const safeConfig = config && Object.keys(config).length > 0
      ? config
      : dayKeys.reduce((acc, key) => { acc[key] = []; return acc; }, {});

    const getSlotType = (dayKey, slotId) => {
      const slotArr = Array.isArray(safeConfig[dayKey]) ? safeConfig[dayKey] : [];
      const slot = slotArr.find(s => s.id === slotId);
      return slot ? slot.type : null;
    };

    const getSlotText = (dayKey, slotId) => {
      const slotType = getSlotType(dayKey, slotId);
      if (slotType === 'fixed') return 'Cố định';
      if (slotType === 'avoid') return 'Tránh';
      return 'Trống';
    };

    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeaderCell>Tiết</TableHeaderCell>
              {days.map(day => (
                <TableHeaderCell key={day}>{day}</TableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => (
              <TableRow key={slot.id || i}>
                <TableCell>
                  <b>Tiết {slot.id}</b>
                </TableCell>
                {dayKeys.map((dayKey, d) => {
                  const slotType = getSlotType(dayKey, slot.id);
                  return (
                    <EditableTableCell
                      key={d}
                      isSelected={!!slotType}
                      isEditing={isEditing}
                      slotType={slotType}
                      onClick={() => isEditing && onToggleSlot(dayKey, slot.id)}
                    >
                      {getSlotText(dayKey, slot.id)}
                    </EditableTableCell>
                  );
                })}
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  const SubjectModal = ({ isEdit = false }) => (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && (isEdit ? setShowEditModal(false) : setShowCreateModal(false))}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {!isEdit && (
            <RadioGroup>
              <RadioItem>
                <input
                  type="radio"
                  name="subjectCodeType"
                  value="existing"
                  checked={subjectCodeType === 'existing'}
                  onChange={(e) => handleSubjectCodeTypeChange(e.target.value)}
                />
                Sử dụng môn có sẵn
              </RadioItem>
              <RadioItem>
                <input
                  type="radio"
                  name="subjectCodeType"
                  value="new"
                  checked={subjectCodeType === 'new'}
                  onChange={(e) => handleSubjectCodeTypeChange(e.target.value)}
                />
                Tạo mã môn mới
              </RadioItem>
            </RadioGroup>
          )}
          <FormGrid>
            <FormGroup>
              <Label>Mã môn học *</Label>
              {isEdit ? (
                <Input
                  type="text"
                  value={formData.subject_code}
                  disabled
                />
              ) : subjectCodeType === 'existing' ? (
                <Select
                  value={formData.subject_code}
                  onChange={(e) => handleInputChange('subject_code', e.target.value)}
                  required
                >
                  <option value="">Chọn mã môn</option>
                  {subjectCodes.map(code => (
                    <option key={code.code_id} value={code.code_id}>
                      {code.code_id} - {code.caption}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  ref={newSubjectCodeRef}
                  type="text"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="Nhập mã môn học mới"
                  required
                />
              )}
            </FormGroup>
            {!isEdit && subjectCodeType === 'new' && (
              <FormGroup>
                <Label>Tên môn học *</Label>
                <Input
                  ref={newSubjectNameRef}
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Nhập tên môn học"
                  required
                />
              </FormGroup>
            )}
            <FormGroup>
              <Label>Số tiết/tuần *</Label>
              <Input
                type="number"
                min="1"
                value={formData.weekly_slot}
                onChange={(e) => handleInputChange('weekly_slot', parseInt(e.target.value) || 1)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Số tiết liên tiếp tối đa *</Label>
              <Input
                type="number"
                min="1"
                value={formData.continuous_slot}
                onChange={(e) => handleInputChange('continuous_slot', parseInt(e.target.value) || 1)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Giới hạn môn cùng thời điểm</Label>
              <Input
                type="number"
                min="0"
                value={formData.limit}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value) || 0)}
                placeholder="0 = không giới hạn"
              />
            </FormGroup>
            <FormGroup>
              <Label>Tiết cố định/Tránh</Label>
              <SlotConfigButton onClick={openSlotModal}>
                {formData.fixed_slot.length} cố định / {formData.avoid_slot.length} tránh
              </SlotConfigButton>
            </FormGroup>
            {!isEdit && (
              <FormGroup>
                <Label>Khối *</Label>
                <CheckboxGroup>
                  {gradeLevels.map(grade => (
                    <CheckboxItem key={grade.code_id}>
                      <input
                        type="checkbox"
                        checked={formData.grade_level.includes(grade.code_id)}
                        onChange={(e) => handleGradeLevelChange(grade.code_id, e.target.checked)}
                      />
                      {grade.caption}
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>
            )}
            {isEdit && (
              <FormGroup>
                <Label htmlFor="alsoUpdateClassSubject">Cập nhật cấu hình lớp học</Label>
                <Select
                  id="alsoUpdateClassSubject"
                  name="also_update_for_class_subject"
                  value={formData.also_update_for_class_subject}
                  onChange={handleChange}
                  title="Chọn phạm vi cập nhật khi thay đổi thông tin môn học"
                >
                  <option key="N" value="N">Không cập nhật cấu hình lớp</option>
                  <option key="G" value="G">Cập nhật các lớp dùng cấu hình mặc định</option>
                  <option key="I" value="I">Cập nhật các lớp đã tùy chỉnh cấu hình</option>
                  <option key="A" value="A">Cập nhật tất cả cấu hình lớp</option>
                </Select>
              </FormGroup>
            )}
          </FormGrid>
        </ModalBody>
        <ModalActions>
          <ActionButton
            onClick={() => {
              isEdit ? setShowEditModal(false) : setShowCreateModal(false);
              setShowSlotModal(false);
            }}
          >
            Hủy
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={isEdit ? handleUpdate : handleCreate}
            disabled={modalLoading}
          >
            {modalLoading ? '⏳ Đang lưu...' : (isEdit ? 'Xác nhận' : 'Lưu thông tin')}
          </ActionButton>
        </ModalActions>
        {showSlotModal && (
          <ModalOverlay>
            <ModalContent style={{ maxWidth: '1000px', width: '95%' }}>
              <ModalHeader>
                <ModalTitle>Cấu hình tiết học</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        background: slotSelectionMode === 'fixed' ? '#000' : '#f1f5f9',
                        color: slotSelectionMode === 'fixed' ? '#fff' : '#64748b',
                        border: '1px solid #e2e8f0'
                      }}
                      onClick={() => setSlotSelectionMode('fixed')}
                    >
                      Tiết cố định ({slotModalData.fixed_slot.length})
                    </div>
                    <div
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        background: slotSelectionMode === 'avoid' ? '#f59e0b' : '#f1f5f9',
                        color: slotSelectionMode === 'avoid' ? '#fff' : '#64748b',
                        border: '1px solid #e2e8f0'
                      }}
                      onClick={() => setSlotSelectionMode('avoid')}
                    >
                      Tiết cần tránh ({slotModalData.avoid_slot.length})
                    </div>
                  </div>
                </div>
                <SubjectSlotTable
                  config={{
                    monday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Monday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Monday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    tuesday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Tuesday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Tuesday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    wednesday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Wednesday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Wednesday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    thursday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Thursday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Thursday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    friday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Friday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Friday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    saturday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Saturday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Saturday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    sunday: [
                      ...slotModalData.fixed_slot.filter(s => s.day_of_week === 'Sunday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...slotModalData.avoid_slot.filter(s => s.day_of_week === 'Sunday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ]
                  }}
                  timeSlots={timeSlots}
                  isEditing={true}
                  onToggleSlot={handleSlotToggle}
                  slotSelectionMode={slotSelectionMode}
                />
              </ModalBody>
              <ModalActions>
                <ActionButton onClick={() => setShowSlotModal(false)}>
                  Hủy
                </ActionButton>
                <ActionButton variant="primary" onClick={handleSlotModalSave}>
                  Xác nhận
                </ActionButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </ModalContent>
    </ModalOverlay>
  );


  const DetailModal = ({ subject }) => (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Chi tiết môn học</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <DetailItem>
            <span className="label">Mã môn học:</span>
            <span className="value">{subject.subject_code}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Tên môn học:</span>
            <span className="value">{subject.subject_name}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Khối học:</span>
            <span className="value">{subject.grade_level || 'N/A'}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Số tiết/tuần:</span>
            <span className="value">{subject.weekly_slot}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Số tiết liên tiếp:</span>
            <span className="value">{subject.continuous_slot}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Giới hạn:</span>
            <span className="value">{subject.limit || 'Không giới hạn'}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Tiết cố định/Tránh:</span>
            <span className="value">
              <SlotConfigButton onClick={() => setShowDetailSlotModal(true)}>
                {subject.fixed_slot.length} cố định / {subject.avoid_slot.length} tránh
              </SlotConfigButton>
            </span>
          </DetailItem>
          <DetailItem>
            <span className="label">Trạng thái:</span>
            <span className="value">
              <StatusBadge status={subject.status}>{subject.status}</StatusBadge>
            </span>
          </DetailItem>
        </ModalBody>
        <ModalActions>
          <ActionButton onClick={() => {
            setShowDetailModal(false);
            setShowDetailSlotModal(false);
          }}>Đóng</ActionButton>
        </ModalActions>
        {showDetailSlotModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Chi tiết tiết học</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <SubjectSlotTable
                  config={{
                    monday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Monday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Monday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    tuesday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Tuesday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Tuesday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    wednesday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Wednesday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Wednesday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    thursday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Thursday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Thursday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    friday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Friday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Friday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    saturday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Saturday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Saturday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ],
                    sunday: [
                      ...subject.fixed_slot.filter(s => s.day_of_week === 'Sunday').map(s => ({ id: s.time_slot_id, type: 'fixed' })),
                      ...subject.avoid_slot.filter(s => s.day_of_week === 'Sunday').map(s => ({ id: s.time_slot_id, type: 'avoid' }))
                    ]
                  }}
                  timeSlots={timeSlots}
                  isEditing={false}
                />
              </ModalBody>
              <ModalActions>
                <ActionButton onClick={() => setShowDetailSlotModal(false)}>
                  Đóng
                </ActionButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </ModalContent>
    </ModalOverlay>
  );

  return (
    <Container>
      <Header>
        <Title>📚 Quản lí môn học</Title>
        <AddButton onClick={() => {
          resetForm();
          setShowCreateModal(true);
        }}>
          + Tạo môn học
        </AddButton>
      </Header>
      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo mã môn, tên môn, khối..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <Select
          value={gradeFilter}
          onChange={(e) => handleFilterChange('grade', e.target.value)}
        >
          <option value="">Tất cả khối</option>
          {gradeLevels.map(grade => (
            <option key={grade.code_id} value={grade.code_id}>
              {grade.caption}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Ngưng hoạt động">Ngưng hoạt động</option>
        </Select>
      </FilterSection>
      <TableContainer>
        {loading ? (
          <LoadingSpinner>
            🔄 Đang tải dữ liệu...
          </LoadingSpinner>
        ) : subjects.length === 0 ? (
          <EmptyState>
            <div className="icon">📚</div>
            <div>Không tìm thấy môn học nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '10%' }}>Mã môn</TableHeaderCell>
                  <TableHeaderCell style={{ width: '20%' }}>Tên môn</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Khối</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Tiết/tuần</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Tiết liên tiếp</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Giới hạn</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {subjects.map((subject) => (
                  <TableRow key={subject.subject_code}>
                    <TableCell>{subject.subject_code}</TableCell>
                    <TableCell>{subject.subject_name}</TableCell>
                    <TableCell>{subject.grade_level}</TableCell>
                    <TableCell>{subject.weekly_slot}</TableCell>
                    <TableCell>{subject.continuous_slot}</TableCell>
                    <TableCell>{subject.limit || 'Không giới hạn'}</TableCell>
                    <TableCell>
                      <StatusBadge status={subject.status}>
                        {subject.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(subject.subject_code)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === subject.subject_code}>
                        <ActionMenuItem onClick={() => handleViewDetails(subject)}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleEdit(subject)}>
                          <ActionMenuText>Cập nhật</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => {
                            handleDelete(subject.subject_code);
                            setOpenActionMenu(null);
                          }}
                          style={{ color: '#e74c3c' }}
                        >
                          <ActionMenuText style={{ color: '#e74c3c' }}>Bật/Tắt trạng thái</ActionMenuText>
                        </ActionMenuItem>
                      </ActionDropdown>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationButton
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationButton>
                ))}
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
      {showCreateModal && <SubjectModal />}
      {showEditModal && <SubjectModal isEdit />}
      {showDetailModal && <DetailModal subject={selectedSubject} />}
    </Container>
  );
}

export default SubjectManagement;