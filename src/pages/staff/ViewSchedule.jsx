import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
import ReactSelect from 'react-select';
import '../../styles/date.css'
import {
    FaPlus, FaTrash, FaEdit, FaSpinner, FaCalendarAlt, FaArrowLeft,
    FaArrowRight, FaTimes, FaCheck, FaEllipsisH, FaEye, FaSort,
    FaSortUp, FaSortDown, FaFilter,
    FaChevronUp, FaChevronDown
} from 'react-icons/fa';
import {
    fetchBaseSchedules,
    fetchScheduleDetails,
    fetchTimeSlots,
    generateSchedule,
    fetchClasses,
    fetchAvailableTeachers2,
    fetchTimeTable,
    fetchMyTimeTable,
    fetchClassSubjects,
    deleteBaseSchedule,
    updateBaseSchedule,
    addSchedule,
    removeTimeTable,
    fetchSemesters,
    addSemester,
    removeSemester,
    getDatesInUse,
    fetchScheduleConfig,
    updateScheduleConfig,
    moveSchedule,
    moveScheduleDetail,
    markAsAbsent,
    markAsAttendance,
    markAsLate,
    markAsHoliday,
    getAvailabelTeacherToChange,
    getAvailabelTeacherToChange2,
    getAvailabelRoomToChange,
    changeTeacher,
    changeRoom,
    addScheduleBySlot,
    removeScheduleBySlot
} from '../../api';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { result } from 'lodash';

const Spinner = styled.div`
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DropdownButton = styled.button`
  background: #4f46e5;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease;

  &:hover {
    background: #4338ca;
  }
`;

const DropdownMenu = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  min-width: 140px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-in;
  pointer-events: auto;
  user-select: none;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }

  ${({ danger }) => danger && `
    color: #dc2626;
    &:hover {
      background: #fef2f2;
    }
  `}
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const DialogError = styled.p`
  color: #dc2626;
  font-size: 13px;
  margin-top: 8px;
  margin-bottom: 0;
  font-weight: 500;
`;

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 32px;
  background: #f9fafb;
  min-height: 100vh;
`;

const Heading = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoMessage = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 20px;
  font-weight: 500;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 3fr;
  }
`;

const TemplateListWrapper = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-width: 100%;
`;

const SubHeading = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  margin-top: 0px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
`;

const FormGroup1 = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  width: 100%;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button`
  background: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ButtonAdd = styled(Button)`
  background: #10B981;
  color: white;
  &:hover{
     background: #0ea170;
  }
`;

const ButtonSave = styled(Button)`
  background: #3b82f6;
  color: white;
`;

const ButtonDelete = styled(Button)`
  background: #e74c3c;
  &:hover {
    background: #dc2626;
  }
`;

const ButtonUpdate = styled(Button)`
  background: #6B7280;
  &:hover {
    background: #6B7280;
  }
`;

const NavButton = styled(Button)`
  padding: 10px 14px;
  font-size: 16px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
  margin-right: 16px;
  margin-top: 12px;
  font-weight: 500;
`;

const Checkbox = styled.input`
  margin-right: 8px;
  width: 16px;
  height: 16px;
`;

const Dialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 90%;
  max-width: 600px;
  border: 1px solid #e5e7eb;
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DialogButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const CancelButton = styled(Button)`
  background: #e74c3c;
  color: white;
  &:hover {
    background: #d1d5db;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 80vh;
  max-width: 600px;
  overflow-y: auto;
  min-width: 320px;
  border: 1px solid #e5e7eb;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
`;

const ModalContent = styled.div`
`;

const ModalEntry = styled.div`
  border-bottom: 1px solid #e5e7eb;
  &:last-child {
    border-bottom: none;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #374151;
    margin-bottom: 10px;
    word-wrap: break-word;
    white-space: normal;
    line-height: 1.5;
  }
`;

const TeacherEditIcon = styled.span`
  cursor: pointer;
  margin-left: 8px;
  color: #3b82f6;
  font-size: 16px;
  transition: color 0.2s ease;

  &:hover {
    color: #1d4ed8;
  }
`;

const TeacherDropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TeacherDropdown = styled.select`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const TeacherDisplay = styled.span`
  cursor: pointer;
  color: #3b82f6;
  text-decoration: underline;
  
  &:hover {
    color: #1d4ed8;
  }
`;

const RoomEditIcon = styled.span`
  cursor: pointer;
  margin-left: 8px;
  color: #3b82f6;
  font-size: 16px;
  transition: color 0.2s ease;

  &:hover {
    color: #1d4ed8;
  }
`;

const RoomDropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const RoomDropdown = styled.select`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const RoomDisplay = styled.span`
  cursor: pointer;
  color: #3b82f6;
  text-decoration: underline;
  
  &:hover {
    color: #1d4ed8;
  }
`;

const CloseButton = styled(Button)`
  background: #ef4444;
  &:hover {
    background: #dc2626;
  }
`;

const TemplateList = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
  
  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const TemplateItem = styled.li.withConfig({
    shouldForwardProp: (prop) => !['isOnUse', 'isSelected'].includes(prop)
})`
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  background: ${props => props.isSelected ? '#d1fae5' : 'white'};

`;

const TimetableWrapper = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  max-width: 100%;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
`;


const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  border: 1px solid #e5e7eb;
  padding: 12px;
  background: #f8f9fa;
  color: #2c3e50;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  border: 1px solid #e5e7eb;
  padding: 12px;
  vertical-align: top;
`;

const Entry = styled.div`
  margin-bottom: 5px;
  border-bottom: 1px solid #e5e7eb;
  padding:5px;
  border-radius: 5px;
  transition: background 0.2s ease;

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
  p {
    margin: 0;
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
  }
  &:hover {
    background: #eff6ff;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) => {
        switch (props.status) {
            case 'Chưa diễn ra': return '#E5E7EB';
            case 'Sắp diễn ra': return '#DBEAFE';
            case 'Đang học': return '#D1FAE5';
            case 'Vắng mặt': return '#FEE2E2';
            case 'Hoàn thành': return '#DBEAFE';
            case 'Trễ': return '#FEF3C7';
            case 'Đã xin nghỉ': return '#EDE9FE';
            case 'Đã bị huỷ': return '#E5E7EB';
            case 'Ngày lễ': return '#D1FAE5';
            case 'Nghỉ lễ': return '#D1FAE5';
            case 'Ngày thường': return '#D1FAE5';
            default: return '#F3F4F6';
        }
    }};
  color: ${(props) => {
        switch (props.status) {
            case 'Chưa diễn ra': return '#6B7280';
            case 'Sắp diễn ra': return '#3B82F6';
            case 'Đang học': return '#10B981';
            case 'Vắng mặt': return '#EF4444';
            case 'Hoàn thành': return '#2563EB';
            case 'Trễ': return '#D97706';
            case 'Đã xin nghỉ': return '#7C3AED';
            case 'Đã bị huỷ': return '#374151';
            case 'Ngày lễ': return '#10B981';
            case 'Nghỉ lễ': return '#10B981';
            case 'Ngày thường': return '#10B981';
            default: return '#4B5563';
        }
    }};
`;



const LoadingMessage = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PeriodText = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 12px;
  font-weight: 500;
`;

const EyeIcon = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  margin-left: 8px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #3b82f6;
    background: #f3f4f6;
  }
`;

const AttendanceModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1001;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

const AttendanceModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const AttendanceInfo = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
  >div{
    flex: 1;
    max-width: 50%;
  }
`;

const AttendanceImage = styled.img`
  max-width: 100%;
  justify-content: center;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
  border: 1px solid #e5e7eb;
`;

const PlaceholderText = styled.p`
  color: #6b7280;
  font-style: italic;
  margin: 8px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  text-align: center;
`;

const AttendanceButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
`;

const AttendanceButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  
  &.late {
    background: #fff3cd;
    color: #856404;
    
    &:hover {
      background: #fde68a;
    }
  }
  
  &.absent {
    background: #f8d7da;
    color: #721c24;
    
    &:hover {
      background: #fecaca;
    }
  }
  
  &.attendance {
    background: #d4edda;
    color: #155724;
    
    &:hover {
      background: #a7f3d0;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
`;

const FilterSortContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SortButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
  }

  &:active {
    background: #d1d5db;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const formatTime = (timeStr) => {
    if (!timeStr) return '';

    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        const [h, m] = timeStr.split(':');
        return `${h}:${m}`;
    }

    return timeStr; // fallback
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const SlotModal = ({ entries, onClose, viewMode, setAttendanceModalData, showToast, refreshData, token, setModalEntries }) => {
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
    const [isChangingTeacher, setIsChangingTeacher] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isChangingRoom, setIsChangingRoom] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleTeacherEdit = async (entry) => {
        if (entry.status !== 'Chưa diễn ra') {
            return;
        }

        setEditingTeacher(entry.id);
        setIsLoadingTeachers(true);

        try {
            const response = await getAvailabelTeacherToChange(token, entry.id);
            setAvailableTeachers(response.data_set || []);
        } catch (err) {
            showToast(`Lỗi khi tải danh sách giáo viên: ${err.message}`, 'error');
            setEditingTeacher(null);
        } finally {
            setIsLoadingTeachers(false);
        }
    };

    const handleTeacherChange = async (entry, newTeacherUserName) => {
        if (!newTeacherUserName || newTeacherUserName === entry.teacher_user_name) {
            setEditingTeacher(null);
            return;
        }

        setIsChangingTeacher(true);
        try {
            const response = await changeTeacher(token, entry.id, newTeacherUserName);
            if (response.success) {
                showToast('Đã thay đổi giáo viên thành công', 'success');
                setEditingTeacher(null);

                // Update the modal entries to reflect the new teacher
                if (setModalEntries && entries) {
                    const selectedTeacher = availableTeachers.find(t => t.user_name === newTeacherUserName);
                    setModalEntries(entries.map(modalEntry =>
                        modalEntry.id === entry.id
                            ? {
                                ...modalEntry,
                                teacher_user_name: newTeacherUserName,
                                teacher_name: selectedTeacher ? selectedTeacher.full_name : modalEntry.teacher_name
                            }
                            : modalEntry
                    ));
                }

                if (refreshData) {
                    refreshData();
                }
            } else {
                showToast(response.description || 'Thay đổi giáo viên thất bại', 'error');
            }
        } catch (err) {
            showToast(`Lỗi khi thay đổi giáo viên: ${err.message}`, 'error');
        } finally {
            setIsChangingTeacher(false);
        }
    };

    const handleRoomEdit = async (entry) => {
        if (entry.status !== 'Chưa diễn ra') {
            return;
        }

        setEditingRoom(entry.id);
        setIsLoadingRooms(true);

        try {
            const response = await getAvailabelRoomToChange(token, entry.id);
            setAvailableRooms(response.data_set || []);
        } catch (err) {
            showToast(`Lỗi khi tải danh sách phòng: ${err.message}`, 'error');
            setEditingRoom(null);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const handleRoomChange = async (entry, newRoomCode) => {
        if (!newRoomCode || newRoomCode === entry.room_code) {
            setEditingRoom(null);
            return;
        }

        setIsChangingRoom(true);
        try {
            const response = await changeRoom(token, entry.id, newRoomCode);
            if (response.success) {
                showToast('Đã thay đổi phòng thành công', 'success');
                setEditingRoom(null);

                // Update the modal entries to reflect the new room
                if (setModalEntries && entries) {
                    const selectedRoom = availableRooms.find(r => r.room_code === newRoomCode);
                    setModalEntries(entries.map(modalEntry =>
                        modalEntry.id === entry.id
                            ? {
                                ...modalEntry,
                                room_code: newRoomCode,
                                room_name: selectedRoom ? selectedRoom.room_name : modalEntry.room_name
                            }
                            : modalEntry
                    ));
                }

                if (refreshData) {
                    refreshData();
                }
            } else {
                showToast(response.description || 'Thay đổi phòng thất bại', 'error');
            }
        } catch (err) {
            showToast(`Lỗi khi thay đổi phòng: ${err.message}`, 'error');
        } finally {
            setIsChangingRoom(false);
        }
    };

    const handleDeleteSlot = async (entry) => {
        if (entry.status !== 'Chưa diễn ra') {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await removeScheduleBySlot(token, entry.id);
            if (response.success) {
                showToast('Đã xóa tiết học thành công', 'success');
                onClose();

                if (refreshData) {
                    refreshData();
                }
            } else {
                showToast(response.description || 'Xóa tiết học thất bại', 'error');
            }
        } catch (err) {
            showToast(`Lỗi khi xóa tiết học: ${err.message}`, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const renderTeacherField = (entry) => {
        if (editingTeacher === entry.id) {
            return (
                <TeacherDropdownContainer>
                    <TeacherDropdown
                        value=""
                        onChange={(e) => handleTeacherChange(entry, e.target.value)}
                        disabled={isChangingTeacher}
                    >
                        <option value="">-- Chọn giáo viên --</option>
                        {availableTeachers.map((teacher) => (
                            <option key={teacher.user_name} value={teacher.user_name}>
                                {teacher.full_name} ({teacher.user_name}) {teacher.is_current_teacher ? "(GV bộ môn)" : ""}
                            </option>
                        ))}
                    </TeacherDropdown>
                </TeacherDropdownContainer>
            );
        }

        return (
            <>
                {entry.teacher_name} ({entry.teacher_user_name})
                {entry.status === 'Chưa diễn ra' && (
                    <TeacherEditIcon onClick={() => handleTeacherEdit(entry)}>
                        ✏️
                    </TeacherEditIcon>
                )}
            </>
        );
    };

    const renderRoomField = (entry) => {
        if (editingRoom === entry.id) {
            return (
                <RoomDropdownContainer>
                    <RoomDropdown
                        value=""
                        onChange={(e) => handleRoomChange(entry, e.target.value)}
                        disabled={isChangingRoom}
                    >
                        <option value="">-- Chọn phòng --</option>
                        {availableRooms.map((room) => (
                            <option key={room.room_code} value={room.room_code}>
                                {room.room_name} ({room.room_code}) {room.is_current_room ? "(Hiện tại)" : ""}
                            </option>
                        ))}
                    </RoomDropdown>
                </RoomDropdownContainer>
            );
        }

        return (
            <>
                {entry.room_code}
                {entry.status === 'Chưa diễn ra' && (
                    <RoomEditIcon onClick={() => handleRoomEdit(entry)}>
                        ✏️
                    </RoomEditIcon>
                )}
            </>
        );
    };

    return (
        <>
            <ModalOverlay onClick={onClose} />
            <Modal>
                <SubHeading>
                    Thông tin chi tiết
                </SubHeading>
                <ModalContent>
                    {entries.map((entry) => (
                        <ModalEntry key={entry.id}>
                            <p><b>Lớp:</b> {entry.class_code}</p>
                            <p><b>Mã môn:</b> {entry.subject_code}</p>
                            <p><b>Môn:</b> {entry.subject_name}</p>
                            <p><b>Giáo viên:</b> {renderTeacherField(entry)}</p>
                            <p><b>Phòng:</b> {renderRoomField(entry)}</p>
                            <p><b>Tiết:</b> {entry.time_slot_id}</p>
                            {viewMode !== 'Base' && (
                                <>
                                    <p><b>Từ:</b> {formatTime(entry.start_time)} <b>đến</b> {formatTime(entry.end_time)}</p>
                                    <p><b>Đánh giá:</b>
                                        {' '}
                                        {entry.feedback && entry.feedback.trim() !== ''
                                            ? entry.feedback
                                            : 'N/A'}
                                    </p>
                                    <p><b>Trạng thái:</b>
                                        <StatusBadge status={entry.status}>
                                            {entry.status || 'N/A'}
                                        </StatusBadge>
                                        <EyeIcon onClick={() => setAttendanceModalData(entry)}>
                                            <FaEye />
                                        </EyeIcon>
                                    </p>
                                    <p><b>Thời lượng giảng dạy:</b> {entry.duration} phút</p>
                                    <p><StatusBadge status={entry.is_holiday ? 'Ngày lễ' : 'Ngày thường'}>
                                        {entry.is_holiday ? 'Ngày lễ' : 'Ngày thường'}
                                    </StatusBadge></p>
                                </>
                            )}
                        </ModalEntry>
                    ))}
                </ModalContent>

                {entries.some(entry => {
                    if (entry.status !== 'Chưa diễn ra') return false;

                    const entryDate = new Date(entry.date);
                    entryDate.setHours(0, 0, 0, 0);

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    return entryDate > today;
                }) && (
                        <DialogButtonGroup>
                            <ButtonDelete
                                onClick={() => handleDeleteSlot(entries[0])}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </ButtonDelete>
                        </DialogButtonGroup>
                    )}

            </Modal>
        </>
    );
};

const SemesterList = ({ semesters, onDelete, setSemesters, token, showToast, isAddSemesterDialogOpen, setIsAddSemesterDialogOpen, isGenerating, setIsGenerating }) => {
    const [newSemesterName, setNewSemesterName] = useState('');
    const [newSemesterStartDate, setNewSemesterStartDate] = useState('');
    const [newSemesterEndDate, setNewSemesterEndDate] = useState('');
    const [semesterError, setSemesterError] = useState('');

    const handleAddSemester = async () => {
        if (!newSemesterName.trim()) {
            showToast('Tên học kỳ không được để trống', 'error');
            return;
        }
        if (!newSemesterStartDate || !newSemesterEndDate) {
            showToast('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc', 'error');
            return;
        }
        if (new Date(newSemesterStartDate) > new Date(newSemesterEndDate)) {
            showToast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 'error');
            return;
        }

        try {
            setIsGenerating(true);
            const response = await addSemester(token, {
                semester_name: newSemesterName,
                start_date: formatDate(newSemesterStartDate),
                end_date: formatDate(newSemesterEndDate),
            });
            if (response.success) {
                showToast(response.description, 'success');
                const newSemesters = await fetchSemesters(token);
                setSemesters(newSemesters);
                setIsAddSemesterDialogOpen(false);
                setNewSemesterName('');
                setNewSemesterStartDate('');
                setNewSemesterEndDate('');
                setSemesterError('');
            } else {
                showToast(response.description, 'error');
            }
        } catch (err) {
            const errorMessage = err.message || 'Lỗi khi tạo học kỳ';
            showToast(errorMessage, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            {isAddSemesterDialogOpen && (
                <>
                    <DialogOverlay onClick={() => {
                        setIsAddSemesterDialogOpen(false);
                        setNewSemesterName('');
                        setNewSemesterStartDate('');
                        setNewSemesterEndDate('');
                        setSemesterError('');
                    }} />
                    <Dialog>
                        <SubHeading>
                            + Tạo học kỳ mới
                        </SubHeading>
                        <FormGroup1>
                            <Label>Tên học kỳ</Label>
                            <Input
                                type="text"
                                value={newSemesterName}
                                onChange={(e) => setNewSemesterName(e.target.value)}
                                placeholder="Nhập tên học kỳ"
                                disabled={isGenerating}
                            />
                        </FormGroup1>
                        <FormGroup1>
                            <Label>Ngày bắt đầu</Label>
                            <DatePicker
                                selected={newSemesterStartDate}
                                onChange={(date) => {
                                    setNewSemesterStartDate(date);
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày bắt đầu"
                                disabled={isGenerating}
                                customInput={<Input />}
                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            />
                        </FormGroup1>
                        <FormGroup1>
                            <Label>Ngày kết thúc</Label>

                            <DatePicker
                                selected={newSemesterEndDate}
                                onChange={(date) => {
                                    setNewSemesterEndDate(date);
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày kết thúc"
                                disabled={isGenerating}
                                customInput={<Input />}
                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            />
                        </FormGroup1>
                        {semesterError && <DialogError>{semesterError}</DialogError>}
                        <DialogButtonGroup>
                            <CancelButton
                                onClick={() => {
                                    setIsAddSemesterDialogOpen(false);
                                    setNewSemesterName('');
                                    setNewSemesterStartDate('');
                                    setNewSemesterEndDate('');
                                    setSemesterError('');
                                }}
                                disabled={isGenerating}
                            >
                                Hủy
                            </CancelButton>
                            <ButtonAdd onClick={handleAddSemester} disabled={isGenerating}>
                                Lưu thông tin
                            </ButtonAdd>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
            <Table>
                <thead>
                    <tr>
                        <Th>Tên</Th>
                        <Th>Ngày bắt đầu</Th>
                        <Th>Ngày kết thúc</Th>
                        <Th>Hành động</Th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.map((semester) => (
                        <tr key={semester.id}>
                            <Td>{semester.semester_name}</Td>
                            <Td>{new Date(semester.start_date).toLocaleDateString('vi-VN')}</Td>
                            <Td>{new Date(semester.end_date).toLocaleDateString('vi-VN')}</Td>
                            <Td>
                                <ButtonDelete
                                    onClick={() => onDelete(semester.id)}
                                    disabled={isGenerating}
                                >
                                    <FaTrash /> Xóa
                                </ButtonDelete>
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

const Configuration = ({ token, showToast, configs, setConfigs, filteredConfigs }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);



    const handleEdit = (config) => {
        setEditingConfig(config);
        setEditValue(config.value);
        setIsEditDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingConfig || !editValue.trim()) {
            showToast('Vui lòng nhập giá trị hợp lệ', 'error');
            return;
        }

        setSaving(true);
        try {
            var resultData = await updateScheduleConfig(token, {
                name: editingConfig.name,
                value: editValue.trim()
            });
            if (resultData.success) {
                setConfigs(prevConfigs =>
                    prevConfigs.map(config =>
                        config.name === editingConfig.name
                            ? { ...config, value: editValue.trim() }
                            : config
                    )
                );

                showToast(resultData.description, 'success');
                setIsEditDialogOpen(false);
                setEditingConfig(null);
                setEditValue('');
            }
            else {
                showToast(resultData.description, 'error');
            }
            // Update the local state

        } catch (err) {
            showToast(`Lỗi khi cập nhật cấu hình: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditDialogOpen(false);
        setEditingConfig(null);
        setEditValue('');
    };

    if (!configs || configs.length === 0) {
        return <div>Đang tải...</div>;
    }

    return (
        <div>

            <Table>
                <thead>
                    <tr>
                        <Th style={{ width: '60%' }}>Tên cấu hình</Th>
                        <Th style={{ width: '30%' }}>Giá trị</Th>
                        <Th style={{ width: '10%' }}>Hành động</Th>
                    </tr>
                </thead>
                <tbody>
                    {filteredConfigs.map((config) => (
                        <tr key={config.name}>
                            <Td>{config.description}</Td>
                            <Td>{config.value}</Td>
                            <Td>
                                <ButtonUpdate
                                    onClick={() => handleEdit(config)}
                                    disabled={config.is_restricted}
                                    style={{
                                        opacity: config.is_restricted ? 0.5 : 1,
                                        cursor: config.is_restricted ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Chỉnh sửa
                                </ButtonUpdate>
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Edit Dialog */}
            {isEditDialogOpen && editingConfig && (
                <DialogOverlay onClick={handleCancel}>
                    <Dialog onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                            Chỉnh sửa cấu hình
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Tên cấu hình:
                            </label>
                            <div style={{
                                width: '95%',
                                padding: '8px 12px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                color: '#6b7280'
                            }}>
                                {editingConfig.description}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Giá trị:
                            </label>
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                style={{
                                    width: '95%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                                placeholder="Nhập giá trị mới"
                            />
                        </div>
                        <DialogButtonGroup>
                            <CancelButton onClick={handleCancel}>
                                Hủy
                            </CancelButton>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    background: saving ? '#9ca3af' : '#3b82f6',
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {saving ? 'Đang lưu...' : 'Xác nhận'}
                            </Button>
                        </DialogButtonGroup>
                    </Dialog>
                </DialogOverlay>
            )}
        </div>
    );
};

const ScheduleTemplateList = ({ templates, onSelect, onGenerate, token, selectedScheduleId, isDialogOpen, setIsDialogOpen, isGenerating, setIsGenerating }) => {
    const { showToast } = useToast();
    const [option, setOption] = useState('Default');
    const [useClassConfig, setUseClassConfig] = useState(true);
    const [scheduleName, setScheduleName] = useState('');
    const [semesterId, setSemesterId] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [error, setError] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editScheduleId, setEditScheduleId] = useState(null);
    const [editScheduleName, setEditScheduleName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // Filter and sort state
    const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const semestersData = await fetchSemesters(token);
                setSemesters(semestersData);
            } catch (err) {
                showToast(`Lỗi khi tải danh sách học kỳ: ${err.message}`, 'error');
            }
        };
        if (token) {
            fetchData();
        }
    }, [token]);

    // Filter and sort templates
    const filteredAndSortedTemplates = useMemo(() => {
        let result = [...templates];

        // Filter by semester
        if (selectedSemesterFilter) {
            result = result.filter(template =>
                template.semester_id && Number(template.semester_id) === Number(selectedSemesterFilter)
            );
        }

        // Sort by creation date (if available) or by name as fallback
        result.sort((a, b) => {
            // Try to sort by creation date first
            if (a.created_date && b.created_date) {
                const dateA = new Date(a.created_date);
                const dateB = new Date(b.created_date);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            }

            // Fallback to sorting by name
            const nameA = (a.schedule_name || '').toLowerCase();
            const nameB = (b.schedule_name || '').toLowerCase();
            return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        });

        return result;
    }, [templates, selectedSemesterFilter, sortOrder]);

    // Get unique semesters from templates for filter options
    const availableSemesters = useMemo(() => {
        const semesterIds = [...new Set(templates.map(template => template.semester_id).filter(Boolean))];
        return semesters.filter(semester => semesterIds.includes(semester.id));
    }, [templates, semesters]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpenId && !event.target.closest('.dropdown-container')) {
                setDropdownOpenId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpenId]);



    const handleGenerate = async () => {
        if (!semesterId) {
            showToast('Vui lòng chọn học kỳ', 'error');
            return;
        }
        setIsGenerating(true);
        try {
            var resultData = await generateSchedule(token, {
                schedule_name: scheduleName.trim(),
                semester_id: semesterId,
                option,
                use_class_config: useClassConfig,
            });
            if (resultData.success) {
                showToast(resultData.description, 'success');
                const newTemplates = await fetchBaseSchedules(token);
                onGenerate(newTemplates);
                setError(null);
                setIsDialogOpen(false);
                setScheduleName('');
                setSemesterId('');
            }
            else {
                showToast(resultData.description, 'error');
            }

        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        setIsDeleting(true);
        try {
            const response = await deleteBaseSchedule(token, scheduleId);
            showToast(response.description, 'success');
            const newTemplates = await fetchBaseSchedules(token);
            onGenerate(newTemplates);
            if (selectedScheduleId === scheduleId) {
                onSelect(null);
            }
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsDeleting(false);
            setDropdownOpenId(null);
        }
    };

    const handleEdit = (scheduleId, currentName) => {
        setEditScheduleId(scheduleId);
        setEditScheduleName(currentName);
        setIsEditDialogOpen(true);
        setDropdownOpenId(null);
    };

    const handleUpdate = async () => {
        if (!editScheduleName.trim()) {
            showToast('Tên thời khóa biểu không được để trống', 'error');
            return;
        }
        try {
            await updateBaseSchedule(token, { id: editScheduleId, schedule_name: editScheduleName });
            showToast('Cập nhật tên thời khóa biểu thành công', 'success');
            const newTemplates = await fetchBaseSchedules(token);
            onGenerate(newTemplates);
            setIsEditDialogOpen(false);
            setEditScheduleName('');
            setEditScheduleId(null);
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        }
    };

    const toggleDropdown = (scheduleId, event) => {
        if (dropdownOpenId === scheduleId) {
            setDropdownOpenId(null);
            return;
        }

        // Calculate dropdown position relative to viewport
        const button = event.currentTarget;
        const buttonRect = button.getBoundingClientRect();

        // Estimate dropdown dimensions
        const dropdownWidth = 140;
        const dropdownHeight = 80;

        // Calculate available space
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Determine if dropdown should appear above or below
        const shouldPositionAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

        // Calculate position
        let top, left;

        if (shouldPositionAbove) {
            // Position above the button
            top = buttonRect.top - dropdownHeight - 8;
        } else {
            // Position below the button
            top = buttonRect.bottom + 8;
        }

        // Calculate horizontal position (right-aligned with button)
        left = buttonRect.right - dropdownWidth;

        // Ensure dropdown doesn't go off-screen horizontally
        if (left < 10) {
            left = 10;
        }

        // Ensure dropdown doesn't go off-screen vertically
        if (top < 10) {
            top = 10;
        } else if (top + dropdownHeight > window.innerHeight - 10) {
            top = window.innerHeight - dropdownHeight - 10;
        }

        setDropdownPosition({ top, left });
        setDropdownOpenId(scheduleId);

        // Adjust position after render if needed
        setTimeout(() => {
            const dropdownElement = document.querySelector('.dropdown-menu-fixed');
            if (dropdownElement) {
                const dropdownRect = dropdownElement.getBoundingClientRect();

                // Check if dropdown goes off-screen and adjust
                if (dropdownRect.right > window.innerWidth - 10) {
                    dropdownElement.style.left = `${window.innerWidth - dropdownRect.width - 10}px`;
                }

                if (dropdownRect.bottom > window.innerHeight - 10) {
                    dropdownElement.style.top = `${buttonRect.top - dropdownRect.height - 8}px`;
                }

                if (dropdownRect.top < 10) {
                    dropdownElement.style.top = '10px';
                }
            }
        }, 0);
    };

    return (
        <TemplateListWrapper>
            {error && <ErrorMessage> {error}</ErrorMessage>}
            {isDialogOpen && (
                <>
                    <DialogOverlay onClick={() => {
                        setIsDialogOpen(false);
                        setScheduleName('');
                        setSemesterId('');
                        setError(null);
                    }} />
                    <Dialog>
                        <SubHeading>
                            + Tạo mẫu thời khóa biểu mới
                        </SubHeading>
                        <FormGroup1>
                            <Label>Tên thời khóa biểu (để trống để sinh ngẫu nhiên)</Label>
                            <Input
                                type="text"
                                value={scheduleName}
                                onChange={(e) => setScheduleName(e.target.value)}
                                placeholder="Nhập tên thời khóa biểu (tùy chọn)"
                                disabled={isGenerating}
                            />
                        </FormGroup1>
                        <FormGroup1>
                            <Label>Học kỳ</Label>
                            <Select
                                value={semesterId}
                                onChange={(e) => {
                                    setSemesterId(e.target.value);
                                    setError(null);
                                }}
                                disabled={isGenerating}
                            >
                                <option value="">-- Chọn học kỳ --</option>
                                {semesters.map((semester) => (
                                    <option key={semester.id} value={semester.id}>
                                        {semester.semester_name} ({new Date(semester.start_date).toLocaleDateString('vi-VN')} - {new Date(semester.end_date).toLocaleDateString('vi-VN')})
                                    </option>
                                ))}
                            </Select>
                        </FormGroup1>
                        <FormGroup>
                            {/* <div>
                                <Label>Phương thức xếp lịch</Label>
                                <Select
                                    value={option}
                                    onChange={(e) => setOption(e.target.value)}
                                    disabled={isGenerating}
                                >
                                    <option value="Default">Ngẫu nhiên</option>
                                    <option value="FrontLoad">Dồn đầu tuần</option>
                                    <option value="SpreadEven">Dàn đều</option>
                                    <option value="BackLoad">Dồn cuối tuần</option>
                                </Select>
                            </div> */}
                            <CheckboxLabel>
                                <Checkbox
                                    type="checkbox"
                                    checked={useClassConfig}
                                    onChange={(e) => setUseClassConfig(e.target.checked)}
                                    disabled={isGenerating}
                                />
                                Sử dụng cấu hình giáo viên bộ môn mặc định
                            </CheckboxLabel>
                        </FormGroup>
                        {isGenerating && <Spinner />}
                        <DialogButtonGroup>
                            <CancelButton
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setScheduleName('');
                                    setSemesterId('');
                                    setError(null);
                                }}
                                disabled={isGenerating}
                            >
                                Hủy
                            </CancelButton>
                            <ButtonAdd onClick={handleGenerate} disabled={isGenerating}>
                                Lưu thông tin
                            </ButtonAdd>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
            {isEditDialogOpen && (
                <>
                    <DialogOverlay onClick={() => setIsEditDialogOpen(false)} />
                    <Dialog>
                        <SubHeading>
                            Đổi tên thời khóa biểu mẫu
                        </SubHeading>
                        <Input
                            type="text"
                            value={editScheduleName}
                            onChange={(e) => setEditScheduleName(e.target.value)}
                            placeholder="Nhập tên thời khóa biểu"
                        />
                        <DialogButtonGroup>
                            <CancelButton onClick={() => setIsEditDialogOpen(false)}>
                                Hủy
                            </CancelButton>
                            <ButtonSave onClick={handleUpdate}>
                                Xác nhận
                            </ButtonSave>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}

            {/* Filter and Sort Controls */}
            <FilterSortContainer>
                <FilterGroup>
                    <FilterSelect
                        value={selectedSemesterFilter}
                        onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                    >
                        <option value="">Tất cả học kỳ</option>
                        {availableSemesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>
                                {semester.semester_name} ({new Date(semester.start_date).toLocaleDateString('vi-VN')} - {new Date(semester.end_date).toLocaleDateString('vi-VN')})
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                <SortButton
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    title={sortOrder === 'desc' ? 'Sắp xếp (mới nhất trước)' : 'Sắp xếp (cũ nhất trước)'}
                >
                    {sortOrder === 'desc' ? <FaChevronDown /> : <FaChevronUp />}
                </SortButton>
            </FilterSortContainer>

            <TemplateList className="template-list-container">
                {filteredAndSortedTemplates.length === 0 ? (
                    <PlaceholderText>
                        {selectedSemesterFilter ? 'Không có mẫu thời khóa biểu nào cho học kỳ đã chọn' : 'Không có mẫu thời khóa biểu nào'}
                    </PlaceholderText>
                ) : (
                    <>
                        {filteredAndSortedTemplates.map((template) => (
                            <TemplateItem
                                key={template.id}
                                isOnUse={template.is_on_use}
                                isSelected={template.id === selectedScheduleId}
                                onClick={() => onSelect(template.id)}
                            >
                                <div className="dropdown-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                                    <div>
                                        {template.schedule_name}
                                        <br></br>
                                        {template.is_on_use && '⭐ Đang áp dụng'}
                                        {template.created_date && (
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                                Ngày tạo: {new Date(template.created_date).toLocaleDateString('vi-VN')}
                                            </div>
                                        )}
                                    </div>
                                    <DropdownButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDropdown(template.id, e);
                                        }}
                                    >
                                        <FaEllipsisH />
                                    </DropdownButton>
                                    {dropdownOpenId === template.id && (
                                        <DropdownMenu
                                            className="dropdown-menu-fixed"
                                            style={{
                                                top: `${dropdownPosition.top}px`,
                                                left: `${dropdownPosition.left}px`
                                            }}
                                        >
                                            <DropdownItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(template.id, template.schedule_name);
                                                }}
                                            >
                                                Đổi tên
                                            </DropdownItem>
                                            <DropdownItem
                                                danger
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(template.id);
                                                }}
                                            >
                                                Xóa
                                            </DropdownItem>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </TemplateItem>
                        ))}
                    </>
                )}
            </TemplateList>
        </TemplateListWrapper>
    );
};

