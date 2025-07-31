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
  updateClassRoom
} from '../../api';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';

// Styled components remain the same as in your provided code
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
  width: 70%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
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

  useEffect(() => {
    loadClassData();
    fetchClassesData();
  }, [classCode]);

  const fetchClassesData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const data = await fetchClasses(token);
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
      setClassSubjects(subjectsResult || []);
      setScheduleConfig(scheduleResult);
      setTimeSlots(timeSlotResult || []);
      setSelectedTeacher(detailResult.teacher_user_name || '');
      setSelectedRoom(detailResult.room_code || '');
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
        console.log('No available teachers, loading all teachers...');
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
      console.log('Available rooms:', rooms);
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
        setSuccess('Cập nhật giáo viên chủ nhiệm thành công!');
        const updatedClassData = await fetchClassDetail(token, classCode);
        setClassDetail(updatedClassData);
        setShowTeacherModal(false);
        toast.success(result.description);
      } else {
        throw new Error(result.description || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật giáo viên: ' + err.message);
      toast.error('Lỗi khi cập nhật giáo viên: ' + err.message);
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
        setSuccess('Cập nhật phòng học thành công!');
        const updatedClassData = await fetchClassDetail(token, classCode);
        setClassDetail(updatedClassData);
        toast.success(result.description);
        setShowRoomModal(false);
      } else {
        throw new Error(result.description || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật phòng học: ' + err.message);
      toast.error('Thất bại: ' + err.message);
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
      toast.success(response.description);
      setShowScheduleModal(false);
      setSelectedClasses([]);
      loadClassData();
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
      toast.success(response.description);
      setShowSubjectsModal(false);
      setSelectedClasses([]);
      loadClassData();
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

  const openTeacherModal = () => {
    setShowTeacherModal(true);
    loadTeachers();
  };

  const openRoomModal = () => {
    setShowRoomModal(true);
    loadRooms();
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
                {classDetail.teacher_full_name ? `${classDetail.teacher_full_name} (${classDetail.teacher_user_name})` : 'Chưa có GV'}
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
                {classDetail.room_code || 'Chưa xếp phòng'}
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
          </div>
        </InfoGrid>
      </InfoSection>

      <SubjectsSection>
        <SectionTitle>
          Cấu hình thời khóa biểu
          <CopyButton onClick={() => setShowScheduleModal(true)}>
            Áp dụng cấu hình tương tự
          </CopyButton>
        </SectionTitle>
        {loadingSchedule ? (
          <Loading>Đang tải lịch...</Loading>
        ) : errorSchedule ? (
          <ErrorMessage>{errorSchedule}</ErrorMessage>
        ) : timeSlots.length > 0 ? (
          <ScheduleTable config={scheduleConfig} timeSlots={timeSlots} />
        ) : (
          <NoSubjects>Không có dữ liệu.</NoSubjects>
        )}
      </SubjectsSection>

      <SubjectsSection>
        <SectionTitle>
          Danh sách môn học ({classSubjects.length} môn)
          <CopyButton onClick={() => setShowSubjectsModal(true)}>
            Áp dụng các môn học tương tự
          </CopyButton>
        </SectionTitle>
        {classSubjects.length > 0 ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader2 style={{ width: '15%' }}>Mã môn</TableHeader2>
                  <TableHeader2 style={{ width: '30%' }}>Tên môn</TableHeader2>
                  <TableHeader2 style={{ width: '25%' }}>Giáo viên</TableHeader2>
                  <TableHeader2 style={{ width: '15%' }}>Tiết/tuần</TableHeader2>
                  <TableHeader2 style={{ width: '15%' }}>Tiết liên tiếp tối đa</TableHeader2>
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

      {showScheduleModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Chọn các lớp muốn áp dụng cấu hình tương tự</ModalTitle>
            <CheckboxGrid>
              {classes
                .filter(cls => cls.class_code !== classCode)
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
              <ConfirmButton onClick={handleCopySchedule}>Áp dụng</ConfirmButton>
              <CancelButton onClick={() => setShowScheduleModal(false)}>Hủy</CancelButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {showSubjectsModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Chọn các lớp muốn áp dụng môn học tương tự</ModalTitle>
            <CheckboxGrid>
              {classes
                .filter(cls => cls.class_code !== classCode)
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
              <ConfirmButton onClick={handleCopySubjects}>Áp dụng</ConfirmButton>
              <CancelButton onClick={() => setShowSubjectsModal(false)}>Hủy</CancelButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {showTeacherModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Cập nhật giáo viên chủ nhiệm lớp {classDetail.class_code}</ModalTitle>
            <FormGroup>
              <Label>Chọn giáo viên chủ nhiệm:</Label>
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
              <ConfirmButton
                onClick={handleUpdateTeacher}
                disabled={saving || !selectedTeacher || selectedTeacher === classDetail.teacher_user_name}
              >
                {saving ? 'Đang cập nhật...' : 'Cập nhật'}
              </ConfirmButton>
              <CancelButton onClick={() => setShowTeacherModal(false)}>Hủy</CancelButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}

      {showRoomModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Cập nhật phòng học lớp {classDetail.class_code}</ModalTitle>
            <FormGroup>
              <Label>Chọn phòng học:</Label>
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
              <ConfirmButton
                onClick={handleUpdateRoom}
                disabled={saving || !selectedRoom || selectedRoom === classDetail.room_code}
              >
                {saving ? 'Đang cập nhật...' : 'Cập nhật'}
              </ConfirmButton>
              <CancelButton onClick={() => setShowRoomModal(false)}>Hủy</CancelButton>
            </BothButton>
          </ModalContent>
        </Modal>
      )}
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
  const slots = timeSlots;
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