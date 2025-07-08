import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchClassDetail, fetchClassSubjects, fetchClassScheduleConfig, fetchTimeSlots } from '../../api';
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
    font-size: 16px;
  }
`;

const UpdateButton = styled.button`
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
  }
  
  &::before {
    content: "✏️";
    font-size: 14px;
  }
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
  align-items: center;
  gap: 12px;
  
  &::before {
    content: "📋";
    font-size: 18px;
  }
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
  
  &::after {
    margin-left: 4px;
  }
`;

const InfoValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 2px solid;
  
  background: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
      default:
        return 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
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
  
  border-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return '#28a745';
      default:
        return '#dc3545';
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

const TableRow = styled.tr`
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

const TableCell = styled.td`
  padding: 16px 12px;
  vertical-align: middle;
  text-align: center;
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
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

const Metadata = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
  font-size: 14px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  
  p {
    margin: 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    strong {
      color: #495057;
      font-weight: 600;
    }
  }
  
  p:first-child::before {
    content: "👤";
  }
  
  p:nth-child(2)::before {
    content: "📅";
  }
  
  p:last-child::before {
    content: "🔄";
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

  const handleUpdate = () => {
    navigate(`/staff/class/update/${classCode}`);
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
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={handleBack}>
          ← Quay lại
        </BackButton>
      </Container>
    );
  }

  if (!classDetail) {
    return (
      <Container>
        <ErrorMessage>Không tìm thấy thông tin lớp học</ErrorMessage>
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
        <UpdateButton onClick={handleUpdate}>
          Cập nhật lớp học
        </UpdateButton>
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
              <InfoValue>{classDetail.teacher_full_name ? `${classDetail.teacher_full_name} (${classDetail.teacher_user_name})` : 'Chưa có GV'}</InfoValue>
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
              <InfoValue>{classDetail.room_code || 'Chưa xếp phòng'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Tên phòng:</InfoLabel>
              <InfoValue>{classDetail.room_name || 'N/A'}</InfoValue>
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
          <ErrorMessage>{errorSchedule}</ErrorMessage>
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
                  <TableHeader2 style={{ width: '15%' }}>Mã môn</TableHeader2>
                  <TableHeader2 style={{ width: '30%' }}>Tên môn</TableHeader2>
                  <TableHeader2 style={{ width: '25%' }}>Giáo viên</TableHeader2>
                  <TableHeader2 style={{ width: '15%' }}>Tiết/tuần</TableHeader2>
                  <TableHeader2 style={{ width: '15%' }}>Tiết liên tiếp tối đa cho phép</TableHeader2>
                </tr>
              </thead>
              <tbody>
                {classSubjects.map((subject, index) => (
                  <TableRow key={subject.subject_code || index}>
                    <TableCell2>{subject.subject_code || 'N/A'}</TableCell2>
                    <TableCell2>{subject.subject_name || 'N/A'}</TableCell2>
                    <TableCell2>
                      {subject.teacher_user_name || 'Chưa phân công'}
                    </TableCell2>
                    <TableCell2>{subject.weekly_slot || 0}</TableCell2>
                    <TableCell2>{subject.continuous_slot || 0}</TableCell2>
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
  const slots = timeSlots;
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
                <b>Tiết {slot.id}</b>
              </TableCell>
              {dayKeys.map((dayKey, d) => {
                const slotArr = Array.isArray(safeConfig[dayKey]) ? safeConfig[dayKey] : [];
                // So sánh với String(slot.id)
                const isAvailable = !slotArr.includes(String(slot.id));
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
