import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSubjectsByGrade, fetchSubjectByCode, fetchTimeSlots, addClassSubject } from '../../api';
import { FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
const FormContainer = styled.div`
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  margin: 24px auto;
  transition: all 0.3s ease;
`;
const Bottom = styled.div`
display: flex;
justify-content: end;

`;
const FormTitle = styled.h2`
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
`;
const FormTitle1 = styled.h2`
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: left;
`;

const TabBar = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  margin-bottom: 20px;
  overflow-x: auto;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.div`
  background: ${props => props.active ? '#e0e7ff' : '#f1f5f9'};
  color: ${props => props.active ? '#1e40af' : '#64748b'};
  padding: 8px 16px;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-bottom: ${props => props.active ? '2px solid #3b82f6' : 'none'};
  &:hover {
    background: ${props => props.active ? '#bfdbfe' : '#e2e8f0'};
  }
`;

const AddTabButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #f9fafb;
  transition: border-color 0.3s ease;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const Input = styled.input`
  width: 98%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 8px;
  border-radius: 8px;
  font-size: 14px;
  background: #f9fafb;
  transition: border-color 0.3s ease;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const Button = styled.button`
  background: ${props => props.danger ? '#ef4444' : '#3b82f6'};
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  margin-left:8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(${props => props.danger ? '239, 68, 68' : '59, 130, 246'}, 0.3);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fee2e2;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 12px;
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #e2e8f0;
  text-align: center;
  background: ${props => {
        if (props.fixed) return '#d1fae5'; // Light green for fixed
        if (props.avoid) return '#fef3c7'; // Light yellow for avoid
        return 'transparent'; // No color for unselected
    }};
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const ToggleBlock = styled.div`
  display: inline-block;
  padding: 8px 16px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.active ? (props.fixed ? '#10b981' : '#f59e0b') : (props.fixed ? '#d1fae5' : '#fef3c7')};
  color: ${props => props.active ? '#ffffff' : '#1e293b'};
  &:hover {
    opacity: 0.9;
  }
`;

const AddClassSubject = () => {
    const { classCode } = useParams();
    const { showToast } = useToast();

    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState({});
    const [timeSlots, setTimeSlots] = useState([]);
    const [formData, setFormData] = useState({
        class_code: classCode,
        force_assign: true,
        subjects: [],
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [selectionMode, setSelectionMode] = useState('fixed'); // 'fixed' or 'avoid'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const gradeLevel = classCode.slice(0, 2);
                const subjectsData = await fetchSubjectsByGrade(token, gradeLevel);
                setSubjects(subjectsData);
            } catch (err) {
                setError('Không thể tải danh sách môn học: ' + err.message);
            }
        };
        fetchData();
    }, [classCode]);

    useEffect(() => {
        const fetchTimeSlotsData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const timeSlotsData = await fetchTimeSlots(token);
                setTimeSlots(timeSlotsData);
            } catch (err) {
                setError('Không thể tải danh sách ca học: ' + err.message);
            }
        };
        fetchTimeSlotsData();
    }, []);

    const handleSubjectChange = async (index, subjectCode) => {
        try {
            const token = localStorage.getItem('authToken');
            const subjectData = await fetchSubjectByCode(token, subjectCode, classCode);
            const updatedSubjects = [...formData.subjects];
            updatedSubjects[index] = {
                ...updatedSubjects[index],
                subject_code: subjectCode,
                teacher_user_name: '',
                weekly_slot: subjectData.weekly_slot || 1,
                continuous_slot: subjectData.continuous_slot || 1,
                fixed_slot: subjectData.fixed_slot || [],
                avoid_slot: subjectData.avoid_slot || [],
            };
            setFormData({ ...formData, subjects: updatedSubjects });
            setTeachers((prev) => ({
                ...prev,
                [subjectCode]: subjectData.available_teacher || [],
            }));
        } catch (err) {
            setError('Không thể tải thông tin môn học: ' + err.message);
        }
    };

    const handleChange = (index, field, value) => {
        const updatedSubjects = [...formData.subjects];
        updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
        setFormData({ ...formData, subjects: updatedSubjects });
    };

    const handleSlotToggle = (index, slotId, day) => {
        const updatedSubjects = [...formData.subjects];
        const subject = updatedSubjects[index];
        const slotExistsFixed = subject.fixed_slot.some(s => s.time_slot_id === slotId && s.day_of_week === day);
        const slotExistsAvoid = subject.avoid_slot.some(s => s.time_slot_id === slotId && s.day_of_week === day);

        if (selectionMode === 'fixed') {
            if (slotExistsFixed) {
                subject.fixed_slot = subject.fixed_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === day));
            } else {
                subject.fixed_slot.push({ time_slot_id: slotId, day_of_week: day });
                // Remove from avoid if it exists there
                subject.avoid_slot = subject.avoid_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === day));
            }
        } else if (selectionMode === 'avoid') {
            if (slotExistsAvoid) {
                subject.avoid_slot = subject.avoid_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === day));
            } else {
                subject.avoid_slot.push({ time_slot_id: slotId, day_of_week: day });
                // Remove from fixed if it exists there
                subject.fixed_slot = subject.fixed_slot.filter(s => !(s.time_slot_id === slotId && s.day_of_week === day));
            }
        }
        setFormData({ ...formData, subjects: updatedSubjects });
    };

    const addSubjectEntry = () => {
        const existingSubjectCodes = new Set(formData.subjects.map(s => s.subject_code));
        setFormData({
            ...formData,
            subjects: [
                ...formData.subjects,
                {
                    subject_code: '',
                    teacher_user_name: '',
                    weekly_slot: 1,
                    continuous_slot: 1,
                    fixed_slot: [],
                    avoid_slot: [],
                },
            ],
        });
        setActiveTabIndex(formData.subjects.length); // Set focus to the new tab
    };

    const removeSubjectEntry = (index) => {
        const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
        setFormData({ ...formData, subjects: updatedSubjects });
        setActiveTabIndex(Math.max(0, Math.min(index, updatedSubjects.length - 1))); // Adjust active tab
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await addClassSubject(token, formData);
            showToast(response.description, 'success');
            navigate(`/staff/class/${classCode}`);
        } catch (err) {
            showToast(err.message, `error`);
            setError(err.message || 'Có lỗi xảy ra khi thêm môn học.');
        } finally {
            setLoading(false);
        }
    };


    const toggleForceAssign = () => {
        setFormData({ ...formData, force_assign: !formData.force_assign });
    };

    return (
        <FormContainer>
            <FormTitle1>Mẫu thêm môn học</FormTitle1>
            <FormTitle>Lớp: {classCode}</FormTitle>
            <form onSubmit={handleSubmit}>
                <TabBar>
                    <AddTabButton type="button" onClick={addSubjectEntry}>
                        <FaPlus /> Thêm môn học
                    </AddTabButton>
                    {formData.subjects.map((subject, index) => (
                        <Tab
                            key={index}
                            active={activeTabIndex === index}
                            onClick={() => setActiveTabIndex(index)}
                        >
                            {subjects.find(s => s.subject_code === subject.subject_code)?.subject_name || 'Chưa chọn'}
                            <FaTimes onClick={(e) => {
                                e.stopPropagation();
                                removeSubjectEntry(index);
                            }} style={{ cursor: 'pointer' }} />
                        </Tab>
                    ))}
                </TabBar>

                {formData.subjects.length > 0 && activeTabIndex >= 0 && (
                    <FormGroup>
                        <Label>Môn học</Label>
                        <Select
                            value={formData.subjects[activeTabIndex].subject_code}
                            onChange={(e) => handleSubjectChange(activeTabIndex, e.target.value)}
                            required
                        >
                            <option value="">Chọn môn học</option>
                            {subjects
                                .filter(s => !formData.subjects.some(sub => sub.subject_code === s.subject_code) || s.subject_code === formData.subjects[activeTabIndex].subject_code)
                                .map((subj) => (
                                    <option key={subj.subject_code} value={subj.subject_code}>
                                        {subj.subject_name} ({subj.subject_code})
                                    </option>
                                ))}
                        </Select>

                        <Label>Giáo viên</Label>
                        <Select
                            value={formData.subjects[activeTabIndex].teacher_user_name}
                            onChange={(e) => handleChange(activeTabIndex, 'teacher_user_name', e.target.value)}
                        >
                            <option value="">Chọn giáo viên</option>
                            {(teachers[formData.subjects[activeTabIndex].subject_code] || []).map((teacher) => (
                                <option key={teacher.user_name} value={teacher.user_name}>
                                    {teacher.full_name} ({teacher.user_name})
                                </option>
                            ))}
                        </Select>

                        <Label>Số tiết mỗi tuần</Label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.subjects[activeTabIndex].weekly_slot}
                            onChange={(e) => handleChange(activeTabIndex, 'weekly_slot', parseInt(e.target.value))}
                            required
                        />

                        <Label>Số tiết liên tục</Label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.subjects[activeTabIndex].continuous_slot}
                            onChange={(e) => handleChange(activeTabIndex, 'continuous_slot', parseInt(e.target.value))}
                            required
                        />

                        <Label>Tiết cố định / Tránh</Label>
                        <div style={{ marginBottom: '10px' }}>
                            <ToggleBlock
                                fixed
                                active={selectionMode === 'fixed'}
                                onClick={() => setSelectionMode('fixed')}
                            >
                                Tiết cố định
                            </ToggleBlock>
                            <ToggleBlock
                                avoid
                                active={selectionMode === 'avoid'}
                                onClick={() => setSelectionMode('avoid')}
                            >
                                Tiết cần tránh
                            </ToggleBlock>
                        </div>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Tiết</Th>
                                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => (
                                        <Th key={day}>{day}</Th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot) => (
                                    <tr key={slot.id}>
                                        <Td>Tiết {slot.id} (Từ {slot.start_time} đến {slot.end_time})</Td>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                            const subject = formData.subjects[activeTabIndex];
                                            const isFixed = subject.fixed_slot.some(s => s.time_slot_id === slot.id && s.day_of_week === day);
                                            const isAvoid = subject.avoid_slot.some(s => s.time_slot_id === slot.id && s.day_of_week === day);
                                            return (
                                                <Td
                                                    key={day}
                                                    fixed={isFixed}
                                                    avoid={isAvoid}
                                                    onClick={() => handleSlotToggle(activeTabIndex, slot.id, day)}
                                                />
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                    </FormGroup>
                )}

                <FormGroup>
                    <Label>
                        <input
                            type="checkbox"
                            checked={formData.force_assign}
                            onChange={toggleForceAssign}
                            className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        Bỏ qua điều kiện mỗi lớp phải học 1 môn của GVCN
                    </Label>
                </FormGroup>

                <Bottom>
                    <Button type="submit" disabled={loading}>
                        <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => navigate(`/staff/class`)}
                        style={{ background: '#6b7280' }}
                    >
                        Hủy
                    </Button>
                </Bottom>

            </form>
        </FormContainer>
    );
};

export default AddClassSubject;