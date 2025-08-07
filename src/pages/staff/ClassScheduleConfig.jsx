import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    fetchClassScheduleConfig,
    fetchTimeSlots,
    addClassScheduleConfig,
} from '../../api';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
import { Loader2 } from 'lucide-react';

const Wrapper = styled.div`
  max-width: 90%;
  margin: 40px auto;
  padding: 32px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;
 text-align: center;
  color: black;
`;
const Title1 = styled.h2`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;

  color: black;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
`;

const Th = styled.th`
  padding: 12px;
  border-bottom: 2px solid #e5e7eb;
  background: #eff6ff;
  font-weight: 600;
  color: #1e40af;
`;

const Td = styled.td`
  padding: 12px;
  text-align: center;
  border: 1px solid #e5e7eb;
  background-color: ${({ selected }) => (selected ? '#d1fae5' : 'white')};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: ${({ selected }) =>
        selected ? '#a7f3d0' : '#e0f2fe'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 14px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: ${({ variant }) =>
        variant === 'cancel' ? '#f3f4f6' : '#2563eb'};
  color: ${({ variant }) =>
        variant === 'cancel' ? '#1f2937' : 'white'};
  border: ${({ variant }) =>
        variant === 'cancel' ? '1px solid #d1d5db' : 'none'};
  transition: background 0.2s ease;

  &:hover {
    background-color: ${({ variant }) =>
        variant === 'cancel' ? '#e5e7eb' : '#1e40af'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  width: 18px;
  height: 18px;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
`;

const dayMap = {
    monday: 'Thứ 2',
    tuesday: 'Thứ 3',
    wednesday: 'Thứ 4',
    thursday: 'Thứ 5',
    friday: 'Thứ 6',
    saturday: 'Thứ 7',
    sunday: 'Chủ nhật',
};

function ClassScheduleConfig() {
    const { classCode } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [scheduleConfig, setScheduleConfig] = useState({});
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');

                const configRes = await fetchClassScheduleConfig(token, classCode);
                const data = configRes || {};
                const formatted = {};
                for (const day of Object.keys(dayMap)) {
                    const list = Array.isArray(data[day]) ? data[day] : [];
                    formatted[day] = list.map(i => String(i));
                }
                setScheduleConfig(formatted);

                const timeSlotRes = await fetchTimeSlots(token);
                setTimeSlots(
                    timeSlotRes.map(slot => ({
                        id: slot.id,
                        label: `Tiết ${slot.id} (${slot.start_time} - ${slot.end_time})`,
                    }))
                );
            } catch (err) {
                showToast('Lỗi khi tải dữ liệu', 'error');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [classCode]);

    const toggleSlot = (day, slotId) => {
        setScheduleConfig(prev => {
            const current = prev[day] || [];
            const exists = current.includes(String(slotId));
            const updated = exists
                ? current.filter(id => id !== String(slotId))
                : [...current, String(slotId)].sort((a, b) => a - b);
            return { ...prev, [day]: updated };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                showToast('Thiếu token, vui lòng đăng nhập lại.', 'error');
                return;
            }

            const payload = { class_code: classCode };
            for (const day of Object.keys(dayMap)) {
                payload[day] = (scheduleConfig[day] || []).filter(Boolean).join('|');

            }



            const res = await addClassScheduleConfig(token, payload);

            showToast(res.description || 'Lưu thành công', 'success');
            navigate(`/staff/class/${classCode}`);
        } catch (err) {
            console.error('❌ [SAVE ERROR]', err);
            showToast(err.message || 'Lỗi khi lưu', 'error');
        } finally {
            setSaving(false);
        }
    };


    return (
        <Wrapper>
            <Title1>Cấu hình lịch học</Title1>
            <Title> Lớp: {classCode}</Title>

            {loading ? (
                <LoaderWrapper>
                    <Spinner />
                </LoaderWrapper>
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <Th>Tiết</Th>
                            {Object.values(dayMap).map(day => (
                                <Th key={day}>{day}</Th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(slot => (
                            <tr key={slot.id}>
                                <Td>{slot.label}</Td>
                                {Object.keys(dayMap).map(day => {
                                    const isSelected = (scheduleConfig[day] || []).includes(
                                        String(slot.id)
                                    );
                                    return (
                                        <Td
                                            key={day}
                                            selected={isSelected}
                                            onClick={() => toggleSlot(day, slot.id)}
                                        >
                                            {isSelected ? '✔' : ''}
                                        </Td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <ButtonGroup>
                <Button variant="cancel" onClick={() => navigate(-1)}>
                    Hủy
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Spinner />}
                    {saving ? 'Đang lưu...' : 'Lưu lại'}
                </Button>
            </ButtonGroup>
        </Wrapper>
    );
}

export default ClassScheduleConfig;
