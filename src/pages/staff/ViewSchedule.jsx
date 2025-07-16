import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
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

} from '../../api';
import { useAuth } from '../../context/AuthContext';

const DropdownButton = styled.button`
    background: #4f46e5;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DropdownMenu = styled.div`
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 120px;
`;

const DropdownItem = styled.div`
    padding: 8px 12px;
    font-size: 16px;
    color: #2d3748;
    cursor: pointer;
    &:hover {
        background: #edf2f7;
    }
    ${({ danger }) => danger && `
        color: #e3342f;
        &:hover {
            background: #fef2f2;
        }
    `}
`;
const Input = styled.input`
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px; 
    font-size: 16px;
    color: #333;
    width:100%;
    box-sizing: border-box;
    &:focus {
        outline: none;
        border-color: #4299e1;
        box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2); 
    }
    &::placeholder {
        color: #a0aec0; 
    }
`;

const DialogError = styled.p`
    color: #e3342f;
    font-size: 15px;
    margin-top: 4px;
    margin-bottom: 0;
`;
const Container = styled.div`
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
`;

const Heading = styled.h1`
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #333;
`;

const ErrorMessage = styled.p`
    color: #e3342f;
    margin-bottom: 16px;
`;

const InfoMessage = styled.p`
    font-size: 16px;
    color: #4a5568;
    margin-bottom: 16px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    @media (min-width: 768px) {
        grid-template-columns: 1fr 2fr;
    }
`;

const TemplateListWrapper = styled.div`
    background: #f7fafc;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SubHeading = styled.h2`
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 16px;
    color: #2d3748;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
`;
const FormGroup1 = styled.div`
    margin-bottom: 16px;
    
`;

const Label = styled.label`
    font-size: 16px;
    color: #4a5568;
    margin-bottom: 4px;
    margin-right: auto;
    display: block;
`;

const Select = styled.select`
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
    color: #333;
    &:focus {
        outline: none;
        border-color: #4299e1;
    }
`;

const Button = styled.button`
    background: #4299e1;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    &:hover {
        background: #3182ce;
    }
    &:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }
`;
const ButtonAdd = styled.button`
    background: #14924c;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    &:hover {
        background: #178b34;
    }
    &:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }
`;
const ButtonDelete = styled.button`
    background: #cb3c20;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    &:hover {
        background: #b7271d;
    }
    &:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }
`;

const NavButton = styled(Button)`
    padding: 8px 12px;
    font-size: 16px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #4a5568;
    margin-right: 16px;
    margin-top: 15px;
`;

const Checkbox = styled.input`
    margin-right: 8px;
`;

const Dialog = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    width: 90%;
    max-width: 700px;
`;

const DialogOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const DialogButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
`;

const CancelButton = styled(Button)`
    background: #e2e8f0;
    color: #2d3748;
    &:hover {
        background: #cbd5e0;
    }
`;
const Modal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    max-width: 900px;
    max-height: 80vh;
    overflow-y: auto;
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    
`;

const ModalContent = styled.div`
    margin-bottom: 16px;
`;

const ModalEntry = styled.div`
    padding: 10px;
    border-bottom: 1px solid #e2e8f0;
    &:last-child {
        border-bottom: none;
    }
    p {
        margin: 0;
        font-size: 16px;
        color: #4a5568;
        margin-bottom: 8px;
    }
`;

const CloseButton = styled(Button)`
    background: #e3342f;
    &:hover {
        background: #c53030;
    }
`;


const TemplateList = styled.ul`
    list-style: none;
    padding: 0;
`;

const TemplateItem = styled.li.withConfig({
    shouldForwardProp: (prop) => !['isOnUse', 'isSelected'].includes(prop)
})`
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    background: ${props => props.isSelected ? '#c6f6d5' : props.isOnUse ? '#f0fff4' : 'white'};
    &:hover {
        background: ${props => props.isSelected ? '#c6f6d5' : '#ebf8ff'};
    }
`;

const TimetableWrapper = styled.div`
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
`;

const Th = styled.th`
    border: 1px solid #e2e8f0;
    padding: 8px;
    background: #edf2f7;
    color: #2d3748;
    text-align: left;
`;

