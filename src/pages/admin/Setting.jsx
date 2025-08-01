import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { fetchAppSetting, updateAppSetting } from '../../api';
import styled from 'styled-components';

// Styled components with updated styles inspired by CodeList.jsx
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

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #2c3e50;
`;

const EditButton = styled.button`
  background: #6B7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ActionButton = styled.button`
  background: ${(props) => props.variant === 'primary' ? '#3b82f6' : '#e74c3c'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${(props) => (props.active ? '#667eea' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#2c3e50')};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: ${(props) => (props.active ? '#667eea' : '#f8f9fa')};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

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
      var resultData = await updateAppSetting(user.token, settingData);
      if (resultData.success) {
        toast.showToast(resultData.description, 'success');
        setSettings(settings.map(s => s.name === selectedSetting.name ? { ...s, value: editedValue } : s));
        setIsEditModalOpen(false);
      } else {
        toast.showToast(resultData.description, 'error');
      }


    } catch (error) {
      console.error('Error updating setting:', error);
      toast.showToast(error.message || 'Cập nhật cài đặt thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(settings.length / limit);
  const paginatedSettings = settings.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <Container>
      <Header>
        <Title>📋 Cấu hình hệ thống</Title>
      </Header>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>🔄 Đang tải dữ liệu...</LoadingSpinner>
        ) : settings.length === 0 ? (
          <EmptyState>
            <div className="icon">⚙️</div>
            <div>Không tìm thấy cài đặt nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '40%' }}>Tên cấu hình</TableHeaderCell>
                  <TableHeaderCell style={{ width: '40%' }}>Giá trị</TableHeaderCell>
                  <TableHeaderCell style={{ width: '20%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {paginatedSettings.map((setting) => (
                  <TableRow key={setting.name}>
                    <TableCell>{setting.name}</TableCell>
                    <TableCell>{setting.value}</TableCell>
                    <TableCell>
                      <EditButton onClick={() => handleEditSetting(setting)} disabled={loading}>
                        Chỉnh sửa
                      </EditButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <Pagination>
                <PaginationButton
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Trước
                </PaginationButton>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <PaginationButton
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}
                <PaginationButton
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Tiếp →
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </TableContainer>

      {isEditModalOpen && selectedSetting && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chỉnh sửa cài đặt</ModalTitle>

            </ModalHeader>
            <form onSubmit={handleSaveSetting}>
              <FormGroup>
                <Label>Tên cấu hình:</Label>
                <Input
                  type="text"
                  value={selectedSetting.name}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Giá trị:</Label>
                <Input
                  type="text"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  placeholder="Nhập giá trị"
                  required
                />
              </FormGroup>
              <ModalActions>
                <ActionButton
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={loading}
                >
                  Hủy
                </ActionButton>
                <ActionButton type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Xác nhận'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}