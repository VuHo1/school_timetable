import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

// Styled Components
const Container = styled.div`
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 70px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
`;

const UpdateButton = styled.button`
  background: linear-gradient(135deg, #e67e22 0%, #d68910 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4);
  }
`;

const InfoSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #2c3e50;
  text-align: center;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const TimeInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  width: 80px;
  
  &:focus {
    outline: none;
    border-color: #e67e22;
    box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.1);
  }
`;

const TimeSlotBadge = styled.div`
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  text-align: center;
  min-width: 60px;
`;

const AddSlotRow = styled.tr`
  background: #f8f9fa;
  border-top: 2px solid #e67e22;
`;

const AddButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #229954;
  }
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #c0392b;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const SaveButtonContainer = styled.div`
  padding: 20px;
  text-align: center;
  border-top: 1px solid #eee;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

function TimeslotManagement() {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({ start_time: '', end_time: '' });

  // Fetch timeslots from API
  const fetchTimeslots = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/time-slot', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

            const data = await response.json();
      
      // Set data based on actual API response structure  
      let timeslotList = [];
      if (Array.isArray(data)) {
        timeslotList = data;
      } else if (data.data_set && Array.isArray(data.data_set)) {
        timeslotList = data.data_set;
      } else if (data.data && Array.isArray(data.data)) {
        timeslotList = data.data;
      } else {
        timeslotList = [];
      }
      
      setTimeslots(timeslotList);
      
      toast.success(`Tải thành công ${timeslotList.length} tiết học`);
      
    } catch (error) {
      console.error('Error fetching timeslots:', error);
      
      // More detailed error messages
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền truy cập chức năng này.');
      } else if (error.message.includes('404')) {
        toast.error('API endpoint không tồn tại.');
      } else {
        toast.error('Không thể tải danh sách tiết học. Vui lòng thử lại.');
      }
      
      setTimeslots([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle timeslot update
  const handleTimeChange = (index, field, value) => {
    const updated = [...timeslots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeslots(updated);
  };

  // Add new timeslot
  const handleAddSlot = () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      toast.error('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc');
      return;
    }

    if (newSlot.start_time >= newSlot.end_time) {
      toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
      return;
    }

    const newTimeslot = {
      time_slot_code: timeslots.length + 1,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      isNew: true
    };

    setTimeslots([...timeslots, newTimeslot]);
    setNewSlot({ start_time: '', end_time: '' });
  };

  // Remove timeslot
  const handleRemoveSlot = (index) => {
    if (timeslots.length <= 1) {
      toast.error('Phải có ít nhất 1 tiết học');
      return;
    }

    const updated = timeslots.filter((_, i) => i !== index);
    setTimeslots(updated);
  };

  // Save all timeslots
  const handleSave = async () => {
    if (timeslots.length === 0) {
      toast.error('Phải có ít nhất 1 tiết học');
      return;
    }

    // Validate timeslots
    for (let i = 0; i < timeslots.length; i++) {
      const slot = timeslots[i];
      if (!slot.start_time || !slot.end_time) {
        toast.error(`Tiết ${i + 1}: Vui lòng nhập đầy đủ thời gian`);
        return;
      }
      if (slot.start_time >= slot.end_time) {
        toast.error(`Tiết ${i + 1}: Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc`);
        return;
      }
    }

    try {
      setSaving(true);
      
      // Prepare payload according to API documentation
      const payload = timeslots.map(slot => ({
        start_time: slot.start_time,
        end_time: slot.end_time
      }));

      const response = await fetch('/api/time-slot/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Lưu cấu hình tiết học thành công');
      fetchTimeslots(); // Refresh data
      
    } catch (error) {
      console.error('Error saving timeslots:', error);
      
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền cập nhật tiết học.');
      } else if (error.message.includes('404')) {
        toast.error('API endpoint không tồn tại.');
      } else {
        toast.error('Không thể lưu cấu hình tiết học. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    return time.length === 5 ? time : time.substring(0, 5);
  };

  // Initialize data
  useEffect(() => {
    fetchTimeslots();
  }, []);

  return (
    <Container>
      <Header>
        <Title>⏰ Quản lí tiết học</Title>
        <UpdateButton onClick={fetchTimeslots} disabled={loading}>
          🔄 Làm mới
        </UpdateButton>
      </Header>

      <InfoSection>
        <InfoText>
          <strong>Lưu ý:</strong> Cấu hình tiết học sẽ áp dụng cho toàn trường. 
          Khi thay đổi, vui lòng đảm bảo không có xung đột với thời khóa biểu hiện tại. 
          Hệ thống sẽ tự động cập nhật lại mã tiết (1, 2, 3, ...) theo thứ tự thời gian.
        </InfoText>
      </InfoSection>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>
            🔄 Đang tải dữ liệu...
          </LoadingSpinner>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Tiết</TableHeaderCell>
                  <TableHeaderCell>Thời gian bắt đầu</TableHeaderCell>
                  <TableHeaderCell>Thời gian kết thúc</TableHeaderCell>
                  <TableHeaderCell>Khoảng thời gian</TableHeaderCell>
                  <TableHeaderCell>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {timeslots.map((slot, index) => (
                  <TableRow key={slot.time_slot_code || index}>
                    <TableCell>
                      <TimeSlotBadge>
                        Tiết {index + 1}
                      </TimeSlotBadge>
                    </TableCell>
                    <TableCell>
                      <TimeInput
                        type="time"
                        value={formatTime(slot.start_time)}
                        onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TimeInput
                        type="time"
                        value={formatTime(slot.end_time)}
                        onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {slot.start_time && slot.end_time ? 
                        `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}` : 
                        'Chưa đặt'
                      }
                    </TableCell>
                    <TableCell>
                      <RemoveButton 
                        onClick={() => handleRemoveSlot(index)}
                        disabled={timeslots.length <= 1}
                        title={timeslots.length <= 1 ? 'Phải có ít nhất 1 tiết học' : 'Xóa tiết này'}
                      >
                        Xóa
                      </RemoveButton>
                    </TableCell>
                  </TableRow>
                ))}
                
                <AddSlotRow>
                  <TableCell>
                    <TimeSlotBadge style={{ background: '#95a5a6' }}>
                      Tiết {timeslots.length + 1}
                    </TimeSlotBadge>
                  </TableCell>
                  <TableCell>
                    <TimeInput
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                      placeholder="HH:MM"
                    />
                  </TableCell>
                  <TableCell>
                    <TimeInput
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                      placeholder="HH:MM"
                    />
                  </TableCell>
                  <TableCell>
                    {newSlot.start_time && newSlot.end_time ? 
                      `${newSlot.start_time} - ${newSlot.end_time}` : 
                      'Nhập thời gian'
                    }
                  </TableCell>
                  <TableCell>
                    <AddButton onClick={handleAddSlot}>
                      + Thêm tiết
                    </AddButton>
                  </TableCell>
                </AddSlotRow>
              </tbody>
            </Table>

            <SaveButtonContainer>
              <SaveButton 
                onClick={handleSave} 
                disabled={saving || timeslots.length === 0}
              >
                {saving ? '🔄 Đang lưu...' : '💾 Lưu cấu hình'}
              </SaveButton>
            </SaveButtonContainer>
          </>
        )}
      </TableContainer>
    </Container>
  );
}

export default TimeslotManagement; 