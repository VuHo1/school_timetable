import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToast } from '../../components/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { fetchSemesters, addSemester, removeSemester } from '../../api';
import { FaPlus, FaTrash, FaCalendarAlt, FaTimes, FaCheck } from 'react-icons/fa';

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

const SubHeading = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  border: 1px solid #e5e7eb;
  padding: 12px;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
  color: #1f2937;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  border: 1px solid #e5e7eb;
  padding: 12px;
  vertical-align: top;
`;

const ButtonAdd = styled.button`
  background: #10b981;
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
    background: #059669;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ButtonDelete = styled.button`
  background: #ef4444;
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
    background: #dc2626;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Dialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 90%;
  max-width: 600px;
  border: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const DialogError = styled.p`
  color: #dc2626;
  font-size: 13px;
  margin-top: 8px;
  margin-bottom: 0;
  font-weight: 500;
`;

const DialogButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  background: #e5e7eb;
  color: #1f2937;
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
    background: #d1d5db;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.7;
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

export default function Semesters() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [semesters, setSemesters] = useState([]);
  const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState('');
  const [newSemesterStartDate, setNewSemesterStartDate] = useState('');
  const [newSemesterEndDate, setNewSemesterEndDate] = useState('');
  const [semesterError, setSemesterError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const token = user?.token;

  useEffect(() => {
    if (!token || loading) return;

    const fetchData = async () => {
      try {
        setIsGenerating(true);
        const semestersData = await fetchSemesters(token);
        setSemesters(semestersData);
      } catch (err) {
        showToast(`Lỗi khi tải danh sách học kỳ: ${err.message}`, 'error');
      } finally {
        setIsGenerating(false);
      }
    };
    fetchData();
  }, [token, loading, showToast]);

  const handleAddSemester = async () => {
    if (!newSemesterName.trim()) {
      setSemesterError('Tên học kỳ không được để trống');
      showToast('Tên học kỳ không được để trống', 'error');
      return;
    }
    if (!newSemesterStartDate || !newSemesterEndDate) {
      setSemesterError('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
      showToast('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc', 'error');
      return;
    }
    if (new Date(newSemesterStartDate) > new Date(newSemesterEndDate)) {
      setSemesterError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
      showToast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await addSemester(token, {
        semester_name: newSemesterName,
        start_date: new Date(newSemesterStartDate).toISOString().split('T')[0],
        end_date: new Date(newSemesterEndDate).toISOString().split('T')[0],
      });
      showToast(response.description, response.success ? 'success' : 'error');
      if (response.success) {
        const newSemesters = await fetchSemesters(token);
        setSemesters(newSemesters);
        setIsAddSemesterDialogOpen(false);
        setNewSemesterName('');
        setNewSemesterStartDate('');
        setNewSemesterEndDate('');
        setSemesterError('');
      } else {
        setSemesterError(response.description);
      }
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi tạo học kỳ';
      setSemesterError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSemester = async (semesterId) => {
    try {
      setIsGenerating(true);
      const response = await removeSemester(token, semesterId);
      showToast(response.description, 'success');
      const newSemesters = await fetchSemesters(token);
      setSemesters(newSemesters);
    } catch (err) {
      showToast(`Lỗi: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return <Container>Đang tải...</Container>;
  }

  if (!token) {
    return <Container>Vui lòng đăng nhập để quản lý học kỳ.</Container>;
  }

  return (
    <Container>
      <Heading>
        <FaCalendarAlt /> Quản lý học kỳ
      </Heading>
      <ButtonAdd onClick={() => setIsAddSemesterDialogOpen(true)} disabled={isGenerating}>
        <FaPlus /> Tạo học kỳ mới
      </ButtonAdd>
      <SubHeading>
        <FaCalendarAlt /> Danh sách học kỳ
      </SubHeading>
      <Table>
        <thead>
          <tr>
            <Th>Tên</Th>
            <Th>Ngày bắt đầu</Th>
            <Th>Ngày kết thúc</Th>
            <Th>Hành động</Th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((semester) => (
            <tr key={semester.id}>
              <Td>{semester.semester_name}</Td>
              <Td>{new Date(semester.start_date).toLocaleDateString('vi-VN')}</Td>
              <Td>{new Date(semester.end_date).toLocaleDateString('vi-VN')}</Td>
              <Td>
                <ButtonDelete
                  onClick={() => handleDeleteSemester(semester.id)}
                  disabled={isGenerating}
                >
                  <FaTrash /> Xóa
                </ButtonDelete>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {isAddSemesterDialogOpen && (
        <>
          <DialogOverlay onClick={() => {
            setIsAddSemesterDialogOpen(false);
            setNewSemesterName('');
            setNewSemesterStartDate('');
            setNewSemesterEndDate('');
            setSemesterError('');
          }} />
          <Dialog>
            <SubHeading>
              <FaPlus /> Tạo học kỳ mới
            </SubHeading>
            <FormGroup>
              <Label>Tên học kỳ</Label>
              <Input
                type="text"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                placeholder="Nhập tên học kỳ"
                disabled={isGenerating}
              />
            </FormGroup>
            <FormGroup>
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                value={newSemesterStartDate}
                onChange={(e) => setNewSemesterStartDate(e.target.value)}
                disabled={isGenerating}
              />
            </FormGroup>
            <FormGroup>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={newSemesterEndDate}
                onChange={(e) => setNewSemesterEndDate(e.target.value)}
                disabled={isGenerating}
              />
            </FormGroup>
            {semesterError && <DialogError>{semesterError}</DialogError>}
            <DialogButtonGroup>
              <CancelButton
                onClick={() => {
                  setIsAddSemesterDialogOpen(false);
                  setNewSemesterName('');
                  setNewSemesterStartDate('');
                  setNewSemesterEndDate('');
                  setSemesterError('');
                }}
                disabled={isGenerating}
              >
                <FaTimes /> Hủy
              </CancelButton>
              <Button
                onClick={handleAddSemester}
                disabled={isGenerating}
              >
                <FaCheck /> Tạo
              </Button>
            </DialogButtonGroup>
          </Dialog>
        </>
      )}
    </Container>
  );
}