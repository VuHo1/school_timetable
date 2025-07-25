import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
import '../../styles/date.css'
import { FaPlus, FaTrash, FaEdit, FaSpinner, FaCalendarAlt, FaArrowLeft, FaArrowRight, FaTimes, FaCheck, FaEllipsisH } from 'react-icons/fa';
import {
    fetchBaseSchedules,
    fetchScheduleDetails,
    fetchTimeSlots,
    generateSchedule,
    fetchClasses,
    fetchAvailableTeachers,
    fetchTimeTable,
    fetchMyTimeTable,
    deleteBaseSchedule,
    updateBaseSchedule,
    addSchedule,
    removeTimeTable,
    fetchSemesters,
    addSemester,
    removeSemester,
    getDatesInUse,
} from '../../api';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-in;

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
  gap: 24px;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const TemplateListWrapper = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const SubHeading = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
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
  background: #10b981;
  &:hover {
    background: #059669;
  }
`;

const ButtonDelete = styled(Button)`
  background: #ef4444;
  &:hover {
    background: #dc2626;
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
  background: #e5e7eb;
  color: #1f2937;
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
  margin-bottom: 20px;
`;

const ModalEntry = styled.div`
  padding: 12px;
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

const CloseButton = styled(Button)`
  background: #ef4444;
  &:hover {
    background: #dc2626;
  }
`;

const TemplateList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TemplateItem = styled.li.withConfig({
    shouldForwardProp: (prop) => !['isOnUse', 'isSelected'].includes(prop)
})`
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  background: ${props => props.isSelected ? '#d1fae5' : props.isOnUse ? '#ecfdf5' : 'white'};
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: ${props => props.isSelected ? '#d1fae5' : '#eff6ff'};
    transform: translateY(-2px);
  }
`;

const TimetableWrapper = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  border: 1px solid #e5e7eb;
  padding: 12px;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
  color: #1f2937;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  border: 1px solid #e5e7eb;
  padding: 12px;
  vertical-align: top;
`;

const Entry = styled.div`
  margin-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px;
  border-radius: 6px;
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

const SlotModal = ({ entries, onClose, viewMode }) => (
    <>
        <ModalOverlay onClick={onClose} />
        <Modal>
            <SubHeading>
                <FaCalendarAlt /> Thông tin chi tiết
            </SubHeading>
            <ModalContent>
                {entries.map((entry) => (
                    <ModalEntry key={entry.id}>
                        <p><b>Lớp:</b> {entry.class_code}</p>
                        <p><b>Mã môn:</b> {entry.subject_code}</p>
                        <p><b>Môn:</b> {entry.subject_name}</p>
                        <p><b>Giáo viên:</b> {entry.teacher_user_name}</p>
                        <p><b>Phòng:</b> {entry.room_code}</p>
                        <p><b>Tiết:</b> {entry.time_slot_id}</p>
                        {viewMode !== 'Base' && (
                            <>
                                <p><b>Từ:</b> {entry.start_time} <b>đến</b> {entry.end_time}</p>
                                <p><b>Phản hồi:</b>
                                    {' '}
                                    {entry.feedback && entry.feedback.trim() !== ''
                                        ? entry.feedback
                                        : 'Chưa có phản hồi'}
                                </p>
                                <p><b>Trạng thái:</b> {entry.status}</p>
                                <p style={{ color: entry.is_holiday ? 'red' : 'green' }}>
                                    <b>{entry.is_holiday ? 'Ngày lễ' : 'Ngày thường'}</b>
                                </p>
                            </>
                        )}
                    </ModalEntry>
                ))}
            </ModalContent>
            <DialogButtonGroup>
                <CloseButton onClick={onClose}>
                    <FaTimes /> Đóng
                </CloseButton>
            </DialogButtonGroup>
        </Modal>
    </>
);

const SemesterList = ({ semesters, onDelete, setSemesters, token, showToast }) => {
    const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');
    const [newSemesterStartDate, setNewSemesterStartDate] = useState('');
    const [newSemesterEndDate, setNewSemesterEndDate] = useState('');
    const [semesterError, setSemesterError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAddSemester = async () => {
        if (!newSemesterName.trim()) {
            setSemesterError('Tên học kỳ không được để trống');
            showToast('Tên học kỳ không được để trống', 'error');
            return;
        }
        if (!newSemesterStartDate || !newSemesterEndDate) {
            setSemesterError('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
            showToast('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc', 'error');
            return;
        }
        if (new Date(newSemesterStartDate) > new Date(newSemesterEndDate)) {
            setSemesterError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
            showToast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 'error');
            return;
        }

        try {
            setIsGenerating(true);
            const response = await addSemester(token, {
                semester_name: newSemesterName,
                start_date: new Date(newSemesterStartDate).toISOString().split('T')[0],
                end_date: new Date(newSemesterEndDate).toISOString().split('T')[0],
            });
            showToast(response.description, response.success ? 'success' : 'error');
            if (response.success) {
                const newSemesters = await fetchSemesters(token);
                setSemesters(newSemesters);
                setIsAddSemesterDialogOpen(false);
                setNewSemesterName('');
                setNewSemesterStartDate('');
                setNewSemesterEndDate('');
                setSemesterError('');
            } else {
                setSemesterError(response.description);
            }
        } catch (err) {
            const errorMessage = err.message || 'Lỗi khi tạo học kỳ';
            setSemesterError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            <ButtonAdd onClick={() => setIsAddSemesterDialogOpen(true)} disabled={isGenerating}>
                <FaPlus /> Tạo học kỳ mới
            </ButtonAdd>
            <SubHeading>
                <FaCalendarAlt /> Danh sách học kỳ
            </SubHeading>
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
                            <FaPlus /> Tạo học kỳ mới
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
                            <Input
                                type="date"
                                value={newSemesterStartDate}
                                onChange={(e) => setNewSemesterStartDate(e.target.value)}
                                disabled={isGenerating}
                            />
                        </FormGroup1>
                        <FormGroup1>
                            <Label>Ngày kết thúc</Label>
                            <Input
                                type="date"
                                value={newSemesterEndDate}
                                onChange={(e) => setNewSemesterEndDate(e.target.value)}
                                disabled={isGenerating}
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
                                <FaTimes /> Hủy
                            </CancelButton>
                            <Button onClick={handleAddSemester} disabled={isGenerating}>
                                <FaCheck /> Tạo
                            </Button>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
        </div>
    );
};

const ScheduleTemplateList = ({ templates, onSelect, onGenerate, token, selectedScheduleId }) => {
    const { showToast } = useToast();
    const [option, setOption] = useState('Default');
    const [useClassConfig, setUseClassConfig] = useState(true);
    const [scheduleName, setScheduleName] = useState('');
    const [semesterId, setSemesterId] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editScheduleId, setEditScheduleId] = useState(null);
    const [editScheduleName, setEditScheduleName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);

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
    }, [token, showToast]);

    const handleGenerate = async () => {
        if (!semesterId) {
            setError('Vui lòng chọn học kỳ');
            showToast('Vui lòng chọn học kỳ', 'error');
            return;
        }
        setIsGenerating(true);
        try {
            await generateSchedule(token, {
                schedule_name: scheduleName.trim(),
                semester_id: semesterId,
                option,
                use_class_config: useClassConfig,
            });
            showToast('Tạo mẫu mới thành công', 'success');
            const newTemplates = await fetchBaseSchedules(token);
            onGenerate(newTemplates);
            setError(null);
            setIsDialogOpen(false);
            setScheduleName('');
            setSemesterId('');
        } catch (err) {
            setError(err.message);
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
            setError(err.message);
            showToast(`Lỗi: ${err.message}`, 'error');
        }
    };

    const toggleDropdown = (scheduleId) => {
        setDropdownOpenId(dropdownOpenId === scheduleId ? null : scheduleId);
    };

    return (
        <TemplateListWrapper>
            <SubHeading>
                <FaCalendarAlt /> Mẫu thời khóa biểu
            </SubHeading>
            {error && <ErrorMessage><FaTimes /> {error}</ErrorMessage>}
            <Button onClick={() => setIsDialogOpen(true)} disabled={isGenerating}>
                <FaPlus /> Tạo mẫu thời khóa biểu mới
            </Button>
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
                            <FaPlus /> Tạo mẫu thời khóa biểu mới
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
                            <div>
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
                            </div>
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
                                <FaTimes /> Hủy
                            </CancelButton>
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                                <FaCheck /> Tạo
                            </Button>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
            {isEditDialogOpen && (
                <>
                    <DialogOverlay onClick={() => setIsEditDialogOpen(false)} />
                    <Dialog>
                        <SubHeading>
                            <FaEdit /> Đổi tên thời khóa biểu mẫu
                        </SubHeading>
                        <Input
                            type="text"
                            value={editScheduleName}
                            onChange={(e) => setEditScheduleName(e.target.value)}
                            placeholder="Nhập tên thời khóa biểu"
                        />
                        <DialogButtonGroup>
                            <CancelButton onClick={() => setIsEditDialogOpen(false)}>
                                <FaTimes /> Hủy
                            </CancelButton>
                            <Button onClick={handleUpdate}>
                                <FaCheck /> Cập nhật
                            </Button>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
            <TemplateList>
                {templates.map((template) => (
                    <TemplateItem
                        key={template.id}
                        isOnUse={template.is_on_use}
                        isSelected={template.id === selectedScheduleId}
                        onClick={() => onSelect(template.id)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <span>
                                {template.schedule_name} {template.is_on_use && '(Đang áp dụng)'}
                            </span>
                            <DropdownButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(template.id);
                                }}
                            >
                                <FaEllipsisH />
                            </DropdownButton>
                            {dropdownOpenId === template.id && (
                                <DropdownMenu>
                                    <DropdownItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(template.id, template.schedule_name);
                                        }}
                                    >
                                        <FaEdit /> Đổi tên
                                    </DropdownItem>
                                    <DropdownItem
                                        danger
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(template.id);
                                        }}
                                    >
                                        <FaTrash /> Xóa
                                    </DropdownItem>
                                </DropdownMenu>
                            )}
                        </div>
                    </TemplateItem>
                ))}
            </TemplateList>
        </TemplateListWrapper>
    );
};

