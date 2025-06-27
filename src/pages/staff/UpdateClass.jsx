import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchClassDetail,
  fetchAvailableTeachers,
  fetchAvailableRooms,
  fetchAllTeachers,
  fetchAllRooms,
  updateClassTeacher,
  updateClassRoom
} from '../../api';
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

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
  max-width: 900px;
  border: 1px solid #e9ecef;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  padding: 24px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.1);
  }
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: "⚙️";
    font-size: 18px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 15px;
  margin-bottom: 4px;
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

const CurrentInfo = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 2px solid #e1f5fe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CurrentLabel = styled.span`
  font-weight: 600;
  color: #1565c0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: "📋";
    font-size: 16px;
  }
`;

const CurrentValue = styled.span`
  color: #2c3e50;
  margin-left: 12px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }
  
  &::before {
    content: "💾";
    font-size: 14px;
  }
`;

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
  }
  
  &::before {
    content: "↶";
    font-size: 16px;
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

const Success = styled.div`
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

function UpdateClass() {
  const { classCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [classDetail, setClassDetail] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    loadData();
  }, [classCode]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');

      // Try available first, fallback to all if empty
      let [classData, teachers, rooms] = await Promise.all([
        fetchClassDetail(token, classCode),
        fetchAvailableTeachers(token),
        fetchAvailableRooms(token)
      ]);

      // If no available teachers/rooms, load all
      if (teachers.length === 0) {
        console.log('No available teachers, loading all teachers...');
        teachers = await fetchAllTeachers(token, { limit: 100 });
      }

      if (rooms.length === 0) {
        console.log('No available rooms, loading all rooms...');
        rooms = await fetchAllRooms(token, { limit: 100 });
      }

      console.log('Available Teachers:', teachers);
      console.log('Available Rooms:', rooms);
      console.log('Class Data:', classData);

      setClassDetail(classData);
      setAvailableTeachers(teachers);
      setAvailableRooms(rooms);

      // Set current values
      setSelectedTeacher(classData.teacher_user_name || '');
      setSelectedRoom(classData.room_code || '');

    } catch (err) {
      console.error('Load data error:', err);
      setError('Không thể tải dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
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
        // Reload class detail
        const updatedClassData = await fetchClassDetail(token, classCode);
        setClassDetail(updatedClassData);
      } else {
        throw new Error(result.description || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật giáo viên: ' + err.message);
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
        // Reload class detail
        const updatedClassData = await fetchClassDetail(token, classCode);
        setClassDetail(updatedClassData);
      } else {
        throw new Error(result.description || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật phòng học: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/staff/class');
  };

  if (loading) {
    return (
      <Container>
        <Loading>Đang tải dữ liệu...</Loading>
      </Container>
    );
  }

  if (!classDetail) {
    return (
      <Container>
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
        <Title>Cập nhật lớp học: {classCode}</Title>
      </Header>

      <FormContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <Success>{success}</Success>}

        <Form>
          {/* Update Teacher Section */}
          <FormSection>
            <SectionTitle>Cập nhật giáo viên chủ nhiệm</SectionTitle>

            <CurrentInfo>
              <CurrentLabel>Hiện tại:</CurrentLabel>
              <CurrentValue>
                {classDetail.teacher_full_name ? `${classDetail.teacher_full_name} (${classDetail.teacher_user_name})` : 'Chưa có GV'}
              </CurrentValue>
            </CurrentInfo>

            <FormGroup>
              <Label>Chọn giáo viên chủ nhiệm mới:</Label>
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

            <ButtonGroup>
              <SaveButton
                type="button"
                onClick={handleUpdateTeacher}
                disabled={saving || !selectedTeacher || selectedTeacher === classDetail.teacher_user_name}
              >
                {saving ? 'Đang cập nhật...' : 'Cập nhật GVCN'}
              </SaveButton>
            </ButtonGroup>
          </FormSection>

          {/* Update Room Section */}
          <FormSection>
            <SectionTitle>Cập nhật phòng học</SectionTitle>

            <CurrentInfo>
              <CurrentLabel>Hiện tại:</CurrentLabel>
              <CurrentValue>
                {classDetail.room_name ? `${classDetail.room_name} (${classDetail.room_code})` : 'Chưa xếp phòng'}
              </CurrentValue>
            </CurrentInfo>

            <FormGroup>
              <Label>Chọn phòng học mới:</Label>
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
                      {room.room_type_name && ` - ${room.room_type_name}`}
                      {room.class_code && ` - Đang dùng: ${room.class_code}`}
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

            <ButtonGroup>
              <SaveButton
                type="button"
                onClick={handleUpdateRoom}
                disabled={saving || !selectedRoom || selectedRoom === classDetail.room_code}
              >
                {saving ? 'Đang cập nhật...' : 'Cập nhật phòng học'}
              </SaveButton>
            </ButtonGroup>
          </FormSection>

          {/* Navigation Buttons */}
          <ButtonGroup>
            <CancelButton type="button" onClick={handleBack}>
              Quay lại danh sách
            </CancelButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
}

export default UpdateClass; 