const ENTRY_TYPE = 'ENTRY';

function DraggableEntry({ entry, onClick, children, viewMode }) {
    const [{ isDragging }, drag] = useDrag({
        type: ENTRY_TYPE,
        item: {
            id: entry.id,
            class_code: entry.class_code,
            current_time_slot_id: entry.time_slot_id,
            current_day_of_week: entry.day_of_week,
            current_date: entry.date,
            entry,
        },
        canDrag: viewMode === 'Base' || viewMode === 'Applied' || viewMode === 'Personal',
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    return (
        <div
            ref={drag}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

function DroppableTd({ slotId, dayId, date, children, onDropEntry, canDropEntry, viewMode }) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ENTRY_TYPE,
        canDrop: (item) => (viewMode === 'Base' || viewMode === 'Applied' || viewMode === 'Personal') && canDropEntry(item, slotId, dayId, date),
        drop: (item) => {
            if (viewMode === 'Base' || viewMode === 'Applied' || viewMode === 'Personal') {
                onDropEntry(item, slotId, dayId);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    return (
        <Td
            ref={drop}
            style={{
                background: isOver && canDrop ? '#e0e7ff' : undefined,
                minHeight: 60,
            }}
        >
            {children}
        </Td>
    );
}

const Timetable = ({ data, timeSlots, viewMode, scheduleDescription, selectedOption, refreshData, attendanceModalData, setAttendanceModalData }) => {
    const [modalEntries, setModalEntries] = useState(null);
    const { user } = useAuth();
    const { showToast } = useToast();
    const dayOfWeekMap = {
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
        0: 'Chủ nhật'
    };
    const token = user?.token;
    const dayOfWeekEnglish = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        0: 'Sunday',
    };

    const getDateColumns = (details) => {
        if (viewMode === 'Base') {
            return [
                { id: 1, label: 'Thứ 2' },
                { id: 2, label: 'Thứ 3' },
                { id: 3, label: 'Thứ 4' },
                { id: 4, label: 'Thứ 5' },
                { id: 5, label: 'Thứ 6' },
                { id: 6, label: 'Thứ 7' },
                { id: 0, label: 'Chủ nhật' }
            ];
        }

        if (selectedOption === 'Daily') {
            const validDetails = details.filter(entry => entry.date && typeof entry.day_of_week === 'number' && entry.day_of_week >= 0 && entry.day_of_week <= 7);
            if (validDetails.length === 0) {

                return [];
            }
            const firstDate = validDetails[0].date.split('T')[0];
            const entry = validDetails.find(e => e.date.split('T')[0] === firstDate);
            return entry ? [{
                date: firstDate,
                label: `${dayOfWeekMap[entry.day_of_week] || entry.day_of_week_str} (${new Date(firstDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`
            }] : [];
        }
        const days = [
            { id: 1, label: 'Thứ 2', date: null },
            { id: 2, label: 'Thứ 3', date: null },
            { id: 3, label: 'Thứ 4', date: null },
            { id: 4, label: 'Thứ 5', date: null },
            { id: 5, label: 'Thứ 6', date: null },
            { id: 6, label: 'Thứ 7', date: null },
            { id: 0, label: 'Chủ nhật', date: null }
        ];
        const validDetails = details.filter(entry => entry.date && typeof entry.day_of_week === 'number' && entry.day_of_week >= 0 && entry.day_of_week <= 7);
        const uniqueDates = [...new Set(validDetails.map(entry => entry.date.split('T')[0]))].sort();


        uniqueDates.forEach(date => {
            const entry = validDetails.find(e => e.date.split('T')[0] === date);
            if (entry && entry.day_of_week >= 0 && entry.day_of_week <= 7) {
                const dayItem = days.find(d => d.id === entry.day_of_week);
                if (dayItem) {
                    dayItem.date = date;
                    dayItem.label = `${dayOfWeekMap[entry.day_of_week] || entry.day_of_week_str} (${new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`;
                }
            }
        });
        return days;
    };

    const dateColumns = getDateColumns(data);

    const calculateTargetDate = (currentDate, targetDayOfWeek) => {
        if (!currentDate) return null;

        const current = new Date(currentDate);
        const currentDayOfWeek = current.getDay() === 0 ? 7 : current.getDay();
        const jsDayOfWeek = targetDayOfWeek === 0 ? 7 : targetDayOfWeek;

        let dayDifference = jsDayOfWeek - currentDayOfWeek;

        if (dayDifference === 0) {
            return currentDate;
        }

        const targetDate = new Date(current);
        targetDate.setDate(current.getDate() + dayDifference);
        return formatDate(targetDate);
    };

    const handleDropEntry = async (item, newSlotId, newDayId) => {
        if (viewMode === 'Base') {
            if (
                item.current_time_slot_id === newSlotId &&
                item.current_day_of_week === newDayId
            ) {
                return;
            }
        } else {
            const targetDate = calculateTargetDate(item.current_date, newDayId);
            if (
                item.current_time_slot_id === newSlotId &&
                item.current_date === targetDate
            ) {
                return;
            }
        }

        try {
            let resultData;

            if (viewMode === 'Base') {
                resultData = await moveSchedule(
                    user.token,
                    {
                        schedule_id: item.entry.schedule_id,
                        code: `${item.entry.id}`,
                        type: 'Slot',
                        current_day_of_week: dayOfWeekEnglish[item.current_day_of_week] || item.current_day_of_week,
                        new_day_of_week: dayOfWeekEnglish[newDayId] || newDayId,
                        new_time_slot_id: newSlotId,
                    }
                );
            } else {
                const targetDate = calculateTargetDate(item.current_date, newDayId);
                if (!targetDate) {
                    showToast('Không thể xác định ngày đích', 'error');
                    return;
                }

                resultData = await moveScheduleDetail(
                    user.token,
                    {
                        is_move: true,
                        code: `${item.entry.id}`,
                        type: 'Slot',
                        current_date: item.current_date,
                        new_date: targetDate,
                        new_time_slot_id: newSlotId,
                    }
                );
            }

            if (resultData.success) {
                showToast('Di chuyển thành công', 'success');
                if (refreshData) refreshData();
            } else {
                showToast(resultData.description, 'error');
            }
        } catch (err) {
            showToast(err.message || 'Di chuyển thất bại', 'error');
        }
    };
    const canDropEntry = (item, slotId, dayId, date) => {
        if (viewMode === 'Base') {
            // Only allow drop if not same cell for Base view
            return item.current_time_slot_id !== slotId || item.current_day_of_week !== dayId;
        } else {
            // For Applied/Personal view, calculate target date and check if not same time slot and date
            const targetDate = calculateTargetDate(item.current_date, dayId);
            return item.current_time_slot_id !== slotId || item.current_date !== targetDate;
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <TimetableWrapper>
                {data.length === 0 && (
                    <InfoMessage>
                        Không có lịch: {scheduleDescription}.
                    </InfoMessage>
                )}
                {data.length > 0 && timeSlots.length > 0 && dateColumns.length > 0 && (
                    <Table>
                        <thead>
                            <tr>
                                <Th style={{ width: '9%' }}></Th>
                                {dateColumns.map((col) => (
                                    <Th style={{ width: '13%' }} key={col.date || col.id}>{col.label}</Th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((slot) => (
                                <tr key={slot.id}>
                                    <Td>Tiết {slot.id}</Td>
                                    {dateColumns.map((col) => {
                                        const entries = data.filter((entry) => {
                                            if (viewMode === 'Base') {
                                                return entry.time_slot_id === slot.id && entry.day_of_week === col.id;
                                            }
                                            return entry.time_slot_id === slot.id && entry.date?.split('T')[0] === col.date;
                                        });
                                        const maxDisplay = 3;
                                        const displayedEntries = entries.slice(0, maxDisplay);
                                        return (
                                            <DroppableTd
                                                key={col.date || col.id}
                                                slotId={slot.id}
                                                dayId={col.id}
                                                date={col.date}
                                                onDropEntry={handleDropEntry}
                                                canDropEntry={canDropEntry}
                                                viewMode={viewMode}
                                            >
                                                {displayedEntries.map((entry) => (
                                                    <DraggableEntry
                                                        key={entry.id}
                                                        entry={entry}
                                                        onClick={() => setModalEntries([entry])}
                                                        viewMode={viewMode}
                                                    >
                                                        <Entry>
                                                            <p>{entry.class_code}-{entry.subject_code} ({entry.teacher_user_name})</p>
                                                            {entry.status && (
                                                                <p>
                                                                    <StatusBadge status={entry.status}>{entry.status}</StatusBadge>
                                                                </p>
                                                            )}
                                                        </Entry>
                                                    </DraggableEntry>
                                                ))}
                                                {entries.length > maxDisplay && (
                                                    <Button
                                                        onClick={() => setModalEntries(entries)}
                                                        style={{ marginTop: '8px', fontSize: '12px', padding: '4px 8px' }}
                                                    >
                                                        +{entries.length - maxDisplay} Xem thêm
                                                    </Button>
                                                )}
                                            </DroppableTd>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                {modalEntries && (
                    <SlotModal
                        entries={modalEntries}
                        onClose={() => setModalEntries(null)}
                        viewMode={viewMode}
                        setAttendanceModalData={setAttendanceModalData}
                        showToast={showToast}
                        refreshData={refreshData}
                        token={token}
                        setModalEntries={setModalEntries}
                    />
                )}
                {attendanceModalData && (
                    <>
                        <AttendanceModalOverlay onClick={() => setAttendanceModalData(null)} />
                        <AttendanceModal>
                            <SubHeading>
                                Chi tiết điểm danh
                                <CloseButton
                                    onClick={() => setAttendanceModalData(null)}
                                    style={{ marginLeft: 'auto', padding: '4px 8px' }}
                                >
                                    <FaTimes />
                                </CloseButton>
                            </SubHeading>
                            <AttendanceInfo>
                                <div>
                                    <p><b>Giờ vào lớp:</b> {attendanceModalData.check_in_time || 'N/A'}</p>
                                    {attendanceModalData.check_in_path ? (
                                        <a
                                            href={attendanceModalData.check_in_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <AttendanceImage
                                                src={attendanceModalData.check_in_path}
                                                alt="Check-in"
                                            />
                                        </a>
                                    ) : (
                                        <PlaceholderText>Không có thông tin vào lớp</PlaceholderText>
                                    )}

                                </div>
                                <div>
                                    <p><b>Giờ ra về:</b> {attendanceModalData.check_out_time || 'N/A'}</p>
                                    {attendanceModalData.check_out_path ? (
                                        <a
                                            href={attendanceModalData.check_out_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <AttendanceImage
                                                src={attendanceModalData.check_out_path}
                                                alt="Check-out"
                                            />
                                        </a>
                                    ) : (
                                        <PlaceholderText>Không có thông tin ra về</PlaceholderText>
                                    )}
                                </div>


                            </AttendanceInfo>

                            <AttendanceButtons>
                                <AttendanceButton
                                    className="late"
                                    onClick={async () => {
                                        try {
                                            const result = await markAsLate(user.token, {
                                                schedule_id: attendanceModalData.id,
                                                reason: ""
                                            });
                                            if (result.success) {
                                                showToast('Đã đánh dấu là trễ', 'success');
                                                setAttendanceModalData(null);
                                                if (modalEntries && setModalEntries) {
                                                    setModalEntries(modalEntries.map(entry =>
                                                        entry.id === attendanceModalData.id
                                                            ? { ...entry, status: 'Trễ' }
                                                            : entry
                                                    ));
                                                }
                                                if (refreshData) refreshData();
                                            } else {
                                                showToast(result.description, 'error');
                                            }
                                        } catch (err) {
                                            showToast(err.message || 'Thao tác thất bại', 'error');
                                        }
                                    }}
                                >
                                    Đánh dấu là trễ
                                </AttendanceButton>

                                <AttendanceButton
                                    className="absent"
                                    onClick={async () => {
                                        try {
                                            const result = await markAsAbsent(user.token, {
                                                schedule_id: attendanceModalData.id,
                                                reason: ""
                                            });
                                            if (result.success) {
                                                showToast('Đã đánh dấu là vắng', 'success');
                                                setAttendanceModalData(null);
                                                if (modalEntries && setModalEntries) {
                                                    setModalEntries(modalEntries.map(entry =>
                                                        entry.id === attendanceModalData.id
                                                            ? { ...entry, status: 'Vắng mặt' }
                                                            : entry
                                                    ));
                                                }
                                                if (refreshData) refreshData();
                                            } else {
                                                showToast(result.description, 'error');
                                            }
                                        } catch (err) {
                                            showToast(err.message || 'Thao tác thất bại', 'error');
                                        }
                                    }}
                                >
                                    Đánh dấu là vắng
                                </AttendanceButton>

                                <AttendanceButton
                                    className="attendance"
                                    onClick={async () => {
                                        try {
                                            const result = await markAsAttendance(user.token, {
                                                schedule_id: attendanceModalData.id,
                                                reason: ""
                                            });
                                            if (result.success) {
                                                showToast('Đã đánh dấu là đúng giờ', 'success');
                                                setAttendanceModalData(null);
                                                if (modalEntries && setModalEntries) {
                                                    setModalEntries(modalEntries.map(entry =>
                                                        entry.id === attendanceModalData.id
                                                            ? { ...entry, status: 'Hoàn thành' }
                                                            : entry
                                                    ));
                                                }
                                                if (refreshData) refreshData();
                                            } else {
                                                showToast(result.description, 'error');
                                            }
                                        } catch (err) {
                                            showToast(err.message || 'Thao tác thất bại', 'error');
                                        }
                                    }}
                                >
                                    Đánh dấu là đúng giờ
                                </AttendanceButton>
                            </AttendanceButtons>
                        </AttendanceModal>
                    </>
                )}
            </TimetableWrapper>
        </DndProvider>
    );
};

export default function ViewSchedule() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [scheduleDetails, setScheduleDetails] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [scheduleDescription, setScheduleDescription] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [error, setError] = useState(null);
    const [baseType, setBaseType] = useState('All');
    const [baseCode, setBaseCode] = useState('');
    const [appliedType, setAppliedType] = useState('All');
    const [appliedCode, setAppliedCode] = useState('');
    const [selectedOption, setSelectedOption] = useState('Weekly');
    const [selectedCurrent, setSelectedCurrent] = useState(0);
    const [pagination, setPagination] = useState({ current: 0, last: 1, next: null, previous: null, total: 0 });
    const [viewMode, setViewMode] = useState('Base');
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [applySemesterId, setApplySemesterId] = useState('');
    const [applyScheduleId, setApplyScheduleId] = useState('');
    const [applyBeginDate, setApplyBeginDate] = useState(null);
    const [applyEndDate, setApplyEndDate] = useState(null);
    const [applyDateError, setApplyDateError] = useState('');
    const [forceAssign, setForceAssign] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [removeBeginDate, setRemoveBeginDate] = useState('');
    const [removeEndDate, setRemoveEndDate] = useState('');
    const [removeDateError, setRemoveDateError] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [datesInUse, setDatesInUse] = useState([]);
    const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
    const [isGeneratingSemester, setIsGeneratingSemester] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState('Tất cả');
    const [configs, setConfigs] = useState([]);
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
    const [holidayDate, setHolidayDate] = useState(null);
    const [makeupDate, setMakeupDate] = useState(null);
    const [isMarkingHoliday, setIsMarkingHoliday] = useState(false);
    const [holidayOperationType, setHolidayOperationType] = useState('Thêm');
    const [attendanceModalData, setAttendanceModalData] = useState(null);
    const [isMoveScheduleDialogOpen, setIsMoveScheduleDialogOpen] = useState(false);
    const [moveScheduleType, setMoveScheduleType] = useState('All');
    const [moveScheduleCode, setMoveScheduleCode] = useState('');
    const [moveScheduleCurrentDay, setMoveScheduleCurrentDay] = useState('Monday');
    const [moveScheduleNewDay, setMoveScheduleNewDay] = useState('Monday');
    const [moveScheduleNewTimeSlot, setMoveScheduleNewTimeSlot] = useState('');
    const [isMovingSchedule, setIsMovingSchedule] = useState(false);

    // State variables for Applied view "Dời lịch" feature
    const [isMoveScheduleDetailDialogOpen, setIsMoveScheduleDetailDialogOpen] = useState(false);
    const [moveScheduleDetailType, setMoveScheduleDetailType] = useState('All');
    const [moveScheduleDetailCode, setMoveScheduleDetailCode] = useState('');
    const [moveScheduleDetailCurrentDate, setMoveScheduleDetailCurrentDate] = useState(null);
    const [moveScheduleDetailNewDate, setMoveScheduleDetailNewDate] = useState(null);
    const [moveScheduleDetailNewTimeSlot, setMoveScheduleDetailNewTimeSlot] = useState('');
    const [isMovingScheduleDetail, setIsMovingScheduleDetail] = useState(false);

    // NEW: State variables for 'Slot' type in Applied view move schedule
    const [moveScheduleDetailSelectedClass, setMoveScheduleDetailSelectedClass] = useState('');
    const [moveScheduleDetailLessons, setMoveScheduleDetailLessons] = useState([]);
    const [moveScheduleDetailSelectedLessonId, setMoveScheduleDetailSelectedLessonId] = useState('');
    const [moveScheduleDetailMoveType, setMoveScheduleDetailMoveType] = useState('Dời lịch');

    // NEW: State variables for "Thêm mới" combined modal
    const [addNewType, setAddNewType] = useState('Thời khóa biểu mới');
    const [isAddNewDialogOpen, setIsAddNewDialogOpen] = useState(false);

    const [selectedClassForSlot, setSelectedClassForSlot] = useState('');
    const [selectedSubjectForSlot, setSelectedSubjectForSlot] = useState('');
    const [selectedDateForSlot, setSelectedDateForSlot] = useState(null);
    const [selectedTimeSlotForSlot, setSelectedTimeSlotForSlot] = useState('');
    const [selectedTeacherForSlot, setSelectedTeacherForSlot] = useState('');
    const [classSubjects, setClassSubjects] = useState([]);
    const [availableTeachersForSlot, setAvailableTeachersForSlot] = useState([]);
    const [isLoadingClassSubjects, setIsLoadingClassSubjects] = useState(false);
    const [isLoadingTeachersForSlot, setIsLoadingTeachersForSlot] = useState(false);
    const [isAddingBySlot, setIsAddingBySlot] = useState(false);

    const token = user?.token;



    useEffect(() => {
        if (!token || loading) return;


        const fetchData = async () => {
            try {
                setIsLoading(true);
                if (viewMode === 'Semesters') {
                    const semestersData = await fetchSemesters(token);
                    setSemesters(semestersData);
                } else if (viewMode === 'Config') {
                    const configsData = await fetchScheduleConfig(token);
                    setConfigs(configsData);
                } else {
                    const templatesData = await fetchBaseSchedules(token);
                    setTemplates(templatesData);
                    const timeSlotsData = await fetchTimeSlots(token);
                    setTimeSlots(timeSlotsData);
                    const classesData = await fetchClasses(token);
                    setClasses(classesData.data_set || []);
                    const teachersData = await fetchAvailableTeachers2(token);
                    setTeachers(teachersData);
                    const semestersData = await fetchSemesters(token);
                    setSemesters(semestersData);
                    if (viewMode !== 'Base') {
                        await fetchTimetableData(viewMode, selectedCurrent);
                    }
                }
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token, loading, viewMode]);

    // NEW: useEffect to fetch lessons when type is 'Slot', class and date are selected
    useEffect(() => {
        const fetchLessonsForMove = async () => {
            if (moveScheduleDetailType === 'Slot' && moveScheduleDetailSelectedClass && moveScheduleDetailCurrentDate && token) {
                try {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const targetDate = new Date(moveScheduleDetailCurrentDate);
                    targetDate.setHours(0, 0, 0, 0);

                    const diffTime = targetDate - today;
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);

                    // Tạo params object ổn định
                    const params = {
                        option: 'Daily',
                        current: diffDays,
                        type: 'Class',
                        code: moveScheduleDetailSelectedClass,
                    };

                    const response = await fetchTimeTable(token, params);

                    // Tính toán formattedDate một lần
                    const formattedCurrentDate = formatDate(moveScheduleDetailCurrentDate);

                    // Filter the response to get only entries for the exact selected date
                    const filteredLessons = (response.data_set || []).filter(entry =>
                        entry.class_code === moveScheduleDetailSelectedClass &&
                        entry.date?.split('T')[0] === formattedCurrentDate
                    );

                    setMoveScheduleDetailLessons(filteredLessons);
                } catch (err) {
                    showToast(`Lỗi khi tải tiết học: ${err.message}`, 'error');
                    setMoveScheduleDetailLessons([]);
                }
            } else {
                setMoveScheduleDetailLessons([]);
            }
        };

        fetchLessonsForMove();
    }, [moveScheduleDetailType, moveScheduleDetailSelectedClass, moveScheduleDetailCurrentDate, token]);

    const formatDateMemo = useCallback((date) => {
        return new Date(date).toISOString().split('T')[0];
    }, []);

    const fetchTimetableData = async (mode, current) => {
        if (!token || isLoading) {

            return;
        }

        try {
            setIsLoading(true);
            const params = { option: selectedOption, current };
            if (mode === 'Applied' && appliedType !== 'All' && appliedCode) {
                params.type = appliedType;
                params.code = appliedCode;
            }

            const response = await (mode === 'Applied'
                ? fetchTimeTable(token, params)
                : fetchMyTimeTable(token, params));


            setTimetableData(response.data_set || []);
            setScheduleDescription(response.description || 'Không có mô tả');
            setPagination({
                current: response.pagination?.current || current,
                last: response.pagination?.last || 1,
                next: response.pagination?.next ?? null,
                previous: response.pagination?.previous ?? null,
                total: response.pagination?.total || 0
            });
            setError(null);
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
            setTimetableData([]);
            setScheduleDescription('Không có mô tả');
            setPagination({ current, last: 1, next: null, previous: null, total: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTemplate = async (scheduleId) => {
        setSelectedScheduleId(scheduleId);
        try {
            setIsLoading(true);
            const params = { code: baseCode || null, type: baseType };
            const details = await fetchScheduleDetails(token, scheduleId, baseCode || null, baseType);
            setScheduleDetails(details || []);
            setScheduleDescription('');
            setError(null);
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewMode = async (mode) => {
        if (mode === viewMode) return;
        setViewMode(mode);
        setSelectedCurrent(0);
        setSelectedOption('Weekly');
        setTimetableData([]);
        setScheduleDescription('');
        setError(null);
        setSelectedScheduleId(null);
        setScheduleDetails([]);
        if (mode !== 'Base' && mode !== 'Semesters') {
            await fetchTimetableData(mode, 0);
        }
    };

    const handleBaseTypeChange = async (newType) => {
        if (newType === baseType) return;

        setBaseType(newType);
        setBaseCode('');
        if (selectedScheduleId) {
            try {
                setIsLoading(true);
                const params = { code: '', type: newType };

                const details = await fetchScheduleDetails(token, selectedScheduleId, '', newType);
                setScheduleDetails(details || []);
                setScheduleDescription('');
                setError(null);
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAppliedTypeChange = async (newType) => {
        if (newType === appliedType) return;

        setAppliedType(newType);
        setAppliedCode('');
        if (viewMode !== 'Base') {
            try {
                setIsLoading(true);
                const params = { option: selectedOption, current: selectedCurrent };
                if (viewMode === 'Applied' && newType !== 'All') {
                    params.type = newType;
                    params.code = '';
                }

                const response = await (viewMode === 'Applied'
                    ? fetchTimeTable(token, params)
                    : fetchMyTimeTable(token, params));
                setTimetableData(response.data_set || []);
                setScheduleDescription(response.description || 'Không có mô tả');
                setPagination({
                    current: response.pagination?.current || selectedCurrent,
                    last: response.pagination?.last || 1,
                    next: response.pagination?.next ?? null,
                    previous: response.pagination?.previous ?? null,
                    total: response.pagination?.total || 0
                });
                setError(null);
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
                setTimetableData([]);
                setScheduleDescription('Không có mô tả');
                setPagination({ current: selectedCurrent, last: 1, next: null, previous: null, total: 0 });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAppliedCodeChange = async (newCode) => {
        if (newCode === appliedCode) return;

        setAppliedCode(newCode);
        if (viewMode !== 'Base' && appliedType !== 'All') {
            try {
                setIsLoading(true);
                const params = { option: selectedOption, current: selectedCurrent };
                if (viewMode === 'Applied' && newCode) {
                    params.type = appliedType;
                    params.code = newCode;
                }

                const response = await (viewMode === 'Applied'
                    ? fetchTimeTable(token, params)
                    : fetchMyTimeTable(token, params));
                setTimetableData(response.data_set || []);
                setScheduleDescription(response.description || 'Không có mô tả');
                setPagination({
                    current: response.pagination?.current || selectedCurrent,
                    last: response.pagination?.last || 1,
                    next: response.pagination?.next ?? null,
                    previous: response.pagination?.previous ?? null,
                    total: response.pagination?.total || 0
                });
                setError(null);
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
                setTimetableData([]);
                setScheduleDescription('Không có mô tả');
                setPagination({ current: selectedCurrent, last: 1, next: null, previous: null, total: 0 });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOptionChange = async (newOption) => {
        if (newOption === selectedOption) return;

        setSelectedOption(newOption);
        setSelectedCurrent(0);
        if (viewMode !== 'Base') {
            try {
                setIsLoading(true);
                const params = { option: newOption, current: 0 };
                if (viewMode === 'Applied' && appliedType !== 'All' && appliedCode) {
                    params.type = appliedType;
                    params.code = appliedCode;
                }

                const response = await (viewMode === 'Applied'
                    ? fetchTimeTable(token, params)
                    : fetchMyTimeTable(token, params));
                setTimetableData(response.data_set || []);
                setScheduleDescription(response.description || 'Không có mô tả');
                setPagination({
                    current: response.pagination?.current || 0,
                    last: response.pagination?.last || 1,
                    next: response.pagination?.next ?? null,
                    previous: response.pagination?.previous ?? null,
                    total: response.pagination?.total || 0
                });
                setError(null);
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
                setTimetableData([]);
                setScheduleDescription('Không có mô tả');
                setPagination({ current: 0, last: 1, next: null, previous: null, total: 0 });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handlePrevPeriod = async () => {
        if (isLoading) return;
        const newCurrent = selectedCurrent - 1;

        setSelectedCurrent(newCurrent);
        if (viewMode !== 'Base') {
            await fetchTimetableData(viewMode, newCurrent);
        }
    };

    const handleNextPeriod = async () => {
        if (isLoading) return;
        const newCurrent = selectedCurrent + 1;

        setSelectedCurrent(newCurrent);
        if (viewMode !== 'Base') {
            await fetchTimetableData(viewMode, newCurrent);
        }
    };

    const handleUpdateTemplates = async (newTemplates) => {
        setTemplates(newTemplates);
        if (!newTemplates.some(template => template.id === selectedScheduleId)) {
            setSelectedScheduleId(null);
            setScheduleDetails([]);
            setScheduleDescription('');
        }
    };

    const handleDeleteSemester = async (semesterId) => {
        try {
            const response = await removeSemester(token, semesterId);
            showToast(response.description, 'success');
            const newSemesters = await fetchSemesters(token);
            setSemesters(newSemesters);
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        }
    };

    // Configuration filter logic
    const uniqueApplications = ['Tất cả', ...new Set(configs.map(config => config.application))];
    const filteredConfigs = selectedApplication === 'Tất cả'
        ? configs
        : configs.filter(config => config.application === selectedApplication);

    const handleApplicationChange = (value) => {
        setSelectedApplication(value);
    };
    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const handleApplySchedule = async () => {
        if (!applySemesterId) {
            showToast('Vui lòng chọn học kỳ', 'error');
            return;
        }
        if (!applyScheduleId) {
            showToast('Vui lòng chọn mẫu thời khóa biểu', 'error');
            return;
        }
        if (!applyBeginDate || !applyEndDate) {
            showToast('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc', 'error');
            return;
        }
        if (applyBeginDate > applyEndDate) {
            showToast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 'error');
            return;
        }
        const usedDates = datesInUse.map(date => new Date(date.split('T')[0]));
        if (
            usedDates.some(date => date.toISOString().split('T')[0] === formatDate(applyBeginDate)) ||
            usedDates.some(date => date.toISOString().split('T')[0] === formatDate(applyEndDate))
        ) {
            showToast('Ngày bắt đầu hoặc ngày kết thúc đã có lịch, vui lòng chọn ngày khác', 'error');
            return;
        }
        try {
            setIsLoading(true);
            const payload = {
                schedule_id: applyScheduleId,
                begin_date: formatDate(applyBeginDate),
                end_date: formatDate(applyEndDate),
                force_assign: forceAssign,
            };
            const response = await addSchedule(token, payload);
            showToast(response.description, 'success');
            setIsApplyDialogOpen(false);
            setApplySemesterId('');
            setApplyScheduleId('');
            setApplyBeginDate(null);
            setApplyEndDate(null);
            setForceAssign(false);
            setDatesInUse([]);
            await fetchTimetableData('Applied', selectedCurrent);
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveTimeTable = async () => {
        if (!removeBeginDate || !removeEndDate) {
            showToast('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc', 'error');
            return;
        }
        if (new Date(removeBeginDate) > new Date(removeEndDate)) {
            showToast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 'error');
            return;
        }
        try {
            setIsLoading(true);
            const response = await removeTimeTable(token, {
                begin_date: formatDate(removeBeginDate),
                end_date: formatDate(removeEndDate),
            });
            showToast(response.description, 'success');
            setIsRemoveDialogOpen(false);
            setRemoveBeginDate('');
            setRemoveEndDate('');
            await fetchTimetableData('Applied', selectedCurrent);
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveSchedule = async () => {
        if (!selectedScheduleId) {
            showToast('Vui lòng chọn một mẫu thời khóa biểu', 'error');
            return;
        }
        if (moveScheduleType !== 'All' && !moveScheduleCode) {
            showToast('Vui lòng chọn lớp hoặc giáo viên cần di chuyển', 'error');
            return;
        }
        if (moveScheduleCurrentDay === moveScheduleNewDay) {
            showToast('Vui lòng chọn ngày khác', 'error');
            return;
        }

        try {
            setIsMovingSchedule(true);
            const payload = {
                schedule_id: selectedScheduleId,
                code: moveScheduleCode || '',
                type: moveScheduleType,
                current_day_of_week: moveScheduleCurrentDay,
                new_day_of_week: moveScheduleNewDay,
                new_time_slot_id: parseInt(moveScheduleNewTimeSlot),
            };

            const response = await moveSchedule(token, payload);
            if (response.success) {
                showToast(response.description, 'success');
                setIsMoveScheduleDialogOpen(false);
                setMoveScheduleType('All');
                setMoveScheduleCode('');
                setMoveScheduleCurrentDay('Monday');
                setMoveScheduleNewDay('Monday');
                setMoveScheduleNewTimeSlot('');
                // Refresh the schedule details
                if (selectedScheduleId) {
                    await handleSelectTemplate(selectedScheduleId);
                }
            } else {
                showToast(response.description || 'Di chuyển lịch thất bại', 'error');
            }
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsMovingSchedule(false);
        }
    };

    const handleMoveScheduleDetail = async () => {
        if (moveScheduleDetailType === 'Slot') {
            if (!moveScheduleDetailSelectedClass) {
                showToast('Vui lòng chọn lớp', 'error');
                return;
            }
            if (!moveScheduleDetailSelectedLessonId) {
                showToast('Vui lòng chọn tiết học hiện tại', 'error');
                return;
            }
        } else if (moveScheduleDetailType !== 'All' && !moveScheduleDetailCode) {
            showToast('Vui lòng chọn lớp hoặc giáo viên cần di chuyển', 'error');
            return;
        }
        if (!moveScheduleDetailCurrentDate) {
            showToast('Vui lòng chọn ngày hiện tại', 'error');
            return;
        }
        if (!moveScheduleDetailNewDate) {
            showToast('Vui lòng chọn ngày mới', 'error');
            return;
        }

        try {
            setIsMovingScheduleDetail(true);
            let payload = {};

            if (moveScheduleDetailType === 'Slot') {
                payload = {
                    is_move: moveScheduleDetailMoveType === 'Dời lịch',
                    code: moveScheduleDetailSelectedLessonId, // Use selected lesson ID as code
                    type: 'Slot', // Type is 'Slot'
                    current_date: formatDate(moveScheduleDetailCurrentDate),
                    new_date: formatDate(moveScheduleDetailNewDate),
                    new_time_slot_id: parseInt(moveScheduleDetailNewTimeSlot),
                };
            } else {
                payload = {
                    is_move: moveScheduleDetailMoveType === 'Dời lịch',
                    code: moveScheduleDetailCode || '',
                    type: moveScheduleDetailType,
                    current_date: formatDate(moveScheduleDetailCurrentDate),
                    new_date: formatDate(moveScheduleDetailNewDate),
                    new_time_slot_id: parseInt(moveScheduleDetailNewTimeSlot),
                };
            }

            const response = await moveScheduleDetail(token, payload);
            if (response.success) {
                showToast(response.description, 'success');
                setIsMoveScheduleDetailDialogOpen(false);
                // Reset all states for the modal
                setMoveScheduleDetailType('All');
                setMoveScheduleDetailCode('');
                setMoveScheduleDetailCurrentDate(null);
                setMoveScheduleDetailNewDate(null);
                setMoveScheduleDetailNewTimeSlot('');
                setMoveScheduleDetailSelectedClass('');
                setMoveScheduleDetailLessons([]);
                setMoveScheduleDetailSelectedLessonId('');
                setMoveScheduleDetailMoveType('Dời lịch');
                // Refresh the timetable data
                await fetchTimetableData(viewMode, selectedCurrent);
            } else {
                showToast(response.description || 'Di chuyển lịch thất bại', 'error');
            }
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsMovingScheduleDetail(false);
        }
    };

    // NEW: Functions for adding schedule by slot
    const handleClassChangeForSlot = async (classCode) => {
        setSelectedClassForSlot(classCode);
        setSelectedSubjectForSlot('');
        setSelectedDateForSlot(null);
        setSelectedTimeSlotForSlot('');
        setSelectedTeacherForSlot('');
        setClassSubjects([]);
        setAvailableTeachersForSlot([]);

        if (classCode) {
            try {
                setIsLoadingClassSubjects(true);
                const response = await fetchClassSubjects(token, classCode);
                if (response.success) {
                    setClassSubjects(response.data_set || []);
                } else {
                    showToast(response.description || 'Lỗi khi tải danh sách môn học', 'error');
                }
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoadingClassSubjects(false);
            }
        }
    };

    const handleSubjectChangeForSlot = (subjectCode) => {
        setSelectedSubjectForSlot(subjectCode);
        setSelectedDateForSlot(null);
        setSelectedTimeSlotForSlot('');
        setSelectedTeacherForSlot('');
        setAvailableTeachersForSlot([]);
    };

    const handleDateChangeForSlot = (date) => {
        setSelectedDateForSlot(date);
        setSelectedTimeSlotForSlot('');
        setSelectedTeacherForSlot('');
        setAvailableTeachersForSlot([]);
    };

    const handleTimeSlotChangeForSlot = async (timeSlotId) => {
        setSelectedTimeSlotForSlot(timeSlotId);
        setSelectedTeacherForSlot('');
        setAvailableTeachersForSlot([]);

        if (timeSlotId && selectedDateForSlot && selectedSubjectForSlot) {
            try {
                setIsLoadingTeachersForSlot(true);
                const response = await getAvailabelTeacherToChange2(token, selectedClassForSlot, selectedSubjectForSlot, formatDate(selectedDateForSlot), parseInt(timeSlotId));
                if (response.success) {
                    setAvailableTeachersForSlot(response.data_set || []);
                } else {
                    showToast(response.description || 'Lỗi khi tải danh sách giáo viên', 'error');
                }
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoadingTeachersForSlot(false);
            }
        }
    };

    const handleAddBySlot = async () => {
        if (!selectedClassForSlot) {
            showToast('Vui lòng chọn lớp', 'error');
            return;
        }
        if (!selectedSubjectForSlot) {
            showToast('Vui lòng chọn môn học', 'error');
            return;
        }
        if (!selectedDateForSlot) {
            showToast('Vui lòng chọn ngày', 'error');
            return;
        }
        if (!selectedTimeSlotForSlot) {
            showToast('Vui lòng chọn tiết học', 'error');
            return;
        }
        if (!selectedTeacherForSlot) {
            showToast('Vui lòng chọn giáo viên', 'error');
            return;
        }

        try {
            setIsAddingBySlot(true);
            const payload = {
                class_code: selectedClassForSlot,
                subject_code: selectedSubjectForSlot,
                date: formatDate(selectedDateForSlot),
                time_slot_id: parseInt(selectedTimeSlotForSlot),
                teacher_user_name: selectedTeacherForSlot
            };

            const response = await addScheduleBySlot(token, payload);
            if (response.success) {
                showToast(response.description || 'Thêm tiết học thành công', 'success');
                setIsAddNewDialogOpen(false);
                // Reset form
                setSelectedClassForSlot('');
                setSelectedSubjectForSlot('');
                setSelectedDateForSlot(null);
                setSelectedTimeSlotForSlot('');
                setSelectedTeacherForSlot('');
                setClassSubjects([]);
                setAvailableTeachersForSlot([]);
                // Refresh data
                if (viewMode !== 'Base') {
                    await fetchTimetableData(viewMode, selectedCurrent);
                }
            } else {
                showToast(response.description || 'Thêm tiết học thất bại', 'error');
            }
        } catch (err) {
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsAddingBySlot(false);
        }
    };

    if (!token) {
        return <Container>Vui lòng đăng nhập để xem thời khóa biểu.</Container>;
    }

    return (
        <Container>
            <Heading>
                📅 Quản lí thời khóa biểu
            </Heading>
            {error && <ErrorMessage> {error}</ErrorMessage>}
            {isLoading && <LoadingMessage><FaSpinner className="animate-spin" /> Đang tải...</LoadingMessage>}
            <FormGroup>
                <Button onClick={() => handleViewMode('Base')}>
                    Mẫu thời khóa biểu
                </Button>
                <Button onClick={() => handleViewMode('Applied')}>
                    Thời khóa biểu đang áp dụng
                </Button>
                <Button onClick={() => handleViewMode('Semesters')}>
                    Quản lí học kỳ
                </Button>
                <Button onClick={() => handleViewMode('Config')}>
                    Cấu hình thời khóa biểu
                </Button>
            </FormGroup>
            {viewMode === 'Base' && (
                <>
                    <FormGroup>
                        <ButtonAdd onClick={() => setIsDialogOpen(true)} disabled={isGeneratingTemplate}>
                            + Thêm mới
                        </ButtonAdd>
                        {
                            selectedScheduleId && (
                                <ButtonAdd onClick={() => setIsMoveScheduleDialogOpen(true)} disabled={!selectedScheduleId}>
                                    Dời lịch
                                </ButtonAdd>
                            )
                        }
                        <div>
                            <Select value={baseType} onChange={(e) => handleBaseTypeChange(e.target.value)}>
                                <option value="All">Tất cả</option>
                                <option value="Class">Lớp</option>
                                <option value="Teacher">Giáo viên</option>
                            </Select>
                        </div>
                        {baseType !== 'All' && (
                            <div>
                                <ReactSelect
                                    value={
                                        baseCode
                                            ? {
                                                value: baseCode,
                                                label:
                                                    baseType === 'Class'
                                                        ? classes.find((cls) => cls.class_code === baseCode)?.class_code
                                                        : teachers.find((teacher) => teacher.user_name === baseCode)
                                                            ?.full_name
                                                            ? `${teachers.find((teacher) => teacher.user_name === baseCode).full_name} (${teachers.find((teacher) => teacher.user_name === baseCode).user_name
                                                            })`
                                                            : '',
                                            }
                                            : null
                                    }
                                    onChange={async (selectedOption) => {
                                        const newCode = selectedOption ? selectedOption.value : '';
                                        setBaseCode(newCode);
                                        if (selectedScheduleId && newCode) {
                                            try {
                                                setIsLoading(true);
                                                const params = { code: newCode, type: baseType };
                                                const details = await fetchScheduleDetails(token, selectedScheduleId, newCode, baseType);
                                                setScheduleDetails(details || []);
                                                setScheduleDescription('');
                                                setError(null);
                                            } catch (err) {
                                                showToast(`Lỗi: ${err.message}`, 'error');
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }
                                    }}
                                    options={
                                        baseType === 'Class'
                                            ? classes.map((cls) => ({
                                                value: cls.class_code,
                                                label: cls.class_code,
                                            }))
                                            : teachers.map((teacher) => ({
                                                value: teacher.user_name,
                                                label: `${teacher.full_name} (${teacher.user_name})`,
                                            }))
                                    }
                                    placeholder="-- Chọn --"
                                    isSearchable={true}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            padding: '3px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            minWidth: '200px',
                                            color: '#1f2937',
                                            backgroundColor: 'white',
                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                borderColor: '#3b82f6',
                                            },
                                            '&:focus-within': {
                                                borderColor: '#3b82f6',
                                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                            },
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            fontSize: '14px',
                                            color: '#1f2937',
                                            backgroundColor: state.isSelected
                                                ? '#3b82f6'
                                                : state.isFocused
                                                    ? '#f1f5f9'
                                                    : 'white',
                                            '&:active': {
                                                backgroundColor: '#e0e7ff',
                                            },
                                        }),
                                        placeholder: (provided) => ({
                                            ...provided,
                                            color: '#9ca3af',
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            color: '#1f2937',
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            zIndex: 9999,
                                        }),
                                    }}
                                />
                            </div>
                        )}
                    </FormGroup>
                    <Grid>
                        <ScheduleTemplateList
                            templates={templates}
                            onSelect={handleSelectTemplate}
                            onGenerate={handleUpdateTemplates}
                            token={token}
                            selectedScheduleId={selectedScheduleId}
                            isDialogOpen={isDialogOpen}
                            setIsDialogOpen={setIsDialogOpen}
                            isGenerating={isGeneratingTemplate}
                            setIsGenerating={setIsGeneratingTemplate}
                        />
                        {selectedScheduleId && (
                            <Timetable
                                data={scheduleDetails}
                                timeSlots={timeSlots}
                                viewMode={viewMode}
                                scheduleDescription={scheduleDescription}
                                selectedOption={selectedOption}
                                attendanceModalData={attendanceModalData}
                                setAttendanceModalData={setAttendanceModalData}
                                refreshData={() => {
                                    if (viewMode === 'Base') {
                                        handleSelectTemplate(selectedScheduleId);
                                    } else {
                                        fetchTimetableData(viewMode, selectedCurrent);
                                    }
                                }}
                            />
                        )}
                    </Grid>
                </>
            )}
            {viewMode === 'Semesters' && (
                <>
                    <FormGroup>
                        <ButtonAdd onClick={() => setIsAddSemesterDialogOpen(true)} disabled={isGeneratingSemester}>
                            + Thêm mới
                        </ButtonAdd>
                    </FormGroup>
                    <SemesterList
                        semesters={semesters}
                        onDelete={handleDeleteSemester}
                        setSemesters={setSemesters}
                        token={token}
                        showToast={showToast}
                        isAddSemesterDialogOpen={isAddSemesterDialogOpen}
                        setIsAddSemesterDialogOpen={setIsAddSemesterDialogOpen}
                        isGenerating={isGeneratingSemester}
                        setIsGenerating={setIsGeneratingSemester}
                    />
                </>
            )}
            {viewMode === 'Config' && (
                <>
                    <FormGroup>
                        <div>
                            <Select
                                value={selectedApplication}
                                onChange={(e) => handleApplicationChange(e.target.value)}
                            >
                                {uniqueApplications.map((app) => (
                                    <option key={app} value={app}>
                                        {app}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </FormGroup>
                    <Configuration
                        token={token}
                        showToast={showToast}
                        configs={configs}
                        setConfigs={setConfigs}
                        filteredConfigs={filteredConfigs}
                    />
                </>
            )}
            {
                (viewMode === 'Applied' || viewMode === 'Personal') && (
                    <>
                        <FormGroup>
                            <NavButton
                                onClick={handlePrevPeriod}
                                disabled={isLoading}
                            >
                                <FaArrowLeft />
                            </NavButton>
                            <div>
                                <PeriodText>{scheduleDescription}</PeriodText>
                            </div>
                            <NavButton
                                onClick={handleNextPeriod}
                                disabled={isLoading}
                            >
                                <FaArrowRight />
                            </NavButton>
                            {viewMode === 'Applied' && (
                                <>
                                    <ButtonAdd onClick={() => setIsHolidayDialogOpen(true)} disabled={isLoading}>
                                        Thêm/ xóa ngày nghỉ
                                    </ButtonAdd>
                                    <ButtonAdd onClick={() => setIsMoveScheduleDetailDialogOpen(true)} disabled={isLoading}>
                                        Dời lịch/ Dạy bù
                                    </ButtonAdd>
                                    <ButtonAdd onClick={() => {
                                        setIsAddNewDialogOpen(true);
                                        setAddNewType('Thời khóa biểu mới');
                                    }} disabled={isLoading}>
                                        + Thêm mới
                                    </ButtonAdd>
                                    <ButtonDelete onClick={() => setIsRemoveDialogOpen(true)} disabled={isLoading}>
                                        <FaTrash /> Xóa
                                    </ButtonDelete>
                                </>
                            )}
                            {viewMode === 'Applied' && (
                                <>
                                    <div>
                                        <ReactSelect
                                            value={
                                                appliedType
                                                    ? {
                                                        value: appliedType,
                                                        label: appliedType === 'All' ? 'Tất Cả' : appliedType === 'Class' ? 'Lớp' : 'Giáo Viên',
                                                    }
                                                    : null
                                            }
                                            onChange={(selectedOption) =>
                                                handleAppliedTypeChange(selectedOption ? selectedOption.value : '')
                                            }
                                            options={[
                                                { value: 'All', label: 'Tất Cả' },
                                                { value: 'Class', label: 'Lớp' },
                                                { value: 'Teacher', label: 'Giáo Viên' },
                                            ]}
                                            placeholder="-- Chọn loại --"
                                            isSearchable={false}
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    padding: '3px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    color: '#1f2937',
                                                    backgroundColor: 'white',
                                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: '#3b82f6',
                                                    },
                                                    '&:focus-within': {
                                                        borderColor: '#3b82f6',
                                                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                                    },
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    fontSize: '14px',
                                                    color: '#1f2937',
                                                    backgroundColor: state.isSelected
                                                        ? '#3b82f6'
                                                        : state.isFocused
                                                            ? '#f1f5f9'
                                                            : 'white',
                                                    '&:active': {
                                                        backgroundColor: '#e0e7ff',
                                                    },
                                                }),
                                                placeholder: (provided) => ({
                                                    ...provided,
                                                    color: '#9ca3af',
                                                }),
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: '#1f2937',
                                                }),
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </div>
                                    {appliedType !== 'All' && (
                                        <div>
                                            <ReactSelect
                                                value={
                                                    appliedCode
                                                        ? {
                                                            value: appliedCode,
                                                            label: appliedType === 'Class'
                                                                ? classes.find((cls) => cls.class_code === appliedCode)?.class_code
                                                                : (() => {
                                                                    const t = teachers.find(
                                                                        (teacher) => teacher.user_name === appliedCode
                                                                    );
                                                                    return t ? `${t.full_name} (${t.user_name})` : '';
                                                                })(),
                                                        }
                                                        : null
                                                }
                                                onChange={(selectedOption) =>
                                                    handleAppliedCodeChange(selectedOption ? selectedOption.value : '')
                                                }
                                                options={
                                                    appliedType === 'Class'
                                                        ? classes.map((cls) => ({
                                                            value: cls.class_code,
                                                            label: cls.class_code,
                                                        }))
                                                        : teachers.map((teacher) => ({
                                                            value: teacher.user_name,
                                                            label: `${teacher.full_name} (${teacher.user_name})`,
                                                        }))
                                                }
                                                placeholder="-- Chọn --"
                                                isSearchable={true}
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        padding: '3px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        minWidth: '200px',

                                                        color: '#1f2937',
                                                        backgroundColor: 'white',
                                                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                                        '&:hover': {
                                                            borderColor: '#3b82f6',
                                                        },
                                                        '&:focus-within': {
                                                            borderColor: '#3b82f6',
                                                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                                        },
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        fontSize: '14px',
                                                        color: '#1f2937',
                                                        backgroundColor: state.isSelected
                                                            ? '#3b82f6'
                                                            : state.isFocused
                                                                ? '#f1f5f9'
                                                                : 'white',
                                                        '&:active': {
                                                            backgroundColor: '#e0e7ff',
                                                        },
                                                    }),

                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </FormGroup>
                        <Timetable
                            data={timetableData}
                            timeSlots={timeSlots}
                            viewMode={viewMode}
                            scheduleDescription={scheduleDescription}
                            selectedOption={selectedOption}
                            attendanceModalData={attendanceModalData}
                            setAttendanceModalData={setAttendanceModalData}
                            refreshData={() => fetchTimetableData('Applied', selectedCurrent)}
                        />
                        {isApplyDialogOpen && (
                            <>
                                <DialogOverlay onClick={() => {
                                    setIsApplyDialogOpen(false);
                                    setApplySemesterId('');
                                    setApplyScheduleId('');
                                    setApplyBeginDate(null);
                                    setApplyEndDate(null);
                                    setApplyDateError('');
                                    setForceAssign(false);
                                    setDatesInUse([]);
                                }} />
                                <Dialog>
                                    <SubHeading>
                                        + Thêm thời khóa biểu
                                    </SubHeading>
                                    <FormGroup1>
                                        <Label>Học kỳ</Label>
                                        <Select
                                            value={applySemesterId}
                                            onChange={(e) => {
                                                const newSemesterId = e.target.value;
                                                setApplySemesterId(newSemesterId);
                                                setApplyScheduleId('');
                                                setApplyDateError('');
                                                setDatesInUse([]);

                                                if (newSemesterId) {
                                                    getDatesInUse(token, newSemesterId)
                                                        .then(response => {

                                                            setDatesInUse(response.data_set || []);
                                                        })
                                                        .catch(err => {
                                                            showToast(`Lỗi khi lấy ngày đã sử dụng: ${err.message}`, 'error');
                                                        });
                                                }
                                            }}
                                        >
                                            <option value="">-- Chọn học kỳ --</option>
                                            {semesters.map((semester) => (
                                                <option key={semester.id} value={semester.id}>
                                                    {semester.semester_name} ({new Date(semester.start_date).toLocaleDateString('vi-VN')} - {new Date(semester.end_date).toLocaleDateString('vi-VN')})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup1>
                                    <FormGroup1>
                                        <Label>Mẫu thời khóa biểu</Label>
                                        <Select
                                            value={applyScheduleId}
                                            onChange={(e) => {

                                                setApplyScheduleId(e.target.value);
                                                setApplyDateError('');
                                            }}
                                            disabled={!applySemesterId}
                                        >
                                            <option value="">-- Chọn mẫu --</option>
                                            {(() => {
                                                const filteredTemplates = templates.filter(template => {
                                                    const match = Number(template.semester_id) === Number(applySemesterId);

                                                    return match;
                                                });

                                                return filteredTemplates.length > 0 ? (
                                                    filteredTemplates.map((template) => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.schedule_name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="" disabled>Không có mẫu nào cho học kỳ này</option>
                                                );
                                            })()}
                                        </Select>
                                    </FormGroup1>
                                    <FormGroup1>
                                        <Label>Ngày bắt đầu</Label>
                                        <DatePicker
                                            selected={applyBeginDate}
                                            onChange={(date) => {
                                                setApplyBeginDate(date);
                                                setApplyDateError('');
                                            }}
                                            minDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.start_date) : null}
                                            maxDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.end_date) : null}
                                            excludeDates={datesInUse.map(date => new Date(date))}
                                            disabled={!applySemesterId}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Chọn ngày bắt đầu"
                                            customInput={<Input />}
                                            className={!applySemesterId ? 'disabled-date' : ''}
                                        />
                                    </FormGroup1>
                                    <FormGroup1>
                                        <Label>Ngày kết thúc</Label>
                                        <DatePicker
                                            selected={applyEndDate}
                                            onChange={(date) => {
                                                setApplyEndDate(date);
                                                setApplyDateError('');
                                            }}
                                            minDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.start_date) : null}
                                            maxDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.end_date) : null}
                                            excludeDates={datesInUse.map(date => new Date(date))}
                                            disabled={!applySemesterId}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Chọn ngày kết thúc"
                                            customInput={<Input />}
                                            className={!applySemesterId ? 'disabled-date' : ''}
                                        />
                                    </FormGroup1>
                                    <FormGroup>
                                        <CheckboxLabel>
                                            <Checkbox
                                                type="checkbox"
                                                checked={forceAssign}
                                                onChange={(e) => setForceAssign(e.target.checked)}
                                            />
                                            Ép gán thời khóa biểu
                                        </CheckboxLabel>
                                    </FormGroup>
                                    {applyDateError && <DialogError>{applyDateError}</DialogError>}
                                    <DialogButtonGroup>
                                        <CancelButton onClick={() => {
                                            setIsApplyDialogOpen(false);
                                            setApplySemesterId('');
                                            setApplyScheduleId('');
                                            setApplyBeginDate(null);
                                            setApplyEndDate(null);
                                            setApplyDateError('');
                                            setForceAssign(false);
                                            setDatesInUse([]);
                                        }}>
                                            Hủy
                                        </CancelButton>
                                        <ButtonAdd onClick={handleApplySchedule} disabled={isLoading}>
                                            Lưu
                                        </ButtonAdd>
                                    </DialogButtonGroup>
                                </Dialog>
                            </>
                        )}
                        {isRemoveDialogOpen && (
                            <>
                                <DialogOverlay onClick={() => {
                                    setIsRemoveDialogOpen(false);
                                    setRemoveBeginDate('');
                                    setRemoveEndDate('');
                                    setRemoveDateError('');
                                }} />
                                <Dialog>
                                    <SubHeading>
                                        Xóa thời khóa biểu
                                    </SubHeading>
                                    <FormGroup1>
                                        <Label>Ngày bắt đầu</Label>
                                        <DatePicker
                                            selected={removeBeginDate}
                                            onChange={(date) => {
                                                setRemoveBeginDate(date);
                                            }}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Chọn ngày bắt đầu"
                                            customInput={<Input />}
                                            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                        />
                                    </FormGroup1>
                                    <FormGroup1>
                                        <Label>Ngày kết thúc</Label>
                                        <DatePicker
                                            selected={removeEndDate}
                                            onChange={(date) => {
                                                setRemoveEndDate(date);
                                            }}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Chọn ngày kết thúc"
                                            customInput={<Input />}
                                            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                        />
                                    </FormGroup1>
                                    {removeDateError && <DialogError>{removeDateError}</DialogError>}
                                    <DialogButtonGroup>
                                        <CancelButton onClick={() => {
                                            setIsRemoveDialogOpen(false);
                                            setRemoveBeginDate('');
                                            setRemoveEndDate('');
                                            setRemoveDateError('');
                                        }}>
                                            Hủy
                                        </CancelButton>
                                        <ButtonAdd onClick={handleRemoveTimeTable} disabled={isLoading}>
                                            Lưu
                                        </ButtonAdd>
                                    </DialogButtonGroup>
                                </Dialog>
                            </>
                        )}
                        {isHolidayDialogOpen && (
                            <DialogOverlay onClick={() => {
                                setIsHolidayDialogOpen(false);
                                setHolidayDate(null);
                                setMakeupDate(null);
                                setHolidayOperationType('Thêm');
                            }} />
                        )}
                        {isHolidayDialogOpen && (
                            <Dialog>
                                <SubHeading>
                                    Thêm/ xóa ngày nghỉ
                                </SubHeading>
                                <FormGroup1>
                                    <Label>Thao tác</Label>
                                    <Select
                                        value={holidayOperationType}
                                        onChange={(e) => setHolidayOperationType(e.target.value)}
                                        disabled={isMarkingHoliday}
                                    >
                                        <option value="Thêm">Thêm</option>
                                        <option value="Xóa">Xóa</option>
                                    </Select>
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Ngày nghỉ <span style={{ color: 'red' }}>*</span></Label>
                                    <DatePicker
                                        selected={holidayDate}
                                        onChange={date => setHolidayDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Chọn ngày nghỉ"
                                        customInput={<Input />}
                                        minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                    />
                                </FormGroup1>
                                {holidayOperationType === 'Thêm' && (
                                    <FormGroup1>
                                        <Label>Chọn ngày học bù</Label>
                                        <DatePicker
                                            selected={makeupDate}
                                            onChange={date => setMakeupDate(date)}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Không bắt buộc"
                                            customInput={<Input />}
                                            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                            isClearable
                                        />
                                    </FormGroup1>
                                )}
                                <DialogButtonGroup>
                                    <CancelButton onClick={() => {
                                        setIsHolidayDialogOpen(false);
                                        setHolidayDate(null);
                                        setMakeupDate(null);
                                        setHolidayOperationType('Thêm');
                                    }} disabled={isMarkingHoliday}>
                                        Hủy
                                    </CancelButton>
                                    <ButtonAdd
                                        onClick={async () => {
                                            if (!holidayDate) {
                                                showToast('Vui lòng chọn ngày nghỉ', 'error');
                                                return;
                                            }
                                            setIsMarkingHoliday(true);
                                            try {
                                                var resultData = await markAsHoliday(user.token, {
                                                    is_add: holidayOperationType === 'Thêm',
                                                    current_date: formatDate(holidayDate),
                                                    new_date: makeupDate ? formatDate(makeupDate) : null,
                                                });
                                                if (resultData.success) {
                                                    const operationText = holidayOperationType === 'Thêm' ? 'thêm' : 'xóa';
                                                    showToast(`Đã ${operationText} ngày nghỉ thành công`, 'success');
                                                    setIsHolidayDialogOpen(false);
                                                    setHolidayDate(null);
                                                    setMakeupDate(null);
                                                    setHolidayOperationType('Thêm');
                                                    fetchTimetableData('Applied', selectedCurrent);
                                                } else {
                                                    showToast(resultData.description, 'error');
                                                }
                                            } catch (err) {
                                                showToast(err.message || 'Thêm ngày nghỉ thất bại', 'error');
                                            } finally {
                                                setIsMarkingHoliday(false);
                                            }
                                        }}
                                        disabled={isMarkingHoliday}
                                    >
                                        Lưu
                                    </ButtonAdd>
                                </DialogButtonGroup>
                            </Dialog>
                        )}
                    </>
                )
            }
            {isMoveScheduleDialogOpen && (
                <>
                    <DialogOverlay onClick={() => {
                        setIsMoveScheduleDialogOpen(false);
                        setMoveScheduleType('All');
                        setMoveScheduleCode('');
                        setMoveScheduleCurrentDay('Monday');
                        setMoveScheduleNewDay('Monday');
                        setMoveScheduleNewTimeSlot('');
                    }} />
                    <Dialog>
                        <SubHeading>
                            Dời lịch
                        </SubHeading>
                        <FormGroup1>
                            <Label>Phạm vi điều chỉnh lịch</Label>
                            <Select
                                value={moveScheduleType}
                                onChange={(e) => {
                                    setMoveScheduleType(e.target.value);
                                    setMoveScheduleCode('');
                                }}
                                disabled={isMovingSchedule}
                            >
                                <option value="All">Tất cả</option>
                                <option value="Class">Lớp</option>
                                <option value="Teacher">Giáo viên</option>
                            </Select>
                        </FormGroup1>
                        {moveScheduleType !== 'All' && (
                            <FormGroup1>
                                <Label>Mã {moveScheduleType === 'Class' ? 'lớp' : 'giáo viên'}</Label>
                                <Select
                                    value={moveScheduleCode}
                                    onChange={(e) => setMoveScheduleCode(e.target.value)}
                                    disabled={isMovingSchedule}
                                >
                                    <option value="">-- Chọn --</option>
                                    {moveScheduleType === 'Class' &&
                                        classes.map((cls) => (
                                            <option key={cls.class_code} value={cls.class_code}>
                                                {cls.class_code}
                                            </option>
                                        ))}
                                    {moveScheduleType === 'Teacher' &&
                                        teachers.map((teacher) => (
                                            <option key={teacher.user_name} value={teacher.user_name}>
                                                {teacher.full_name}
                                            </option>
                                        ))}
                                </Select>
                            </FormGroup1>
                        )}
                        <FormGroup1>
                            <Label>Ngày hiện tại</Label>
                            <Select
                                value={moveScheduleCurrentDay}
                                onChange={(e) => setMoveScheduleCurrentDay(e.target.value)}
                                disabled={isMovingSchedule}
                            >
                                <option value="Monday">Thứ 2</option>
                                <option value="Tuesday">Thứ 3</option>
                                <option value="Wednesday">Thứ 4</option>
                                <option value="Thursday">Thứ 5</option>
                                <option value="Friday">Thứ 6</option>
                                <option value="Saturday">Thứ 7</option>
                                <option value="Sunday">Chủ nhật</option>
                            </Select>
                        </FormGroup1>
                        <FormGroup1>
                            <Label>Ngày mới</Label>
                            <Select
                                value={moveScheduleNewDay}
                                onChange={(e) => setMoveScheduleNewDay(e.target.value)}
                                disabled={isMovingSchedule}
                            >
                                <option value="Monday">Thứ 2</option>
                                <option value="Tuesday">Thứ 3</option>
                                <option value="Wednesday">Thứ 4</option>
                                <option value="Thursday">Thứ 5</option>
                                <option value="Friday">Thứ 6</option>
                                <option value="Saturday">Thứ 7</option>
                                <option value="Sunday">Chủ nhật</option>
                            </Select>
                        </FormGroup1>
                        <DialogButtonGroup>
                            <CancelButton onClick={() => {
                                setIsMoveScheduleDialogOpen(false);
                                setMoveScheduleType('All');
                                setMoveScheduleCode('');
                                setMoveScheduleCurrentDay('Monday');
                                setMoveScheduleNewDay('Monday');
                                setMoveScheduleNewTimeSlot('');
                            }} disabled={isMovingSchedule}>
                                Hủy
                            </CancelButton>
                            <ButtonAdd onClick={handleMoveSchedule} disabled={isMovingSchedule}>
                                {isMovingSchedule ? 'Đang xử lý...' : 'Xác nhận'}
                            </ButtonAdd>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
            {isMoveScheduleDetailDialogOpen && (
                <>
                    <DialogOverlay onClick={() => {
                        setIsMoveScheduleDetailDialogOpen(false);
                        setMoveScheduleDetailType('All');
                        setMoveScheduleDetailCode('');
                        setMoveScheduleDetailCurrentDate(null);
                        setMoveScheduleDetailNewDate(null);
                        setMoveScheduleDetailNewTimeSlot('');
                        setMoveScheduleDetailSelectedClass('');
                        setMoveScheduleDetailLessons([]);
                        setMoveScheduleDetailSelectedLessonId('');
                        setMoveScheduleDetailMoveType('Dời lịch');
                    }} />
                    <Dialog>
                        <SubHeading>
                            Dời lịch/ Dạy bù
                        </SubHeading>
                        <SubHeading>
                            <p style={{ color: 'red', fontSize: '12px' }}>
                                Lưu ý: Khi dời lịch, chỉ các tiết có trạng thái "Chưa diễn ra" và không rơi vào ngày lễ mới dời thành công.
                            </p>
                        </SubHeading>
                        <FormGroup1>
                            <Label>Thao tác</Label>
                            <Select
                                value={moveScheduleDetailMoveType}
                                onChange={(e) => setMoveScheduleDetailMoveType(e.target.value)}
                                disabled={isMovingScheduleDetail}
                            >
                                <option value="Dời lịch">Dời lịch</option>
                                <option value="Dạy bù">Dạy bù</option>
                            </Select>
                        </FormGroup1>
                        <FormGroup1>
                            <Label>Phạm vi điều chỉnh lịch</Label>
                            <Select
                                value={moveScheduleDetailType}
                                onChange={(e) => {
                                    setMoveScheduleDetailType(e.target.value);
                                    setMoveScheduleDetailCode('');
                                    setMoveScheduleDetailSelectedClass('');
                                    setMoveScheduleDetailLessons([]);
                                    setMoveScheduleDetailSelectedLessonId('');
                                    setMoveScheduleDetailNewTimeSlot('');
                                }}
                                disabled={isMovingScheduleDetail}
                            >
                                <option value="All">Tất cả</option>
                                <option value="Class">Lớp</option>
                                <option value="Teacher">Giáo viên</option>
                                <option value="Slot">Tiết</option>
                            </Select>
                        </FormGroup1>
                        {moveScheduleDetailType === 'Class' && (
                            <FormGroup1>
                                <Label>Mã lớp</Label>
                                <Select
                                    value={moveScheduleDetailCode}
                                    onChange={(e) => setMoveScheduleDetailCode(e.target.value)}
                                    disabled={isMovingScheduleDetail}
                                >
                                    <option value="">-- Chọn --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.class_code} value={cls.class_code}>
                                            {cls.class_code}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup1>
                        )}
                        {moveScheduleDetailType === 'Teacher' && (
                            <FormGroup1>
                                <Label>Mã giáo viên</Label>
                                <Select
                                    value={moveScheduleDetailCode}
                                    onChange={(e) => setMoveScheduleDetailCode(e.target.value)}
                                    disabled={isMovingScheduleDetail}
                                >
                                    <option value="">-- Chọn --</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.user_name} value={teacher.user_name}>
                                            {teacher.full_name}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup1>
                        )}
                        {moveScheduleDetailType === 'Slot' && (
                            <FormGroup1>
                                <Label>Mã lớp</Label>
                                <Select
                                    value={moveScheduleDetailSelectedClass}
                                    onChange={(e) => {
                                        setMoveScheduleDetailSelectedClass(e.target.value);
                                        setMoveScheduleDetailLessons([]);
                                        setMoveScheduleDetailSelectedLessonId('');
                                        setMoveScheduleDetailNewTimeSlot('');
                                    }}
                                    disabled={isMovingScheduleDetail}
                                >
                                    <option value="">-- Chọn lớp --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.class_code} value={cls.class_code}>
                                            {cls.class_code}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup1>
                        )}
                        <FormGroup1>
                            <Label>Ngày hiện tại</Label>
                            <DatePicker
                                selected={moveScheduleDetailCurrentDate}
                                onChange={(date) => {
                                    setMoveScheduleDetailCurrentDate(date);
                                    setMoveScheduleDetailLessons([]);
                                    setMoveScheduleDetailSelectedLessonId('');
                                    setMoveScheduleDetailNewTimeSlot('');
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày hiện tại"
                                disabled={isMovingScheduleDetail}
                                className="date-picker"
                                customInput={<Input />}
                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            />
                        </FormGroup1>
                        {moveScheduleDetailType === 'Slot' && moveScheduleDetailSelectedClass && moveScheduleDetailCurrentDate && (
                            <FormGroup1>
                                <Label>Tiết học hiện tại</Label>
                                <Select
                                    value={moveScheduleDetailSelectedLessonId}
                                    onChange={(e) => {
                                        const selectedLesson = moveScheduleDetailLessons.find(lesson => lesson.id === parseInt(e.target.value));
                                        setMoveScheduleDetailSelectedLessonId(e.target.value);
                                        if (selectedLesson) {
                                            setMoveScheduleDetailNewTimeSlot(selectedLesson.time_slot_id);
                                        }
                                    }}
                                    disabled={isMovingScheduleDetail}
                                >
                                    <option value="">-- Chọn tiết học --</option>
                                    {moveScheduleDetailLessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.class_code} - {lesson.subject_code} ({lesson.teacher_user_name}) - Tiết {lesson.time_slot_id}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup1>
                        )}
                        <FormGroup1>
                            <Label>Ngày mới</Label>
                            <DatePicker
                                selected={moveScheduleDetailNewDate}
                                onChange={(date) => setMoveScheduleDetailNewDate(date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày mới"
                                disabled={isMovingScheduleDetail}
                                className="date-picker"
                                customInput={<Input />}
                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            />
                        </FormGroup1>
                        {moveScheduleDetailType === 'Slot' && (
                            <FormGroup1>
                                <Label>Tiết học mới</Label>
                                <Select
                                    value={moveScheduleDetailNewTimeSlot}
                                    onChange={(e) => setMoveScheduleDetailNewTimeSlot(e.target.value)}
                                    disabled={isMovingScheduleDetail}
                                >
                                    <option value="">-- Chọn tiết --</option>
                                    {timeSlots.map((slot) => (
                                        <option key={slot.id} value={slot.id}>
                                            Tiết {slot.id}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup1>
                        )}
                        <DialogButtonGroup>
                            <CancelButton onClick={() => {
                                setIsMoveScheduleDetailDialogOpen(false);
                                setMoveScheduleDetailType('All');
                                setMoveScheduleDetailCode('');
                                setMoveScheduleDetailCurrentDate(null);
                                setMoveScheduleDetailNewDate(null);
                                setMoveScheduleDetailNewTimeSlot('');
                                setMoveScheduleDetailSelectedClass('');
                                setMoveScheduleDetailLessons([]);
                                setMoveScheduleDetailSelectedLessonId('');
                                setMoveScheduleDetailMoveType('Dời lịch');
                            }} disabled={isMovingScheduleDetail}>
                                Hủy
                            </CancelButton>
                            <ButtonAdd onClick={handleMoveScheduleDetail} disabled={isMovingScheduleDetail}>
                                {isMovingScheduleDetail ? 'Đang xử lý...' : 'Xác nhận'}
                            </ButtonAdd>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}

            {/* NEW: Combined modal for "Thêm mới" */}
            {isAddNewDialogOpen && (
                <>
                    <ModalOverlay onClick={() => {
                        setIsAddNewDialogOpen(false);

                        setAddNewType('Thời khóa biểu mới');
                        // Reset slot form data
                        setSelectedClassForSlot('');
                        setSelectedSubjectForSlot('');
                        setSelectedDateForSlot(null);
                        setSelectedTimeSlotForSlot('');
                        setSelectedTeacherForSlot('');
                        setClassSubjects([]);
                        setAvailableTeachersForSlot([]);
                    }} />
                    <Dialog>
                        <SubHeading>
                            Thêm mới
                        </SubHeading>

                        <FormGroup1>
                            <Label>Phạm vi</Label>
                            <Select
                                value={addNewType}
                                onChange={(e) => setAddNewType(e.target.value)}
                            >
                                <option value="Thời khóa biểu mới">Thời khóa biểu mới</option>
                                <option value="Tiết">Tiết</option>
                            </Select>
                        </FormGroup1>

                        {addNewType === 'Thời khóa biểu mới' ? (
                            <>
                                <FormGroup1>
                                    <Label>Học kỳ</Label>
                                    <Select
                                        value={applySemesterId}
                                        onChange={(e) => {
                                            const newSemesterId = e.target.value;
                                            setApplySemesterId(newSemesterId);
                                            setApplyScheduleId('');
                                            setApplyDateError('');
                                            setDatesInUse([]);

                                            if (newSemesterId) {
                                                getDatesInUse(token, newSemesterId)
                                                    .then(response => {
                                                        setDatesInUse(response.data_set || []);
                                                    })
                                                    .catch(err => {
                                                        showToast(`Lỗi khi lấy ngày đã sử dụng: ${err.message}`, 'error');
                                                    });
                                            }
                                        }}
                                    >
                                        <option value="">-- Chọn học kỳ --</option>
                                        {semesters.map((semester) => (
                                            <option key={semester.id} value={semester.id}>
                                                {semester.semester_name} ({new Date(semester.start_date).toLocaleDateString('vi-VN')} - {new Date(semester.end_date).toLocaleDateString('vi-VN')})
                                            </option>
                                        ))}
                                    </Select>
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Mẫu thời khóa biểu</Label>
                                    <Select
                                        value={applyScheduleId}
                                        onChange={(e) => {
                                            setApplyScheduleId(e.target.value);
                                            setApplyDateError('');
                                        }}
                                        disabled={!applySemesterId}
                                    >
                                        <option value="">-- Chọn mẫu --</option>
                                        {(() => {
                                            const filteredTemplates = templates.filter(template => {
                                                const match = Number(template.semester_id) === Number(applySemesterId);
                                                return match;
                                            });

                                            return filteredTemplates.length > 0 ? (
                                                filteredTemplates.map((template) => (
                                                    <option key={template.id} value={template.id}>
                                                        {template.schedule_name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>Không có mẫu nào cho học kỳ này</option>
                                            );
                                        })()}
                                    </Select>
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Ngày bắt đầu</Label>
                                    <DatePicker
                                        selected={applyBeginDate}
                                        onChange={(date) => {
                                            setApplyBeginDate(date);
                                            setApplyDateError('');
                                        }}
                                        minDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.start_date) : null}
                                        maxDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.end_date) : null}
                                        excludeDates={datesInUse.map(date => new Date(date))}
                                        disabled={!applySemesterId}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Chọn ngày bắt đầu"
                                        customInput={<Input />}
                                        className={!applySemesterId ? 'disabled-date' : ''}
                                    />
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Ngày kết thúc</Label>
                                    <DatePicker
                                        selected={applyEndDate}
                                        onChange={(date) => {
                                            setApplyEndDate(date);
                                            setApplyDateError('');
                                        }}
                                        minDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.start_date) : null}
                                        maxDate={applySemesterId ? new Date(semesters.find(s => s.id === applySemesterId)?.end_date) : null}
                                        excludeDates={datesInUse.map(date => new Date(date))}
                                        disabled={!applySemesterId}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Chọn ngày kết thúc"
                                        customInput={<Input />}
                                        className={!applySemesterId ? 'disabled-date' : ''}
                                    />
                                </FormGroup1>
                                <FormGroup>
                                    <CheckboxLabel>
                                        <Checkbox
                                            type="checkbox"
                                            checked={forceAssign}
                                            onChange={(e) => setForceAssign(e.target.checked)}
                                        />
                                        Ép gán thời khóa biểu
                                    </CheckboxLabel>
                                </FormGroup>
                                {applyDateError && <DialogError>{applyDateError}</DialogError>}
                                <DialogButtonGroup>
                                    <CancelButton onClick={() => {
                                        setIsAddNewDialogOpen(false);
                                        setApplySemesterId('');
                                        setApplyScheduleId('');
                                        setApplyBeginDate(null);
                                        setApplyEndDate(null);
                                        setApplyDateError('');
                                        setForceAssign(false);
                                        setDatesInUse([]);
                                    }}>
                                        Hủy
                                    </CancelButton>
                                    <ButtonAdd onClick={handleApplySchedule} disabled={isLoading}>
                                        Lưu
                                    </ButtonAdd>
                                </DialogButtonGroup>
                            </>
                        ) : (
                            <>
                                <FormGroup1>
                                    <Label>Lớp</Label>
                                    <Select
                                        value={selectedClassForSlot}
                                        onChange={(e) => handleClassChangeForSlot(e.target.value)}
                                        disabled={isLoadingClassSubjects}
                                    >
                                        <option value="">-- Chọn lớp --</option>
                                        {classes.map((cls) => (
                                            <option key={cls.class_code} value={cls.class_code}>
                                                {cls.class_code}
                                            </option>
                                        ))}
                                    </Select>
                                </FormGroup1>

                                {selectedClassForSlot && (
                                    <FormGroup1>
                                        <Label>Môn học</Label>
                                        <Select
                                            value={selectedSubjectForSlot}
                                            onChange={(e) => handleSubjectChangeForSlot(e.target.value)}
                                            disabled={isLoadingClassSubjects}
                                        >
                                            <option value="">-- Chọn môn học --</option>
                                            {classSubjects.map((subject) => (
                                                <option key={subject.subject_code} value={subject.subject_code}>
                                                    {subject.subject_code}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup1>
                                )}

                                {selectedSubjectForSlot && (
                                    <FormGroup1>
                                        <Label>Ngày</Label>
                                        <DatePicker
                                            selected={selectedDateForSlot}
                                            onChange={handleDateChangeForSlot}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Chọn ngày"
                                            className="date-picker"
                                            customInput={<Input />}
                                            minDate={new Date()}
                                        />
                                    </FormGroup1>
                                )}

                                {selectedDateForSlot && (
                                    <FormGroup1>
                                        <Label>Tiết học</Label>
                                        <Select
                                            value={selectedTimeSlotForSlot}
                                            onChange={(e) => handleTimeSlotChangeForSlot(e.target.value)}
                                        >
                                            <option value="">-- Chọn tiết --</option>
                                            {timeSlots.map((slot) => (
                                                <option key={slot.id} value={slot.id}>
                                                    Tiết {slot.id}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup1>
                                )}

                                {selectedTimeSlotForSlot && (
                                    <FormGroup1>
                                        <Label>Giáo viên</Label>

                                        <Select
                                            value={selectedTeacherForSlot}
                                            onChange={(e) => setSelectedTeacherForSlot(e.target.value)}
                                            disabled={isLoadingTeachersForSlot}
                                            isSearchable={true}
                                        >
                                            <option value="">-- Chọn giáo viên --</option>
                                            {availableTeachersForSlot.map((teacher) => (
                                                <option key={teacher.user_name} value={teacher.user_name}>
                                                    {teacher.full_name} ({teacher.user_name}) {teacher.is_current_teacher ? "(GV bộ môn)" : ""}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup1>
                                )}

                                <DialogButtonGroup>
                                    <CancelButton onClick={() => {
                                        setIsAddNewDialogOpen(false);
                                        setSelectedClassForSlot('');
                                        setSelectedSubjectForSlot('');
                                        setSelectedDateForSlot(null);
                                        setSelectedTimeSlotForSlot('');
                                        setSelectedTeacherForSlot('');
                                        setClassSubjects([]);
                                        setAvailableTeachersForSlot([]);
                                    }}>
                                        Hủy
                                    </CancelButton>
                                    <ButtonAdd onClick={handleAddBySlot} disabled={isAddingBySlot}>
                                        {isAddingBySlot ? 'Đang xử lý...' : 'Thêm tiết học'}
                                    </ButtonAdd>
                                </DialogButtonGroup>
                            </>
                        )}
                    </Dialog>
                </>
            )}
        </Container >
    );
}