const Timetable = ({ data, timeSlots, viewMode, scheduleDescription, selectedOption }) => {
    const [modalEntries, setModalEntries] = useState(null);
    const dayOfWeekMap = {
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
        7: 'Chủ nhật'
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
                { id: 7, label: 'Chủ nhật' }
            ];
        }

        if (selectedOption === 'Daily') {
            const validDetails = details.filter(entry => entry.date && typeof entry.day_of_week === 'number' && entry.day_of_week >= 1 && entry.day_of_week <= 7);
            if (validDetails.length === 0) {
                console.log('No valid entries for Daily mode');
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
            { id: 7, label: 'Chủ nhật', date: null }
        ];
        const validDetails = details.filter(entry => entry.date && typeof entry.day_of_week === 'number' && entry.day_of_week >= 1 && entry.day_of_week <= 7);
        const uniqueDates = [...new Set(validDetails.map(entry => entry.date.split('T')[0]))].sort();
        console.log('Weekly uniqueDates:', uniqueDates);

        uniqueDates.forEach(date => {
            const entry = validDetails.find(e => e.date.split('T')[0] === date);
            if (entry && entry.day_of_week >= 1 && entry.day_of_week <= 7) {
                days[entry.day_of_week - 1].date = date;
                days[entry.day_of_week - 1].label = `${dayOfWeekMap[entry.day_of_week] || entry.day_of_week_str} (${new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`
            }
        });
        return days;
    };

    const dateColumns = getDateColumns(data);

    return (
        <TimetableWrapper>
            <SubHeading>
                Thời khóa biểu {viewMode === 'Applied' ? `đang áp dụng` : viewMode === 'Personal' ? `của tôi` : 'mẫu'}
            </SubHeading>
            {data.length === 0 && (
                <InfoMessage>
                    Không có lịch học : {scheduleDescription}.
                </InfoMessage>
            )}
            {data.length > 0 && timeSlots.length > 0 && dateColumns.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <Th>Tiết học</Th>
                            {dateColumns.map((col) => (
                                <Th key={col.date || col.id}>{col.label}</Th>
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
                                        <Td key={col.date || col.id}>
                                            {displayedEntries.map((entry) => (
                                                <Entry
                                                    key={entry.id}
                                                    onClick={() => setModalEntries([entry])}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <p>Lớp: {entry.class_code}</p>
                                                    <p>GV: {entry.teacher_user_name}</p>
                                                </Entry>
                                            ))}
                                            {entries.length > maxDisplay && (
                                                <Button
                                                    onClick={() => setModalEntries(entries)}
                                                    style={{ marginTop: '8px', fontSize: '12px', padding: '4px 8px' }}
                                                >
                                                    +{entries.length - maxDisplay} Xem thêm
                                                </Button>
                                            )}
                                        </Td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            {modalEntries && (
                <SlotModal entries={modalEntries} onClose={() => setModalEntries(null)} viewMode={viewMode} />
            )}
        </TimetableWrapper>
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

    const token = user?.token;

    useEffect(() => {
        if (!token || loading) return;

        console.log('[useEffect] Triggered with viewMode:', viewMode, 'selectedCurrent:', selectedCurrent);
        const fetchData = async () => {
            try {
                setIsLoading(true);
                if (viewMode === 'Semesters') {
                    const semestersData = await fetchSemesters(token);
                    setSemesters(semestersData);
                } else {
                    const templatesData = await fetchBaseSchedules(token);
                    console.log('[fetchBaseSchedules] Templates:', templatesData);
                    setTemplates(templatesData);
                    const timeSlotsData = await fetchTimeSlots(token);
                    setTimeSlots(timeSlotsData);
                    const classesData = await fetchClasses(token);
                    setClasses(classesData.data_set || []);
                    const teachersData = await fetchAvailableTeachers(token);
                    setTeachers(teachersData);
                    const semestersData = await fetchSemesters(token);
                    setSemesters(semestersData);
                    if (viewMode !== 'Base') {
                        await fetchTimetableData(viewMode, selectedCurrent);
                    }
                }
            } catch (err) {
                console.error('[useEffect] Error:', err);
                setError(err.message);
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token, loading, viewMode]);

    const fetchTimetableData = async (mode, current) => {
        if (!token || isLoading) {
            console.log('[fetchTimetableData] Skipped: token missing or loading');
            return;
        }

        try {
            setIsLoading(true);
            const params = { option: selectedOption, current };
            if (mode === 'Applied' && appliedType !== 'All' && appliedCode) {
                params.type = appliedType;
                params.code = appliedCode;
            }
            console.log(`[fetchTimetableData] (${mode}, current=${current}) Params:`, params);
            const response = await (mode === 'Applied'
                ? fetchTimeTable(token, params)
                : fetchMyTimeTable(token, params));
            console.log(`[fetchTimetableData] (${mode}, current=${current}) Response:`, response);

            setTimetableData(response.data_set || []);
            setScheduleDescription(response.description || 'Không có mô tả');
            setPagination({
                current: response.pagination?.current || current,
                last: response.pagination?.last || 1,
                next: response.pagination?.next ?? null,
                previous: response.pagination?.previous ?? null,
                total: response.pagination?.total || 0
            });
            console.log(`[fetchTimetableData] (${mode}, current=${current}) State updated:`, {
                timetableData: response.data_set?.length || 0,
                scheduleDescription: response.description,
                pagination
            });
            setError(null);
        } catch (err) {
            console.error(`[fetchTimetableData] (${mode}, current=${current}) Error:`, err);
            setError(err.message);
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
            console.log(`[fetchScheduleDetails] (scheduleId=${scheduleId}) Params:`, params);
            const details = await fetchScheduleDetails(token, scheduleId, baseCode || null, baseType);
            setScheduleDetails(details || []);
            setScheduleDescription('');
            setError(null);
        } catch (err) {
            console.error('[fetchScheduleDetails] Error:', err);
            setError(err.message);
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
                console.log(`[handleBaseTypeChange] Fetching for scheduleId=${selectedScheduleId}, params:`, params);
                const details = await fetchScheduleDetails(token, selectedScheduleId, '', newType);
                setScheduleDetails(details || []);
                setScheduleDescription('');
                setError(null);
            } catch (err) {
                console.error('[handleBaseTypeChange] Error:', err);
                setError(err.message);
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAppliedTypeChange = async (newType) => {
        if (newType === appliedType) return;
        console.log('[handleAppliedTypeChange] Changing type to:', newType);
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
                console.log(`[handleAppliedTypeChange] Fetching for ${viewMode}, params:`, params);
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
                console.log('[handleAppliedTypeChange] State updated:', {
                    timetableData: response.data_set?.length || 0,
                    scheduleDescription: response.description
                });
                setError(null);
            } catch (err) {
                console.error('[handleAppliedTypeChange] Error:', err);
                setError(err.message);
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
        console.log('[handleAppliedCodeChange] Changing code to:', newCode);
        setAppliedCode(newCode);
        if (viewMode !== 'Base' && appliedType !== 'All') {
            try {
                setIsLoading(true);
                const params = { option: selectedOption, current: selectedCurrent };
                if (viewMode === 'Applied' && newCode) {
                    params.type = appliedType;
                    params.code = newCode;
                }
                console.log(`[handleAppliedCodeChange] Fetching for ${viewMode}, params:`, params);
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
                console.log('[handleAppliedCodeChange] State updated:', {
                    timetableData: response.data_set?.length || 0,
                    scheduleDescription: response.description
                });
                setError(null);
            } catch (err) {
                console.error('[handleAppliedCodeChange] Error:', err);
                setError(err.message);
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
        console.log('[handleOptionChange] Changing option to:', newOption);
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
                console.log(`[handleOptionChange] Fetching for ${viewMode}, params:`, params);
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
                console.log('[handleOptionChange] State updated:', {
                    timetableData: response.data_set?.length || 0,
                    scheduleDescription: response.description
                });
                setError(null);
            } catch (err) {
                console.error('[handleOptionChange] Error:', err);
                setError(err.message);
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
        console.log('[handlePrevPeriod] New current:', newCurrent);
        setSelectedCurrent(newCurrent);
        if (viewMode !== 'Base') {
            await fetchTimetableData(viewMode, newCurrent);
        }
    };

    const handleNextPeriod = async () => {
        if (isLoading) return;
        const newCurrent = selectedCurrent + 1;
        console.log('[handleNextPeriod] New current:', newCurrent);
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
    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const handleApplySchedule = async () => {
        if (!applySemesterId) {
            setApplyDateError('Vui lòng chọn học kỳ');
            console.log('[handleApplySchedule] Error: No semester selected');
            return;
        }
        if (!applyScheduleId) {
            setApplyDateError('Vui lòng chọn mẫu thời khóa biểu');
            console.log('[handleApplySchedule] Error: No schedule selected');
            return;
        }
        if (!applyBeginDate || !applyEndDate) {
            setApplyDateError('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
            console.log('[handleApplySchedule] Error: Missing begin or end date');
            return;
        }
        if (applyBeginDate > applyEndDate) {
            setApplyDateError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
            console.log('[handleApplySchedule] Error: Begin date after end date', {
                applyBeginDate: formatDate(applyBeginDate),
                applyEndDate: formatDate(applyEndDate),
            });
            return;
        }
        const usedDates = datesInUse.map(date => new Date(date.split('T')[0]));
        if (
            usedDates.some(date => date.toISOString().split('T')[0] === formatDate(applyBeginDate)) ||
            usedDates.some(date => date.toISOString().split('T')[0] === formatDate(applyEndDate))
        ) {
            setApplyDateError('Ngày bắt đầu hoặc ngày kết thúc đã có lịch, vui lòng chọn ngày khác');
            console.log('[handleApplySchedule] Error: Dates already in use', {
                applyBeginDate: formatDate(applyBeginDate),
                applyEndDate: formatDate(applyEndDate),
                usedDates: usedDates.map(date => date.toISOString().split('T')[0]),
            });
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
            console.log('[handleApplySchedule] Sending payload to addSchedule:', payload);
            const response = await addSchedule(token, payload);
            console.log('[handleApplySchedule] API response:', response);
            showToast(response.description, 'success');
            setIsApplyDialogOpen(false);
            setApplySemesterId('');
            setApplyScheduleId('');
            setApplyBeginDate(null);
            setApplyEndDate(null);
            setApplyDateError('');
            setForceAssign(false);
            setDatesInUse([]);
            await fetchTimetableData('Applied', selectedCurrent);
        } catch (err) {
            setApplyDateError(err.message);
            console.error('[handleApplySchedule] Error:', err.message);
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveTimeTable = async () => {
        if (!removeBeginDate || !removeEndDate) {
            setRemoveDateError('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
            return;
        }
        if (new Date(removeBeginDate) > new Date(removeEndDate)) {
            setRemoveDateError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
            return;
        }
        try {
            setIsLoading(true);
            const response = await removeTimeTable(token, {
                begin_date: new Date(removeBeginDate).toISOString(),
                end_date: new Date(removeEndDate).toISOString(),
            });
            showToast(response.description, 'success');
            setIsRemoveDialogOpen(false);
            setRemoveBeginDate('');
            setRemoveEndDate('');
            setRemoveDateError('');
            await fetchTimetableData('Applied', selectedCurrent);
        } catch (err) {
            setRemoveDateError(err.message);
            showToast(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return <Container>Đang tải...</Container>;
    }

    if (!token) {
        return <Container>Vui lòng đăng nhập để xem thời khóa biểu.</Container>;
    }

    return (
        <Container>
            <Heading>
                <FaCalendarAlt /> Quản lý thời khóa biểu
            </Heading>
            {error && <ErrorMessage><FaTimes /> {error}</ErrorMessage>}
            {isLoading && <LoadingMessage><FaSpinner className="animate-spin" /> Đang tải...</LoadingMessage>}
            <FormGroup>
                <Button onClick={() => handleViewMode('Base')}>
                    <FaCalendarAlt /> Mẫu thời khóa biểu
                </Button>
                <Button onClick={() => handleViewMode('Applied')}>
                    <FaCalendarAlt /> Thời khóa biểu đang áp dụng
                </Button>
                <Button onClick={() => handleViewMode('Personal')}>
                    <FaCalendarAlt /> Thời khóa biểu của tôi
                </Button>
                <Button onClick={() => handleViewMode('Semesters')}>
                    <FaCalendarAlt /> Học kỳ
                </Button>
            </FormGroup>
            {viewMode === 'Base' && (
                <>
                    <FormGroup>
                        <div>
                            <Select value={baseType} onChange={(e) => handleBaseTypeChange(e.target.value)}>
                                <option value="All">Tất cả</option>
                                <option value="Class">Lớp</option>
                                <option value="Teacher">Giáo viên</option>
                            </Select>
                        </div>
                        {baseType !== 'All' && (
                            <div>
                                <Select
                                    value={baseCode}
                                    onChange={async (e) => {
                                        const newCode = e.target.value;
                                        console.log('[baseCodeSelect] Changing code to:', newCode);
                                        setBaseCode(newCode);
                                        if (selectedScheduleId && newCode) {
                                            try {
                                                setIsLoading(true);
                                                const params = { code: newCode, type: baseType };
                                                console.log(`[baseCodeSelect] Fetching for scheduleId=${selectedScheduleId}, params:`, params);
                                                const details = await fetchScheduleDetails(token, selectedScheduleId, newCode, baseType);
                                                setScheduleDetails(details || []);
                                                setScheduleDescription('');
                                                setError(null);
                                            } catch (err) {
                                                console.error('[baseCodeSelect] Error:', err);
                                                setError(err.message);
                                                showToast(`Lỗi: ${err.message}`, 'error');
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }
                                    }}
                                >
                                    <option value="">-- Chọn --</option>
                                    {baseType === 'Class' &&
                                        classes.map((cls) => (
                                            <option key={cls.class_code} value={cls.class_code}>
                                                {cls.class_code}
                                            </option>
                                        ))}
                                    {baseType === 'Teacher' &&
                                        teachers.map((teacher) => (
                                            <option key={teacher.user_name} value={teacher.user_name}>
                                                {teacher.user_name}
                                            </option>
                                        ))}
                                </Select>
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
                        />
                        {selectedScheduleId && (
                            <Timetable
                                data={scheduleDetails}
                                timeSlots={timeSlots}
                                viewMode={viewMode}
                                scheduleDescription={scheduleDescription}
                                selectedOption={selectedOption}
                            />
                        )}
                    </Grid>
                </>
            )}
            {viewMode === 'Semesters' && (
                <SemesterList
                    semesters={semesters}
                    onDelete={handleDeleteSemester}
                    setSemesters={setSemesters}
                    token={token}
                    showToast={showToast}
                />
            )}
            {(viewMode === 'Applied' || viewMode === 'Personal') && (
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
                                <ButtonAdd onClick={() => {
                                    console.log('[ApplyDialog] Opening dialog. Semesters:', semesters, 'Templates:', templates);
                                    setIsApplyDialogOpen(true);
                                }} disabled={isLoading}>
                                    <FaPlus /> Thêm thời khóa biểu
                                </ButtonAdd>
                                <ButtonDelete onClick={() => setIsRemoveDialogOpen(true)} disabled={isLoading}>
                                    <FaTrash /> Xóa thời khóa biểu
                                </ButtonDelete>
                            </>
                        )}
                        {viewMode === 'Applied' && (
                            <>
                                <div>
                                    <Select value={appliedType} onChange={(e) => handleAppliedTypeChange(e.target.value)}>
                                        <option value="All">Tất Cả</option>
                                        <option value="Class">Lớp</option>
                                        <option value="Teacher">Giáo Viên</option>
                                    </Select>
                                </div>
                                {appliedType !== 'All' && (
                                    <div>
                                        <Select
                                            value={appliedCode}
                                            onChange={(e) => handleAppliedCodeChange(e.target.value)}
                                        >
                                            <option value="">-- Chọn --</option>
                                            {appliedType === 'Class' &&
                                                classes.map((cls) => (
                                                    <option key={cls.class_code} value={cls.class_code}>
                                                        {cls.class_code}
                                                    </option>
                                                ))}
                                            {appliedType === 'Teacher' &&
                                                teachers.map((teacher) => (
                                                    <option key={teacher.user_name} value={teacher.user_name}>
                                                        {teacher.user_name}
                                                    </option>
                                                ))}
                                        </Select>
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
                                    <FaPlus /> Thêm thời khóa biểu
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
                                            console.log('[ApplyDialog] Selected semesterId:', newSemesterId, 'Type:', typeof newSemesterId, 'Semesters:', semesters, 'Templates:', templates);
                                            if (newSemesterId) {
                                                getDatesInUse(token, newSemesterId)
                                                    .then(response => {
                                                        console.log('[ApplyDialog] Dates in use:', response.data_set);
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
                                            console.log('[ApplyDialog] Selected scheduleId:', e.target.value);
                                            setApplyScheduleId(e.target.value);
                                            setApplyDateError('');
                                        }}
                                        disabled={!applySemesterId}
                                    >
                                        <option value="">-- Chọn mẫu --</option>
                                        {(() => {
                                            const filteredTemplates = templates.filter(template => {
                                                const match = Number(template.semester_id) === Number(applySemesterId);
                                                console.log(`[ApplyDialog] Template ${template.id} semester_id: ${template.semester_id} (type: ${typeof template.semester_id}), applySemesterId: ${applySemesterId} (type: ${typeof applySemesterId}), match: ${match}`);
                                                return match;
                                            });
                                            console.log('[ApplyDialog] Filtered templates:', filteredTemplates);
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
                                        <FaTimes /> Hủy
                                    </CancelButton>
                                    <Button onClick={handleApplySchedule} disabled={isLoading}>
                                        <FaCheck /> Áp dụng
                                    </Button>
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
                                    <FaTrash /> Xóa thời khóa biểu đang áp dụng
                                </SubHeading>
                                <FormGroup1>
                                    <Label>Ngày bắt đầu</Label>
                                    <Input
                                        type="date"
                                        value={removeBeginDate}
                                        onChange={(e) => {
                                            setRemoveBeginDate(e.target.value);
                                            setRemoveDateError('');
                                        }}
                                    />
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Ngày kết thúc</Label>
                                    <Input
                                        type="date"
                                        value={removeEndDate}
                                        onChange={(e) => {
                                            setRemoveEndDate(e.target.value);
                                            setRemoveDateError('');
                                        }}
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
                                        <FaTimes /> Hủy
                                    </CancelButton>
                                    <Button onClick={handleRemoveTimeTable} disabled={isLoading}>
                                        <FaTrash /> Xóa
                                    </Button>
                                </DialogButtonGroup>
                            </Dialog>
                        </>
                    )}
                </>
            )}
        </Container>
    );
}