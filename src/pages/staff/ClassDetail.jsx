import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchClassDetail, fetchClassSubjects, fetchClassScheduleConfig, fetchTimeSlots } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #5a6268;
  }
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
  text-align: left;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 40px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 2px;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: #495057;
`;

const InfoValue = styled.span`
  color: #333;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  background-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return '#d4edda';
      default:
        return '#f8d7da';
    }
  }};
  color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return '#155724';
      default:
        return '#721c24';
    }
  }};
`;

const SubjectsSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
`;

const TableHeader = styled.th`
  background-color: #f8f9fa;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

const TeacherInfo = styled.div`
  .teacher-name {
    font-weight: 500;
    color: #333;
  }
  .teacher-username {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
  }
`;

const NoSubjects = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
`;

const Error = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const Metadata = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
  font-size: 14px;
  color: #666;
  
  p {
    margin: 5px 0;
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

    useEffect(() => {
        loadClassData();
    }, [classCode]);

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
            setClassSubjects(subjectsResult || []);
            setScheduleConfig(scheduleResult);
            setTimeSlots(timeSlotResult || []);
        } catch (err) {
            setError('Không thể tải thông tin lớp học: ' + err.message);
        } finally {
            setLoading(false);
            setLoadingSchedule(false);
        }
    };

    const handleBack = () => {
        navigate('/staff/class');
    };

    if (loading) {
        return (
            <Container>
                <Loading>Đang tải thông tin lớp học...</Loading>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Error>{error}</Error>
                <BackButton onClick={handleBack}>
                    ← Quay lại
                </BackButton>
            </Container>
        );
    }

    if (!classDetail) {
        return (
            <Container>
                <Error>Không tìm thấy thông tin lớp học</Error>
                <BackButton onClick={handleBack}>
                    ← Quay lại
                </BackButton>
            </Container>
        );
    }

    // Log kiểm tra dữ liệu timeSlots
    console.log('timeSlots:', timeSlots);

    return (
        <Container>
            <Header>
                <BackButton onClick={handleBack}>
                    ← Quay lại
                </BackButton>
                <Title>Chi tiết lớp {classDetail.class_code}</Title>
            </Header>

            <InfoSection>
                <SectionTitle>Thông tin cơ bản</SectionTitle>
                <InfoGrid>
                  {/* Cột trái */}
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
                      <InfoValue>{classDetail.teacher_full_name || classDetail.teacher_name || 'Chưa có GVCN'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Trạng thái:</InfoLabel>
                      <InfoValue>{classDetail.status || 'N/A'}</InfoValue>
                    </InfoRow>
                  </div>
                  {/* Cột phải */}
                  <div>
                    <InfoRow>
                      <InfoLabel>Mã phòng học:</InfoLabel>
                      <InfoValue>{classDetail.room_code || 'N/A'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Phòng học:</InfoLabel>
                      <InfoValue>{classDetail.room_name || 'Chưa xếp phòng'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Loại phòng:</InfoLabel>
                      <InfoValue>{classDetail.room_type_name || 'N/A'}</InfoValue>
                    </InfoRow>
                  </div>
                </InfoGrid>
            </InfoSection>

            {/* Thời khóa biểu đặt trên */}
            <SubjectsSection>
                <SectionTitle>Cấu hình thời khóa biểu</SectionTitle>
                {loadingSchedule ? (
                    <Loading>Đang tải thời khóa biểu...</Loading>
                ) : errorSchedule ? (
                    <Error>{errorSchedule}</Error>
                ) : timeSlots.length > 0 ? (
                    <ScheduleTable config={scheduleConfig} timeSlots={timeSlots} />
                ) : (
                    <NoSubjects>Không có dữ liệu thời khóa biểu.</NoSubjects>
                )}
            </SubjectsSection>

            {/* Danh sách môn học đặt dưới */}
            <SubjectsSection>
                <SectionTitle>Danh sách môn học ({classSubjects.length} môn)</SectionTitle>
                {classSubjects.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>Mã môn</TableHeader>
                                    <TableHeader>Tên môn</TableHeader>
                                    <TableHeader>Giáo viên</TableHeader>
                                    <TableHeader>Tiết/tuần</TableHeader>
                                    <TableHeader>Tiết liên tiếp</TableHeader>
                                    <TableHeader>Trạng thái</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {classSubjects.map((subject, index) => (
                                    <TableRow key={subject.subject_code || index}>
                                        <TableCell>{subject.subject_code || 'N/A'}</TableCell>
                                        <TableCell>{subject.subject_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <TeacherInfo>
                                                <div className="teacher-name">
                                                    {subject.teacher_name || 'Chưa phân công'}
                                                </div>
                                                {subject.teacher_user_name && (
                                                    <div className="teacher-username">
                                                        ({subject.teacher_user_name})
                                                    </div>
                                                )}
                                            </TeacherInfo>
                                        </TableCell>
                                        <TableCell>{subject.weekly_slot || 0}</TableCell>
                                        <TableCell>{subject.continuous_slot || 0}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={subject.status}>
                                                {subject.status || 'N/A'}
                                            </StatusBadge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </Table>
                    </TableContainer>
                ) : (
                    <NoSubjects>
                        <p>Lớp học chưa có môn học nào được phân công.</p>
                    </NoSubjects>
                )}

                {classDetail.created_date && (
                    <Metadata>
                        <p><strong>Ngày tạo:</strong> {new Date(classDetail.created_date).toLocaleDateString('vi-VN')}</p>
                        {classDetail.modified_date && (
                            <p><strong>Ngày cập nhật:</strong> {new Date(classDetail.modified_date).toLocaleDateString('vi-VN')}</p>
                        )}
                    </Metadata>
                )}
            </SubjectsSection>
        </Container>
    );
}

function ScheduleTable({ config, timeSlots }) {
    const days = [
        'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'
    ];
    const dayKeys = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];
    // Lấy tối đa 8 tiết
    const slots = timeSlots.slice(0, 8);
    // Nếu không có config, tạo object với các ngày đều là mảng rỗng
    const safeConfig = config && Object.keys(config).length > 0
        ? config
        : dayKeys.reduce((acc, key) => { acc[key] = []; return acc; }, {});
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
                                <b>{slot.id}</b>
                                <div style={{ fontSize: 12, color: '#888' }}>
                                    {slot.start_time} - {slot.end_time}
                                </div>
                            </TableCell>
                            {dayKeys.map((dayKey, d) => {
                                const slotArr = Array.isArray(safeConfig[dayKey]) ? safeConfig[dayKey] : [];
                                // So sánh với String(slot.id)
                                const isAvailable = slotArr.includes(String(slot.id));
                                return (
                                    <TableCell
                                        key={d}
                                        style={{
                                            background: isAvailable ? '#c6efce' : '#ffc7ce',
                                            color: isAvailable ? '#006100' : '#9c0006',
                                            textAlign: 'center',
                                            fontWeight: 500
                                        }}
                                    >
                                        {isAvailable ? 'Trống' : 'Nghỉ'}
                                    </TableCell>
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