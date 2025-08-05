import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
import '../../styles/date.css'
import { FaSpinner, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import {
    fetchTimeSlots,
    fetchClasses,
    fetchAvailableTeachers,
    fetchMyTimeTable,
} from '../../api';
import { useAuth } from '../../context/AuthContext';

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

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
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

const NavButton = styled(Button)`
  padding: 10px 14px;
  font-size: 16px;
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
            case 'Ngày lễ': return '#FEE2E2';
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
            case 'Ngày lễ': return '#EF4444';
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

const formatTime = (timeStr) => {
    if (!timeStr) return '';

    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        const [h, m] = timeStr.split(':');
        return `${h}:${m}`;
    }

    return timeStr; // fallback
};

const SlotModal = ({ entries, onClose, viewMode }) => (
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
                        <p><b>Giáo viên:</b> {entry.teacher_name} ({entry.teacher_user_name})</p>
                        <p><b>Phòng:</b> {entry.room_code}</p>
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
                                    </StatusBadge></p>
                                <p><b>Thời lượng giảng dạy:</b> {entry.duration} phút</p>
                                <p><StatusBadge status={entry.is_holiday ? 'Ngày lễ' : 'Ngày thường'}>
                                    {entry.is_holiday ? 'Ngày lễ' : 'Ngày thường'}
                                </StatusBadge></p>
                            </>
                        )}
                    </ModalEntry>
                ))}
            </ModalContent>
        </Modal>
    </>
);

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
                                        <Td key={col.date || col.id}>
                                            {displayedEntries.map((entry) => (
                                                <Entry
                                                    key={entry.id}
                                                    onClick={() => setModalEntries([entry])}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <p>{entry.class_code}-{entry.subject_code} ({entry.teacher_user_name})</p>
                                                    <p><StatusBadge status={entry.status}>{entry.status || 'N/A'}</StatusBadge></p>
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

export default function MySchedule() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const [timetableData, setTimetableData] = useState([]);
    const [scheduleDescription, setScheduleDescription] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [error, setError] = useState(null);
    const [appliedType, setAppliedType] = useState('All');
    const [appliedCode, setAppliedCode] = useState('');
    const [selectedOption, setSelectedOption] = useState('Weekly');
    const [selectedCurrent, setSelectedCurrent] = useState(0);
    const [pagination, setPagination] = useState({ current: 0, last: 1, next: null, previous: null, total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const token = user?.token;

    useEffect(() => {
        if (!token || loading) return;

        console.log('[useEffect] Triggered with selectedCurrent:', selectedCurrent);
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const timeSlotsData = await fetchTimeSlots(token);
                setTimeSlots(timeSlotsData);
                const classesData = await fetchClasses(token);
                setClasses(classesData.data_set || []);
                const teachersData = await fetchAvailableTeachers(token);
                setTeachers(teachersData);
                await fetchTimetableData(selectedCurrent);
            } catch (err) {
                showToast(`Lỗi: ${err.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token, loading]);

    const fetchTimetableData = async (current) => {
        if (!token || isLoading) {
            console.log('[fetchTimetableData] Skipped: token missing or loading');
            return;
        }

        try {
            setIsLoading(true);
            const params = { option: selectedOption, current };
            if (appliedType !== 'All' && appliedCode) {
                params.type = appliedType;
                params.code = appliedCode;
            }
            console.log(`[fetchTimetableData] (current=${current}) Params:`, params);
            const response = await fetchMyTimeTable(token, params);
            console.log(`[fetchTimetableData] (current=${current}) Response:`, response);

            setTimetableData(response.data_set || []);
            setScheduleDescription(response.description || 'Không có mô tả');
            setPagination({
                current: response.pagination?.current || current,
                last: response.pagination?.last || 1,
                next: response.pagination?.next ?? null,
                previous: response.pagination?.previous ?? null,
                total: response.pagination?.total || 0
            });
            console.log(`[fetchTimetableData] (current=${current}) State updated:`, {
                timetableData: response.data_set?.length || 0,
                scheduleDescription: response.description,
                pagination
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

    const handleAppliedTypeChange = async (newType) => {
        if (newType === appliedType) return;
        console.log('[handleAppliedTypeChange] Changing type to:', newType);
        setAppliedType(newType);
        setAppliedCode('');
        try {
            setIsLoading(true);
            const params = { option: selectedOption, current: selectedCurrent };
            if (newType !== 'All') {
                params.type = newType;
                params.code = '';
            }
            console.log(`[handleAppliedTypeChange] Fetching params:`, params);
            const response = await fetchMyTimeTable(token, params);
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
            showToast(`Lỗi: ${err.message}`, 'error');
            setTimetableData([]);
            setScheduleDescription('Không có mô tả');
            setPagination({ current: selectedCurrent, last: 1, next: null, previous: null, total: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppliedCodeChange = async (newCode) => {
        if (newCode === appliedCode) return;
        console.log('[handleAppliedCodeChange] Changing code to:', newCode);
        setAppliedCode(newCode);
        if (appliedType !== 'All') {
            try {
                setIsLoading(true);
                const params = { option: selectedOption, current: selectedCurrent };
                if (newCode) {
                    params.type = appliedType;
                    params.code = newCode;
                }
                console.log(`[handleAppliedCodeChange] Fetching params:`, params);
                const response = await fetchMyTimeTable(token, params);
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
        try {
            setIsLoading(true);
            const params = { option: newOption, current: 0 };
            if (appliedType !== 'All' && appliedCode) {
                params.type = appliedType;
                params.code = appliedCode;
            }
            console.log(`[handleOptionChange] Fetching params:`, params);
            const response = await fetchMyTimeTable(token, params);
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
            showToast(`Lỗi: ${err.message}`, 'error');
            setTimetableData([]);
            setScheduleDescription('Không có mô tả');
            setPagination({ current: 0, last: 1, next: null, previous: null, total: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevPeriod = async () => {
        if (isLoading) return;
        const newCurrent = selectedCurrent - 1;
        console.log('[handlePrevPeriod] New current:', newCurrent);
        setSelectedCurrent(newCurrent);
        await fetchTimetableData(newCurrent);
    };

    const handleNextPeriod = async () => {
        if (isLoading) return;
        const newCurrent = selectedCurrent + 1;
        console.log('[handleNextPeriod] New current:', newCurrent);
        setSelectedCurrent(newCurrent);
        await fetchTimetableData(newCurrent);
    };

    if (!token) {
        return <Container>Vui lòng đăng nhập để xem thời khóa biểu.</Container>;
    }

    return (
        <Container>
            <Heading>
                📅 Thời khóa biểu của tôi
            </Heading>
            {error && <ErrorMessage> {error}</ErrorMessage>}
            {isLoading && <LoadingMessage><FaSpinner className="animate-spin" /> Đang tải...</LoadingMessage>}
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
            </FormGroup>
            <Timetable
                data={timetableData}
                timeSlots={timeSlots}
                viewMode="Personal"
                scheduleDescription={scheduleDescription}
                selectedOption={selectedOption}
            />
        </Container>
    );
}