const Td = styled.td`
    border: 1px solid #e2e8f0;
    padding: 8px;
    vertical-align: top;
`;

const Entry = styled.div`
    margin-bottom: 8px;
        border-bottom: 1px solid rgb(226, 232, 240);
    &:last-child {
        margin-bottom: 0;
    }
    p {
        margin: 0;
        font-size: 15px;
        color: #4a5568;
    }
    &:hover{
        background: #d9dfef;
    }
`;

const LoadingMessage = styled.p`
    font-size: 16px;
    color: #4a5568;
    margin-top: 8px;
`;

const PeriodText = styled.p`
    font-size: 16px;
    color: #4a5568;
    margin-bottom: 8px;
`;
const SlotModal = ({ entries, onClose, viewMode }) => (
    <>
        <ModalOverlay onClick={onClose} />

        <Modal>
            <SubHeading>Thông tin chi tiết</SubHeading>
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

                                <p><b>Trạng thái:</b> {entry.status}</p><p style={{ color: entry.is_holiday ? 'red' : 'green' }}>
                                    <b>{entry.is_holiday ? 'Ngày lễ' : 'Ngày thường'}</b>
                                </p>
                            </>
                        )}

                    </ModalEntry>
                ))}
            </ModalContent>
            <DialogButtonGroup>
                <CloseButton onClick={onClose}>Đóng</CloseButton>
            </DialogButtonGroup>
        </Modal>

    </>
);
const ScheduleTemplateList = ({ templates, onSelect, onGenerate, token, selectedScheduleId }) => {
    const { showToast } = useToast();
    const [option, setOption] = useState('Default');
    const [useClassConfig, setUseClassConfig] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editScheduleId, setEditScheduleId] = useState(null);
    const [editScheduleName, setEditScheduleName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateSchedule(token, { option, use_class_config: useClassConfig });
            showToast('Tạo mẫu mới thành công', 'success');
            const newTemplates = await fetchBaseSchedules(token);
            onGenerate(newTemplates);
            setError(null);
            setIsDialogOpen(false);
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
            <SubHeading>Mẫu thời khóa biểu</SubHeading>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Button onClick={() => setIsDialogOpen(true)} disabled={isGenerating}>
                Tạo mẫu thời khóa biểu mới
            </Button>
            {isDialogOpen && (
                <>
                    <DialogOverlay onClick={() => setIsDialogOpen(false)} />
                    <Dialog>
                        <SubHeading>Tạo mẫu thời khóa biểu mới</SubHeading>
                        <FormGroup>
                            <div>
                                <Label>Chọn Phương Thức</Label>
                                <Select value={option} onChange={(e) => setOption(e.target.value)} disabled={isGenerating}>
                                    <option value="Default">Ngẫu nhiên</option>
                                    <option value="FrontLoad">Ưu tiên xếp các tiết vào đầu tuần</option>
                                    <option value="SpreadEven">Phân bổ đều tiết học</option>
                                    <option value="BackLoad">Ưu tiên xếp tiết vào cuối tuần</option>
                                </Select>
                            </div>
                            <CheckboxLabel>
                                <Checkbox
                                    type="checkbox"
                                    checked={useClassConfig}
                                    onChange={(e) => setUseClassConfig(e.target.checked)}
                                    disabled={isGenerating}
                                />
                                Sử dụng GVBM đã cấu hình cho lớp
                            </CheckboxLabel>
                        </FormGroup>
                        {isGenerating && <LoadingMessage>Đang tạo mẫu mới...</LoadingMessage>}
                        <DialogButtonGroup>
                            <CancelButton onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                                Hủy
                            </CancelButton>
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                                Tạo
                            </Button>
                        </DialogButtonGroup>
                    </Dialog>
                </>
            )}
            {isEditDialogOpen && (
                <>
                    <DialogOverlay onClick={() => setIsEditDialogOpen(false)} />
                    <Dialog>
                        <SubHeading>Đổi tên thời khóa biểu mẫu</SubHeading>
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
                            <Button onClick={handleUpdate}>
                                Cập nhật
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
                                ⋯
                            </DropdownButton>
                            {dropdownOpenId === template.id && (
                                <DropdownMenu>
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
        } else {
            const validDetails = details.filter(entry => entry.date && typeof entry.day_of_week === 'number' && entry.day_of_week >= 1 && entry.day_of_week <= 7);
            const uniqueDates = [...new Set(validDetails.map(entry => entry.date.split('T')[0]))].sort();
            console.log('Weekly uniqueDates:', uniqueDates);

            if (uniqueDates.length === 0) {
                console.warn('No valid dates found in data_set');
                return [];
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

            uniqueDates.forEach(date => {
                const entry = validDetails.find(e => e.date.split('T')[0] === date);
                if (entry && entry.day_of_week >= 1 && entry.day_of_week <= 7) {
                    days[entry.day_of_week - 1].date = date;
                    days[entry.day_of_week - 1].label = `${dayOfWeekMap[entry.day_of_week] || entry.day_of_week_str} (${new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`
                }
            });

            return days.filter(day => day.date !== null);
        }
    };

    const dateColumns = getDateColumns(data);

    return (
        <TimetableWrapper>
            <SubHeading>
                Thời khóa biểu {viewMode === 'Applied' ? `đang áp dụng` : viewMode === 'Personal' ? `của tôi` : 'mẫu'}
            </SubHeading>
            {data.length === 0 && (
                <InfoMessage>
                    Không có lịch học trong khoảng thời gian: {scheduleDescription}.
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
                                    const maxDisplay = 3; // Giới hạn số entries hiển thị
                                    const displayedEntries = entries.slice(0, maxDisplay);
                                    return (
                                        <Td key={col.date || col.id}>
                                            {displayedEntries.map((entry) => (
                                                <Entry
                                                    key={entry.id}
                                                    onClick={() => setModalEntries([entry])} // Mở modal cho riêng entry
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <p>Lớp: {entry.class_code}</p>
                                                    <p>GV: {entry.teacher_user_name}</p>
                                                </Entry>
                                            ))}
                                            {entries.length === 0 && <p>Trống</p>}
                                            {entries.length > maxDisplay && (
                                                <Button
                                                    onClick={() => setModalEntries(entries)} // Mở modal cho tất cả entries
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
    const [applyScheduleId, setApplyScheduleId] = useState('');
    const [applyBeginDate, setApplyBeginDate] = useState('');
    const [applyEndDate, setApplyEndDate] = useState('');
    const [applyDateError, setApplyDateError] = useState('');
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [removeBeginDate, setRemoveBeginDate] = useState('');
    const [removeEndDate, setRemoveEndDate] = useState('');
    const [removeDateError, setRemoveDateError] = useState('');
    const [forceAssign, setForceAssign] = useState(true);
    const token = user?.token;
    useEffect(() => {
        if (!token || loading) return;

        console.log('[useEffect] Triggered with viewMode:', viewMode, 'selectedCurrent:', selectedCurrent);
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const templatesData = await fetchBaseSchedules(token);
                setTemplates(templatesData);
                const timeSlotsData = await fetchTimeSlots(token);
                setTimeSlots(timeSlotsData);
                const classesData = await fetchClasses(token);
                setClasses(classesData.data_set || []);
                const teachersData = await fetchAvailableTeachers(token);
                setTeachers(teachersData);
                if (viewMode !== 'Base') {
                    await fetchTimetableData(viewMode, selectedCurrent);
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
        if (mode !== 'Base') {
            await fetchTimetableData(mode, 0);
        } else {
            setScheduleDetails([]);
            setSelectedScheduleId(null);
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
    const handleApplySchedule = async () => {
        if (!applyScheduleId) {
            setApplyDateError('Vui lòng chọn mẫu thời khóa biểu');
            return;
        }
        if (!applyBeginDate || !applyEndDate) {
            setApplyDateError('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
            return;
        }
        if (new Date(applyBeginDate) > new Date(applyEndDate)) {
            setApplyDateError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
            return;
        }
        try {
            setIsLoading(true);
            const response = await addSchedule(token, {
                schedule_id: applyScheduleId,
                begin_date: new Date(applyBeginDate).toISOString(),
                end_date: new Date(applyEndDate).toISOString(),
                force_assign: forceAssign,
            });
            showToast(response.description, 'success');
            setIsApplyDialogOpen(false);
            setApplyScheduleId('');
            setApplyBeginDate('');
            setApplyEndDate('');
            setApplyDateError('');
            setForceAssign(true);
            await fetchTimetableData('Applied', selectedCurrent);
        } catch (err) {
            setApplyDateError(err.message);
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
            <Heading>Quản lý thời khóa biểu</Heading>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {isLoading && <LoadingMessage>Đang tải...</LoadingMessage>}
            {viewMode === 'Base' ? (
                <>
                    <FormGroup>
                        <Button onClick={() => handleViewMode('Applied')}>
                            Thời khóa biểu đang áp dụng
                        </Button>
                        <Button onClick={() => handleViewMode('Personal')}>
                            Thời khóa biểu của tôi
                        </Button>
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
            ) : (
                <>
                    <FormGroup>
                        <Button onClick={() => handleViewMode('Base')}>
                            Quay lại
                        </Button>

                        <NavButton
                            onClick={handlePrevPeriod}
                            disabled={isLoading}
                        >
                            {'<'}
                        </NavButton>
                        <div>
                            <PeriodText>{scheduleDescription}</PeriodText>
                        </div>
                        <NavButton
                            onClick={handleNextPeriod}
                            disabled={isLoading}
                        >
                            {'>'}
                        </NavButton>
                        <ButtonAdd onClick={() => setIsApplyDialogOpen(true)} disabled={isLoading}> {/* NEW: Nút mở dialog áp dụng */}
                            Thêm thời khóa biểu
                        </ButtonAdd>
                        <ButtonDelete onClick={() => setIsRemoveDialogOpen(true)} disabled={isLoading}> {/* NEW: Nút mở dialog xóa */}
                            Xóa thời khóa biểu
                        </ButtonDelete>
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
                                setApplyScheduleId('');
                                setApplyBeginDate('');
                                setApplyEndDate('');
                                setApplyDateError('');
                                setForceAssign(true);
                            }} />
                            <Dialog>
                                <SubHeading>Thêm thời khóa biểu</SubHeading>
                                <FormGroup1>
                                    <Label>Mẫu thời khóa biểu</Label>
                                    <Select
                                        value={applyScheduleId}
                                        onChange={(e) => {
                                            setApplyScheduleId(e.target.value);
                                            setApplyDateError('');
                                        }}
                                    >
                                        <option value="">Chọn mẫu</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.schedule_name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Ngày bắt đầu</Label>
                                    <Input
                                        type="date"
                                        value={applyBeginDate}
                                        onChange={(e) => {
                                            setApplyBeginDate(e.target.value);
                                            setApplyDateError('');
                                        }}
                                    />
                                </FormGroup1>
                                <FormGroup1>
                                    <Label>Ngày kết thúc</Label>
                                    <Input
                                        type="date"
                                        value={applyEndDate}
                                        onChange={(e) => {
                                            setApplyEndDate(e.target.value);
                                            setApplyDateError('');
                                        }}
                                    />
                                </FormGroup1>
                                <FormGroup>
                                    <CheckboxLabel>
                                        <Checkbox
                                            type="checkbox"
                                            checked={forceAssign}
                                            onChange={(e) => setForceAssign(e.target.checked)}
                                        />
                                        Buộc gán (cập nhật giáo viên bộ môn mới nếu là mẫu mới)
                                    </CheckboxLabel>
                                </FormGroup>
                                {applyDateError && <DialogError>{applyDateError}</DialogError>}
                                <DialogButtonGroup>
                                    <CancelButton onClick={() => {
                                        setIsApplyDialogOpen(false);
                                        setApplyScheduleId('');
                                        setApplyBeginDate('');
                                        setApplyEndDate('');
                                        setApplyDateError('');
                                        setForceAssign(true);
                                    }}>
                                        Hủy
                                    </CancelButton>
                                    <Button onClick={handleApplySchedule} disabled={isLoading}>
                                        Áp dụng
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
                                <SubHeading>Xóa thời khóa biểu đang áp dụng</SubHeading>
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
                                        Hủy
                                    </CancelButton>
                                    <Button onClick={handleRemoveTimeTable} disabled={isLoading}>
                                        Xóa
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