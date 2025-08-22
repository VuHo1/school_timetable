import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import {
  fetchTimeSlots,
  createTimeSlot,
  updateTimeSlot,
} from '../../api';
import { time } from 'motion';

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
  background: #10B981;
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
      const token = localStorage.getItem('authToken');
      const data = await fetchTimeSlots(token);
      setTimeslots(data);
    } catch (error) {
      toast.error(error.message);
      setTimeslots([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle timeslot update
  const handleTimeChange = (id, field, value) => {
    const updated = timeslots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    setTimeslots(updated);
  };
  const handleUpdate = async (id) => {
    const slot = timeslots.find(s => s.id === id);
    if (!slot || !slot.id) return;

    const token = localStorage.getItem('authToken');

    try {
      var resultData = await updateTimeSlot(token, {
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }); if (resultData.success) {
        toast.success(resultData.description || 'Cập nhật tiết học thành công');
        fetchTimeslots();
      }
      else {
        toast.error(resultData.description || 'Cập nhật tiết học thất bại');
      }
    } catch (error) {
      toast.error(error.message);
      fetchTimeslots();
    }
  };
  const handleAddSlot = async () => {
    const token = localStorage.getItem('authToken');
    const newTimeslot = {
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
    };
    if (!newTimeslot.start_time || !newTimeslot.end_time) {
      toast.error('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc');
      return;
    }
    try {
      var resultData = await createTimeSlot(token, newTimeslot);
      if (resultData.success) {
        toast.success(resultData.description || 'Thêm tiết học mới thành công');
        fetchTimeslots();
        setNewSlot({ start_time: '', end_time: '' });
      }
      else {
        toast.error(resultData.description || 'Thêm tiết học mới thất bại');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const getMinutesBetween = (start, end) => {
    if (!start || !end) return 0;

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return endMinutes - startMinutes;
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
      </Header>

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
                </TableRow>
              </TableHeader>
              <tbody>
                {timeslots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      {slot.id}
                    </TableCell>
                    <TableCell>
                      <TimeInput
                        type="time"
                        value={formatTime(slot.start_time)}
                        onChange={(e) => handleTimeChange(slot.id, 'start_time', e.target.value)}
                        onBlur={() => handleUpdate(slot.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <TimeInput
                        type="time"
                        value={formatTime(slot.end_time)}
                        onChange={(e) => handleTimeChange(slot.id, 'end_time', e.target.value)}
                        onBlur={() => handleUpdate(slot.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {slot.start_time && slot.end_time ? (
                        <>
                          {`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)} `}
                          <strong>({getMinutesBetween(formatTime(slot.start_time), formatTime(slot.end_time))} phút)</strong>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                <AddSlotRow>
                  <TableCell>
                    {timeslots.length + 1}
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
                    <AddButton onClick={handleAddSlot}>
                      + Thêm mới
                    </AddButton>
                  </TableCell>
                </AddSlotRow>
              </tbody>
            </Table>
          </>
        )}
      </TableContainer>
    </Container>
  );
}

export default TimeslotManagement; 