import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchClassDetail,
  fetchClassSubjects,
  fetchClassScheduleConfig,
  fetchTimeSlots,
  fetchClasses,
  addClassScheduleConfigSame,
  addClassSubjectSame,
  fetchAvailableTeachers,
  fetchAvailableRooms,
  fetchAllTeachers,
  updateClassTeacher,
  updateClassRoom,
  addClassScheduleConfig,
  fetchSubjectsByGrade,
  fetchSubjectsConfigByClass,
  addClassSubject
} from '../../api';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
  gap: 24px;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
  }
  
  &::before {
    content: "←";
    font-size: 16px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 30%;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
`;

const ModalButton = styled.button`
  padding: 10px 20px;
 margin: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
`;

const BothButton = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ConfirmButton = styled(ModalButton)`
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
`;

const CancelButton = styled(ModalButton)`
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 8px; /* thêm padding để tránh che mất scrollbar */
`;


const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
  flex: 1;
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 60px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  margin-bottom: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #495057;
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
`;

const UpdateIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #007bff;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #0056b3;
    transform: scale(1.2);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case 'Đang hoạt động':
        return '#d4edda';
      case 'Tạm khóa':
        return '#fff3cd';
      default:
        return '#f8d7da';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'Đang hoạt động':
        return '#155724';
      case 'Tạm khóa':
        return '#856404';
      default:
        return '#721c24';
    }
  }};
`;

const SubjectsSection = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  margin-bottom: 32px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 14px;
`;

const TableHeader = styled.th`
  background: white;
  padding: 16px 12px;
  text-align: center;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  
  &:first-child {
    border-top-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
  }
`;

const TableHeader2 = styled.th`
  background: white;
  padding: 16px 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  
  &:first-child {
    border-top-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
  }
`;

const TableRow = styled.tr``;

const TableCell = styled.td`
  padding: 16px 12px;
  vertical-align: middle;
  text-align: center;
  border: 1px solid #ddd;
  font-size: 13px;
  white-space: nowrap;
`;

const TableCell2 = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
  
  &:first-child {
    font-weight: 500;
    color: #2c3e50;
  }
`;

const NoSubjects = styled.div`
  text-align: center;
  padding: 60px 40px;
  color: #6c757d;
  font-style: italic;
  font-size: 16px;
  
  &::before {
    content: "📚";
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 40px;
  font-size: 18px;
  color: #6c757d;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 20px 0;
  
  &::before {
    content: "⏳";
    display: block;
    font-size: 32px;
    margin-bottom: 16px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 2px solid #dc3545;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: "⚠️";
    font-size: 20px;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 2px solid #28a745;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: "✅";
    font-size: 20px;
  }
`;

const Select = styled.select`
  padding: 14px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #007bff;
  }
  
  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 15px;
  margin-bottom: 4px;
`;

const CopyButton = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  margin-right: 5px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }

`;

const UpdateButton = styled.button`
  background: #6B7280;
  color: white;
  border: none;
  padding: 12px 20px;
  margin-right: 5px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }

`;

const SaveButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelEditButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 20px;
  margin-right: 5px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  }
`;

const DeleteButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(231, 76, 60, 0.4);
  }
`;

const AddButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3);
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? '0 2px 4px rgba(39, 174, 96, 0.3)' : '0 3px 8px rgba(39, 174, 96, 0.4)'};
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

