import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { fetchAppSetting, updateAppSetting } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 15px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: bold;
  text-align: left;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
`;

const TableHead = styled.thead``;

const TableHeader = styled.th`
  padding: 10px;
  border: 1px solid #dee2e6;
  text-align: center;
  background-color: #e9ecef;
  font-size: 16px;
  text-align: left;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 6px;
  border: 1px solid #dee2e6;
  font-size: 14px;
`;

const EditButton = styled.button`
  padding: 3px 6px;
  margin-right: 4px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  &:hover {
    opacity: 0.9;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  width: 400px;
  margin-top: 20px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  display: inline-block;
  width: 100px;
  font-weight: 600;
  color: #444;
  font-size: 13px;
  text-align: left;
  flex-shrink: 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.3s ease;
  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
  &:hover {
    border-color: #bbb;
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const SubmitButton = styled.button`
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: #5a6268;
  }
`;

export default function Setting() {
  const { user } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.token) {
        console.log('No token found in user object:', user);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchAppSetting(user.token);
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.showToast('Không thể tải dữ liệu cài đặt. Chi tiết:', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setEditedValue(setting.value);
    setIsEditModalOpen(true);
  };

  const handleSaveSetting = async (e) => {
    e.preventDefault();
    if (!user?.token || !selectedSetting) return;
    setLoading(true);
    try {
      const settingData = {
        name: selectedSetting.name,
        value: editedValue,
      };
      await updateAppSetting(user.token, settingData);
      toast.showToast('Cập nhật cài đặt thành công!', 'success');
      setSettings(settings.map(s => s.name === selectedSetting.name ? { ...s, value: editedValue } : s));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.showToast(error.message || 'Cập nhật cài đặt thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Cấu hình hệ thống ⚙️</Title>

      <Table>
        <TableHead>
          <tr>
            <TableHeader>Tên Cài Đặt</TableHeader>
            <TableHeader>Giá Trị</TableHeader>
            <TableHeader>Hành Động</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {loading ? (
            <tr>
              <TableCell colSpan="3" style={{ textAlign: 'center', padding: '15px' }}>Đang tải...</TableCell>
            </tr>
          ) : settings.length > 0 ? (
            settings.map((setting) => (
              <TableRow key={setting.name}>
                <TableCell>{setting.name}</TableCell>
                <TableCell>{setting.value}</TableCell>
                <TableCell>
                  <EditButton onClick={() => handleEditSetting(setting)} disabled={loading}>
                    Sửa
                  </EditButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <TableCell colSpan="3" style={{ textAlign: 'center', padding: '15px' }}>Không có cài đặt nào.</TableCell>
            </tr>
          )}
        </TableBody>
      </Table>

      {isEditModalOpen && selectedSetting && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Chỉnh Sửa Cài Đặt</ModalTitle>
            <form onSubmit={handleSaveSetting}>
              <FormGroup>
                <Label>Tên:</Label>
                <Input
                  type="text"
                  value={selectedSetting.name}
                  readOnly
                />
              </FormGroup>
              <FormGroup>
                <Label>Giá Trị:</Label>
                <Input
                  type="text"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  required
                />
              </FormGroup>
              <ModalButtonGroup>
                <SubmitButton type="submit" disabled={loading}>Lưu</SubmitButton>
                <CancelButton type="button" onClick={() => setIsEditModalOpen(false)}>Hủy</CancelButton>
              </ModalButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}