function ClassDetail() {
  const { classCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState('');
  const [errorSchedule, setErrorSchedule] = useState('');
  const [success, setSuccess] = useState('');
  const [classes, setClasses] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editedScheduleConfig, setEditedScheduleConfig] = useState(null);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [editedSubjects, setEditedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);
  const [slotModalData, setSlotModalData] = useState({ fixed_slot: [], avoid_slot: [] });
  const [slotSelectionMode, setSlotSelectionMode] = useState('fixed');
  const [originalSubjects, setOriginalSubjects] = useState([]);
  const [showAddNewRow, setShowAddNewRow] = useState(false);

  useEffect(() => {
    loadClassData();
  }, [classCode]);

  const fetchClassesData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const data = await fetchClasses(token, {
        filter: {
          status: 'Đang hoạt động'
        }
      });
      setClasses(data.data_set || []);
    } catch (err) {
      toast.error('Không thể tải danh sách lớp: ' + err.message);
    }
  };

  const loadClassData = async () => {
    setLoading(true);
    setError('');
    setLoadingSchedule(true);
    setErrorSchedule('');
    try {
      const token = localStorage.getItem('authToken');
      const [detailResult, subjectsResult, scheduleResult, timeSlotResult] = await Promise.all([
        fetchClassDetail(token, classCode),
        fetchClassSubjects(token, classCode).catch(() => []),
        fetchClassScheduleConfig(token, classCode).catch(() => null),
        fetchTimeSlots(token)
      ]);
      setClassDetail(detailResult);


      const subjectsArray = Array.isArray(subjectsResult) ? subjectsResult :
        (subjectsResult && subjectsResult.data_set) ? subjectsResult.data_set :
          (subjectsResult && subjectsResult.data) ? subjectsResult.data : [];

      const subjectsWithIds = subjectsArray.map(subject => ({
        ...subject,
        id: subject.id || `existing_${subject.subject_code}_${Date.now()}`
      }));
      setClassSubjects(subjectsWithIds);
      setScheduleConfig(scheduleResult);
      setTimeSlots(timeSlotResult || []);
      setSelectedTeacher(detailResult.teacher_user_name || '');
      setSelectedRoom(detailResult.room_code || '');

      const initialConfig = scheduleResult || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };
      fetchClassesData();
      setEditedScheduleConfig(initialConfig);
    } catch (err) {
      setError('Không thể tải thông tin lớp học: ' + err.message);
      toast.error('Không thể tải thông tin lớp học: ' + err.message);
    } finally {
      setLoading(false);
      setLoadingSchedule(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      let teachers = await fetchAvailableTeachers(token);
      if (teachers.length === 0) {

        teachers = await fetchAllTeachers(token, { limit: 100 });
      }
      setAvailableTeachers(teachers);
    } catch (err) {
      setError('Không thể tải danh sách giáo viên: ' + err.message);
      toast.error('Không thể tải danh sách giáo viên: ' + err.message);
    }
  };

  const loadRooms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const rooms = await fetchAvailableRooms(token);

      setAvailableRooms(rooms);
    } catch (err) {
      setError('Không thể tải danh sách phòng học: ' + err.message);
      toast.error('Không thể tải danh sách phòng học: ' + err.message);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!selectedTeacher) {
      setError('Vui lòng chọn giáo viên chủ nhiệm');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const result = await updateClassTeacher(token, classCode, selectedTeacher);

      if (result.success) {
        const updatedClassData = await fetchClassDetail(token, classCode);
        setClassDetail(updatedClassData);
        setShowTeacherModal(false);
        toast.success(result.description);
      } else {
        throw new Error(result.description || 'Cập nhật thất bại');
      }
    } catch (err) {

      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) {
      setError('Vui lòng chọn phòng học');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const result = await updateClassRoom(token, classCode, selectedRoom);

      if (result.success) {
        const updatedClassData = await fetchClassDetail(token, classCode);
        setClassDetail(updatedClassData);
        toast.success(result.description);
        setShowRoomModal(false);
      } else {
        throw new Error(result.description || 'Cập nhật thất bại');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopySchedule = async () => {
    if (selectedClasses.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp để áp dụng');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await addClassScheduleConfigSame(token, {
        class_code: classCode,
        target_class_code: selectedClasses
      });
      if (response.success) {
        toast.success(response.description);
        setShowScheduleModal(false);
        setSelectedClasses([]);
        loadClassData();
      }
      else {
        toast.error(response.description);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCopySubjects = async () => {
    if (selectedClasses.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp để áp dụng');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await addClassSubjectSame(token, {
        class_code: classCode,
        target_class_code: selectedClasses
      });
      if (response.success) {
        toast.success(response.description);
        setShowSubjectsModal(false);
        setSelectedClasses([]);
        loadClassData();
      }
      else {
        toast.error(response.description);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBack = () => {
    navigate('/staff/class');
  };

  const toggleClassSelection = (classCode) => {
    setSelectedClasses(prev =>
      prev.includes(classCode)
        ? prev.filter(code => code !== classCode)
        : [...prev, classCode]
    );
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  const openTeacherModal = () => {
    setShowTeacherModal(true);
    loadTeachers();
  };

  const openRoomModal = () => {
    setShowRoomModal(true);
    loadRooms();
  };

  const handleEditSchedule = () => {
    setIsEditingSchedule(true);

    const initialConfig = scheduleConfig || {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };
    setEditedScheduleConfig(initialConfig);
  };

  const handleSaveSchedule = async () => {
    if (!editedScheduleConfig) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');


      const payload = { class_code: classCode };
      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      for (const day of dayKeys) {
        const daySlots = editedScheduleConfig[day] || [];
        payload[day] = daySlots.filter(Boolean).join('|');
      }


      const response = await addClassScheduleConfig(token, payload);

      toast.success(response.description || 'Lưu cấu hình lịch thành công!');
      setIsEditingSchedule(false);
      setEditedScheduleConfig(null);
      loadClassData();
    } catch (err) {

      setError('Lỗi khi lưu cấu hình lịch: ' + err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingSchedule(false);
    setEditedScheduleConfig(null);
  };

  const handleToggleSlot = (dayKey, slotId) => {
    if (!isEditingSchedule || !editedScheduleConfig) return;

    setEditedScheduleConfig(prev => {
      const newConfig = { ...prev };
      const daySlots = newConfig[dayKey] || [];
      const slotStr = String(slotId);

      if (daySlots.includes(slotStr)) {

        newConfig[dayKey] = daySlots.filter(s => s !== slotStr);
      } else {

        newConfig[dayKey] = [...daySlots, slotStr].sort((a, b) => parseInt(a) - parseInt(b));
      }

      return newConfig;
    });
  };



  const handleEditSubjects = async () => {
    setIsEditingSubjects(true);
    setOriginalSubjects([...classSubjects]);
    // Nếu không có dữ liệu
    if (classSubjects.length === 0) {
      const newSubject = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        subject_code: '',
        subject_name: '',
        teacher_user_name: '',
        weekly_slot: 1,
        continuous_slot: 1,
        fixed_slot: [],
        avoid_slot: [],
        available_teacher: [],
        isTemporaryNew: true
      };
      setEditedSubjects([newSubject]);
      setShowAddNewRow(true);
    } else {
      setEditedSubjects([...classSubjects]);
      setShowAddNewRow(false);
    }

    loadAvailableSubjects();
    try {
      const token = localStorage.getItem('authToken');
      const updatedSubjects = await Promise.all(
        classSubjects.map(async (subject) => {
          if (subject.subject_code) {
            try {
              const subjectData = await fetchSubjectsConfigByClass(token, subject.subject_code, classCode);
              return {
                ...subject,
                available_teacher: subjectData.available_teacher || []
              };
            } catch (error) {
              console.error(`Error loading subject config for ${subject.subject_code}:`, error);
              return subject;
            }
          }
          return subject;
        })
      );
      if (classSubjects.length > 0) {
        setEditedSubjects(updatedSubjects);
      }
    } catch (error) {
      console.error('Error loading subject configs for edit mode:', error);
    }
  };

  const loadAvailableSubjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const gradeLevel = classCode.slice(0, 2);
      const subjects = await fetchSubjectsByGrade(token, gradeLevel);
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Error loading available subjects:', error);
      toast.error('Không thể tải danh sách môn học');
    }
  };

  const handleSubjectChange = async (index, subjectCode) => {
    if (!subjectCode) return;

    try {
      const token = localStorage.getItem('authToken');
      const subjectData = await fetchSubjectsConfigByClass(token, subjectCode, classCode);

      setEditedSubjects(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          subject_code: subjectCode,
          subject_name: subjectData.subject_name || '',
          weekly_slot: subjectData.weekly_slot || 1,
          continuous_slot: subjectData.continuous_slot || 1,
          fixed_slot: subjectData.fixed_slot || [],
          avoid_slot: subjectData.avoid_slot || [],
          available_teacher: subjectData.available_teacher || [],
          isTemporaryNew: false,
        };
        return updated;
      });
    } catch (error) {
      console.error('Error loading subject config:', error);
      toast.error('Không thể tải thông tin môn học');
    }
  };

  const handleChange = (index, field, value) => {
    setEditedSubjects(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveSubjects = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');


      const subjects = editedSubjects.map(subject => ({
        subject_code: subject.subject_code,
        teacher_user_name: subject.teacher_user_name,
        weekly_slot: subject.weekly_slot || 0,
        continuous_slot: subject.continuous_slot || 0,
        fixed_slot: subject.fixed_slot || [],
        avoid_slot: subject.avoid_slot || []
      }));


      const requestData = {
        class_code: classCode,
        force_assign: true,
        subjects: subjects
      };

      const response = await addClassSubject(token, requestData);


      setClassSubjects(editedSubjects);
      setIsEditingSubjects(false);
      setOriginalSubjects([]);
      setShowAddNewRow(false);
      if (response.success) {
        toast.success(response.description);
      } else {
        toast.error(response.description);
      }



      await loadClassData();
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditSubjects = () => {
    setIsEditingSubjects(false);
    setEditedSubjects([]);
    setOriginalSubjects([]);
    setShowAddNewRow(false);
  };

  const openSlotModal = (index) => {
    setSelectedSubjectIndex(index);
    const subject = isEditingSubjects ? editedSubjects[index] : classSubjects[index];
    setSlotModalData({
      fixed_slot: subject.fixed_slot || [],
      avoid_slot: subject.avoid_slot || []
    });
    setShowSlotModal(true);
  };

  const handleSlotModalSave = () => {
    if (selectedSubjectIndex !== null) {
      setEditedSubjects(prev => {
        const updated = [...prev];
        updated[selectedSubjectIndex] = {
          ...updated[selectedSubjectIndex],
          fixed_slot: slotModalData.fixed_slot,
          avoid_slot: slotModalData.avoid_slot
        };
        return updated;
      });
    }
    setShowSlotModal(false);
    setSelectedSubjectIndex(null);
  };

  const handleDeleteSubject = (subjectId) => {
    if (isEditingSubjects) {
      setEditedSubjects(prev => prev.filter(subject => subject.id !== subjectId));
    } else {
      setClassSubjects(prev => prev.filter(subject => subject.id !== subjectId));
    }

  };

  const handleAddNewSubject = () => {
    setShowAddNewRow(true);
    const newSubject = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject_code: '',
      subject_name: '',
      teacher_user_name: '',
      weekly_slot: 1,
      continuous_slot: 1,
      fixed_slot: [],
      avoid_slot: [],
      available_teacher: [],
      isTemporaryNew: true
    };

    if (isEditingSubjects) {
      setEditedSubjects(prev => [...prev, newSubject]);
    } else {
      setClassSubjects(prev => [...prev, newSubject]);
    }
  };




  const isOriginalSubject = (subjectCode) => {
    return originalSubjects.some(subject => subject.subject_code === subjectCode);
  };

  const hasEmptyNewRow = () => {
    const currentSubjects = isEditingSubjects ? editedSubjects : classSubjects;
    return currentSubjects.some(subject => subject.isTemporaryNew && !subject.subject_code);
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

  if (loading) {
    return (
      <Container>
        <Loading>Đang tải thông tin lớp học...</Loading>
      </Container>
    );
  }

  if (!classDetail) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>
            Quay lại
          </BackButton>
          <Title>Chi tiết lớp</Title>
        </Header>
        <ErrorMessage>Không tìm thấy thông tin lớp học</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          Quay lại
        </BackButton>
        <Title>Chi tiết lớp {classDetail.class_code}</Title>
      </Header>
      <InfoSection>
        <SectionTitle>Thông tin cơ bản</SectionTitle>
        <InfoGrid>
          <div>
            <InfoRow>
              <InfoLabel>Mã lớp:</InfoLabel>
              <InfoValue>{classDetail.class_code}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Khối:</InfoLabel>
              <InfoValue>{classDetail.grade_level || classDetail.grade || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>GVCN:</InfoLabel>
              <InfoValue>
                {!classDetail.teacher_full_name && classDetail.teacher_full_name !== 'Default'
                  ? `${classDetail.teacher_full_name} (${classDetail.teacher_user_name})`
                  : 'Chưa có GVCN'}
                <UpdateIcon onClick={openTeacherModal} title="Cập nhật giáo viên">✏️</UpdateIcon>
              </InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Trạng thái:</InfoLabel>
              <InfoValue>
                <StatusBadge status={classDetail.status}>
                  {classDetail.status || 'N/A'}
                </StatusBadge>
              </InfoValue>
            </InfoRow>
          </div>
          <div>
            <InfoRow>
              <InfoLabel>Mã phòng học:</InfoLabel>
              <InfoValue>
                {(!classDetail.room_code || classDetail.room_code === "NONE") ? 'Chưa xếp phòng' : classDetail.room_code}
                <UpdateIcon onClick={openRoomModal} title="Cập nhật phòng học">✏️</UpdateIcon>
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Tên phòng:</InfoLabel>
              <InfoValue>{classDetail.room_name || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Loại phòng:</InfoLabel>
              <InfoValue>{classDetail.room_type_name || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Ngày tạo:</InfoLabel>
              <InfoValue>{formatDateTime(classDetail.created_date)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Ngày cập nhật:</InfoLabel>
              <InfoValue>{formatDateTime(classDetail.updated_date)}</InfoValue>
            </InfoRow>
          </div>
        </InfoGrid>
      </InfoSection>

      <SubjectsSection>
        <SectionTitle>
          <span>Cấu hình thời khóa biểu</span>
          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            <CopyButton onClick={() => setShowScheduleModal(true)}>
              Đồng bộ với lớp khác
            </CopyButton>
            {!isEditingSchedule ? (
              <UpdateButton onClick={handleEditSchedule}>
                Chỉnh sửa
              </UpdateButton>
            ) : (
              <>
                <CancelEditButton onClick={handleCancelEdit} disabled={saving}>
                  Hủy
                </CancelEditButton>
                <SaveButton onClick={handleSaveSchedule} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </SaveButton>
              </>
            )}
          </div>
        </SectionTitle>
        {loadingSchedule ? (
          <Loading>Đang tải lịch...</Loading>
        ) : errorSchedule ? (
          <ErrorMessage>{errorSchedule}</ErrorMessage>
        ) : timeSlots.length > 0 ? (
          <ScheduleConfigTable
            config={isEditingSchedule ? editedScheduleConfig : scheduleConfig}
            timeSlots={timeSlots}
            isEditing={isEditingSchedule}
            onToggleSlot={handleToggleSlot}
          />
        ) : (
          <NoSubjects>Không có dữ liệu.</NoSubjects>
        )}
      </SubjectsSection>


      <SubjectsSection>
        <SectionTitle>
          <span>Danh sách môn học ({classSubjects.length} môn)</span>
          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            <CopyButton onClick={() => setShowSubjectsModal(true)}>
              Đồng bộ với lớp khác
            </CopyButton>
            {!isEditingSubjects ? (
              <UpdateButton onClick={handleEditSubjects}>
                Chỉnh sửa
              </UpdateButton>
            ) : (
              <AddButton
                onClick={handleAddNewSubject}
                disabled={hasEmptyNewRow()}
              >
                + Thêm mới
              </AddButton>
            )}
          </div>
        </SectionTitle>
        {(isEditingSubjects ? editedSubjects : classSubjects).length > 0 ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader2 style={{ width: '15%' }}>Mã môn</TableHeader2>
                  <TableHeader2 style={{ width: '25%' }}>Tên môn</TableHeader2>
                  <TableHeader2 style={{ width: '20%' }}>Giáo viên</TableHeader2>
                  <TableHeader2 style={{ width: '10%' }}>Tiết/tuần</TableHeader2>
                  <TableHeader2 style={{ width: '10%' }}>Tiết liên tiếp tối đa</TableHeader2>
                  <TableHeader2 style={{ width: '10%' }}>Cố định/Tránh</TableHeader2>
                  <TableHeader2 style={{ width: '10%' }}>Hành động</TableHeader2>
                </tr>
              </thead>
              <tbody>
                {(isEditingSubjects ? editedSubjects : classSubjects).map((subject, index) => (
                  <TableRow key={subject.id || subject.subject_code || index}>
                    <TableCell2>
                      {isEditingSubjects && subject.isTemporaryNew ? (
                        <Select
                          value={subject.subject_code || ''}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
                        >
                          <option value="">Chọn môn học</option>
                          {availableSubjects.map((subj) => (
                            <option key={subj.subject_code} value={subj.subject_code}>
                              {subj.subject_code}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        subject.subject_code
                      )}
                    </TableCell2>
                    <TableCell2>{subject.subject_name || '-'}</TableCell2>
                    <TableCell2>
                      {isEditingSubjects ? (
                        <Select
                          value={subject.teacher_user_name || ''}
                          onChange={(e) => handleChange(index, 'teacher_user_name', e.target.value)}
                          onFocus={async () => {
                            if (isOriginalSubject(subject.subject_code) && subject.subject_code) {
                              try {
                                const token = localStorage.getItem('authToken');
                                const subjectData = await fetchSubjectsConfigByClass(token, subject.subject_code, classCode);
                                setEditedSubjects(prev => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    available_teacher: subjectData.available_teacher || [],
                                  };
                                  return updated;
                                });
                              } catch (error) {
                                console.error('Error loading subject config for teacher dropdown:', error);
                              }
                            }
                          }}
                          style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
                        >
                          <option value="">Chọn giáo viên</option>
                          {subject.available_teacher && subject.available_teacher.length > 0 ? (
                            subject.available_teacher.map((teacher) => (
                              <option key={teacher.user_name} value={teacher.user_name}>
                                {teacher.full_name} ({teacher.user_name})
                                {teacher.is_home_room_teacher ? ' Chủ nhiệm lớp' : ''}
                              </option>
                            ))
                          ) : (
                            <option disabled>Không có gv khả dụng</option>
                          )}

                        </Select>
                      ) : (
                        <span>
                          {(!subject.teacher_user_name || subject.teacher_user_name === 'Default')
                            ? 'Chưa phân công'
                            : ` ${subject.teacher_full_name} (${subject.teacher_user_name})`}

                        </span>
                      )}
                    </TableCell2>
                    <TableCell2>
                      {isEditingSubjects ? (
                        <input
                          type="number"
                          min="1"
                          value={subject.weekly_slot || 1}
                          onChange={(e) => handleChange(index, 'weekly_slot', parseInt(e.target.value) || 1)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      ) : (
                        subject.weekly_slot || 0
                      )}
                    </TableCell2>
                    <TableCell2>
                      {isEditingSubjects ? (
                        <input
                          type="number"
                          min="1"
                          value={subject.continuous_slot || 1}
                          onChange={(e) => handleChange(index, 'continuous_slot', parseInt(e.target.value) || 1)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      ) : (
                        subject.continuous_slot || 0
                      )}
                    </TableCell2>
                    <TableCell2>
                      <CopyButton
                        onClick={() => openSlotModal(index)}
                        style={{
                          fontSize: '14px',
                          padding: '4px 10px',
                          background: '#6c757d'
                        }}
                      >
                        {subject.fixed_slot?.length || 0} - {subject.avoid_slot?.length || 0} tiết
                      </CopyButton>
                    </TableCell2>
                    <TableCell2>
                      {isEditingSubjects && (
                        <DeleteButton onClick={() => handleDeleteSubject(subject.id || index)}>
                          Xóa
                        </DeleteButton>
                      )}
                    </TableCell2>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            {isEditingSubjects && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '10px' }}>
                <CancelEditButton onClick={handleCancelEditSubjects} disabled={saving}>
                  Hủy
                </CancelEditButton>
                <SaveButton onClick={handleSaveSubjects} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </SaveButton>
              </div>
            )}
          </TableContainer>
        ) : (
          <NoSubjects>
            <p>Lớp học chưa có môn học nào được phân công.</p>
            {isEditingSubjects && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '10px' }}>
                <CancelEditButton onClick={handleCancelEditSubjects} disabled={saving}>
                  Hủy
                </CancelEditButton>
                <SaveButton onClick={handleSaveSubjects} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </SaveButton>
              </div>
            )}
          </NoSubjects>
        )}
      </SubjectsSection>


      {showScheduleModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Chọn các lớp muốn đồng bộ</ModalTitle>
            <CheckboxGrid>
              {classes
                .filter(cls => cls.class_code !== classCode)
                .sort((a, b) => a.class_code.localeCompare(b.class_code))
                .map(cls => (
                  <CheckboxContainer key={cls.class_code}>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.class_code)}
                        onChange={() => toggleClassSelection(cls.class_code)}
                      />
                      {cls.class_code}
                    </CheckboxLabel>
                  </CheckboxContainer>
                ))}
            </CheckboxGrid>
            <BothButton>
              <CancelEditButton onClick={() => setShowScheduleModal(false)}>Hủy</CancelEditButton>
              <SaveButton onClick={handleCopySchedule}>Xác nhận</SaveButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {showSubjectsModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Chọn các lớp muốn đồng bộ</ModalTitle>
            <CheckboxGrid>
              {classes
                .filter(cls => cls.class_code !== classCode && cls.grade_level_id === classDetail?.grade_level_id)
                .sort((a, b) => a.class_code.localeCompare(b.class_code))
                .map(cls => (
                  <CheckboxContainer key={cls.class_code}>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.class_code)}
                        onChange={() => toggleClassSelection(cls.class_code)}
                      />
                      {cls.class_code}
                    </CheckboxLabel>
                  </CheckboxContainer>
                ))}
            </CheckboxGrid>
            <BothButton>
              <CancelEditButton onClick={() => setShowSubjectsModal(false)}>Hủy</CancelEditButton>
              <SaveButton onClick={handleCopySubjects}>Xác nhận</SaveButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {showTeacherModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Chọn giáo viên chủ nhiệm:</ModalTitle>
            <FormGroup>
              <Select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={saving}
              >
                <option value="">-- Chọn giáo viên --</option>
                {availableTeachers.length > 0 ? (
                  availableTeachers.map((teacher) => (
                    <option key={teacher.user_name} value={teacher.user_name}>
                      {teacher.full_name} ({teacher.user_name})
                      {teacher.class_code && ` - Đang dạy: ${teacher.class_code}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có giáo viên nào</option>
                )}
              </Select>
              {availableTeachers.length === 0 && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Không có giáo viên available. Vui lòng liên hệ admin để thêm giáo viên.
                </div>
              )}
            </FormGroup>
            <BothButton>
              <CancelEditButton onClick={() => setShowTeacherModal(false)}>Hủy</CancelEditButton>
              <SaveButton
                onClick={handleUpdateTeacher}
                disabled={saving || !selectedTeacher || selectedTeacher === classDetail.teacher_user_name}
              >
                {saving ? 'Đang cập nhật...' : 'Xác nhận'}
              </SaveButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {showRoomModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Chọn phòng học:</ModalTitle>
            <FormGroup>
              <Select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={saving}
              >
                <option value="">-- Chọn phòng học --</option>
                {availableRooms.length > 0 ? (
                  availableRooms.map((room) => (
                    <option key={room.room_code} value={room.room_code}>
                      {room.room_name} ({room.room_code})

                    </option>
                  ))
                ) : (
                  <option disabled>Không có phòng học nào</option>
                )}
              </Select>
              {availableRooms.length === 0 && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Không có phòng học available. Vui lòng liên hệ admin để thêm phòng học.
                </div>
              )}
            </FormGroup>
            <BothButton>
              <CancelEditButton onClick={() => setShowRoomModal(false)}>Hủy</CancelEditButton>
              <SaveButton
                onClick={handleUpdateRoom}
                disabled={saving || !selectedRoom || selectedRoom === classDetail.room_code}
              >
                {saving ? 'Đang cập nhật...' : 'Xác nhận'}
              </SaveButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {/* Slot Configuration Modal */}
      {showSlotModal && (
        <Modal>
          <ModalContent style={{ maxWidth: '1000px', width: '95%' }}>
            <ModalHeader>
              <ModalTitle>
                Cấu hình tiết học - {selectedSubjectIndex !== null &&
                  (isEditingSubjects ? editedSubjects[selectedSubjectIndex]?.subject_name :
                    classSubjects[selectedSubjectIndex]?.subject_name)}
              </ModalTitle>
              <CloseButton onClick={() => setShowSlotModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

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
              isEditing={isEditingSubjects}
              onToggleSlot={handleSlotToggle}
              slotSelectionMode={slotSelectionMode}
            />

            {isEditingSubjects && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <CancelEditButton onClick={() => setShowSlotModal(false)}>
                  Hủy
                </CancelEditButton>
                <SaveButton onClick={handleSlotModalSave}>
                  Xác nhận
                </SaveButton>
              </div>
            )}

          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

function ScheduleConfigTable({ config, timeSlots, isEditing, onToggleSlot }) {
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

  const isSlotSelected = (dayKey, slotId) => {
    const slotArr = Array.isArray(safeConfig[dayKey]) ? safeConfig[dayKey] : [];
    return slotArr.includes(slotId.toString());
  };

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <TableHeader>Tiết</TableHeader>
            {days.map(day => (
              <TableHeader key={day}>{day}</TableHeader>
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
                const isSelected = isSlotSelected(dayKey, slot.id);
                return (
                  <EditableTableCell
                    key={d}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    slotType={isSelected ? 'avoid' : null}
                    onClick={() => isEditing && onToggleSlot(dayKey, slot.id)}
                  >
                    {isSelected ? 'Tránh' : 'Trống'}
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
            <TableHeader>Tiết</TableHeader>
            {days.map(day => (
              <TableHeader key={day}>{day}</TableHeader>
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

export default ClassDetail;