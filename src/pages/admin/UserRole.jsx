import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { fetchRoles, createRole, updateRole, deleteRole, fetchCodeListSYSSTS } from '../../api';
import styled from 'styled-components';

// Styled components inspired by UserAccount.jsx
const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case 'Đang hoạt động':
        return '#d4edda';
      case 'Tạm khóa':
        return '#fff3cd';
      case 'Ngưng hoạt động':
        return '#f8d7da';
      default:
        return '#e9ecef';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'Đang hoạt động':
        return '#155724';
      case 'Tạm khóa':
        return '#856404';
      case 'Ngưng hoạt động':
        return '#721c24';
      default:
        return '#6c757d';
    }
  }};
`;

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

const CreateButton = styled.button`
  background: #10B981;
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
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const ActionMenuButton = styled.button`
  background: #4f46e5;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  &:hover {
    background: #4338ca;
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
`;

const ActionDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  margin-top: 5px;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
`;

const ActionMenuItem = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #2c3e50;
  &:hover {
    background: #f8f9fa;
  }
  &:last-child {
    border-bottom: none;
  }
  ${(props) => props.danger && `
    color: #e74c3c;
  `}
`;

const ActionMenuText = styled.span`
  font-size: 14px;
  color: inherit;
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
 padding: 6px 12px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
  margin-left: 620px;
  &:hover {
    background-color: #c82333;
  }
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 15px;
  .label {
    font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
  }
  .value {
    color: #666;
    flex: 1;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const DetailValue = styled.span`
  color: #666;
  font-size: 14px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
`;

const Label = styled.label`
  padding-right: 20px;
  font-weight: 500;
  margin-top: 10px;
  color: #2c3e50;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 400px;
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

const Select = styled.select`
  box-sizing: border-box;
  width: 405px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Checkbox = styled.input`
  margin-top: 12px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
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

const PaginationButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: ${props => props.active ? '#667eea' : '#f8f9fa'};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function UserRole() {
  const { user } = useAuth();
  const toast = useToast();
  const [allRoles, setAllRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({ role_name: '', is_teacher: false, status: '' });
  const [editRole, setEditRole] = useState({ id: '', role_name: '' });
  const [statusCodes, setStatusCodes] = useState([]);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
  const limit = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) {
        toast.showToast('Không tìm thấy token xác thực.', 'error');
        return;
      }
      setLoading(true);
      try {
        const [rolesData, statusData] = await Promise.all([
          fetchRoles(user.token),
          fetchCodeListSYSSTS(user.token),
        ]);
        setAllRoles(rolesData);
        setStatusCodes(statusData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.showToast('Không thể tải dữ liệu vai trò.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setRoles(allRoles.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allRoles.length / limit));
  }, [currentPage, allRoles]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!user?.token) return;
    setLoading(true);
    try {
      const roleData = {
        role_name: newRole.role_name,
        is_teacher: newRole.is_teacher,
        status: newRole.status,
      };
      const response = await createRole(user.token, roleData);
      if (!response.success) {
        toast.showToast(response.description, 'error');
      } else {
        toast.showToast(response.description, 'success');
        setIsCreateModalOpen(false);
        setNewRole({ role_name: '', is_teacher: false, status: '' });
        const updatedRoles = await fetchRoles(user.token);
        setAllRoles(updatedRoles);
      }
    } catch (error) {
      toast.showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!user?.token || !editRole.id) return;
    setLoading(true);
    try {
      const roleData = {
        id: editRole.id,
        role_name: editRole.role_name,
      };
      const response = await updateRole(user.token, roleData);
      if (!response.success) {
        toast.showToast(response.description, 'error');
      } else {
        toast.showToast(response.description, 'success');
        setIsEditModalOpen(false);
        setEditRole({ id: '', role_name: '' });
        const updatedRoles = await fetchRoles(user.token);
        setAllRoles(updatedRoles);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const response = await deleteRole(user.token, roleId);
      if (!response.success) {
        toast.showToast(response.description, 'error');
      } else {

        toast.showToast(response.description, 'success');
        const updatedRoles = await fetchRoles(user.token);
        setAllRoles(updatedRoles);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (role) => {
    setSelectedRole(role);
    setIsDetailModalOpen(true);
    setOpenActionMenu(null);
  };

  const handleEditRole = (role) => {
    setEditRole({ id: role.id, role_name: role.role_name });
    setIsEditModalOpen(true);
    setOpenActionMenu(null);
  };

  const handleActionMenuToggle = (roleId) => {
    setOpenActionMenu(openActionMenu === roleId ? null : roleId);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Container>
      <Header>
        <Title>📋 Quản lí vai trò</Title>
        <CreateButton onClick={() => setIsCreateModalOpen(true)} disabled={loading}>
          + Tạo vai trò
        </CreateButton>
      </Header>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>🔄 Đang tải dữ liệu...</LoadingSpinner>
        ) : roles.length === 0 ? (
          <EmptyState>
            <div className="icon">📋</div>
            <div>Không tìm thấy vai trò nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '15%' }}>ID</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Tên vai trò</TableHeaderCell>
                  <TableHeaderCell style={{ width: '15%' }}>Giáo viên?</TableHeaderCell>
                  <TableHeaderCell style={{ width: '15%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '20%' }}>Ngày tạo</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.role_name}</TableCell>
                    <TableCell>{role.is_teacher ? 'Có' : 'Không'}</TableCell>
                    <TableCell><StatusBadge status={role.status}>
                      {role.status}
                    </StatusBadge></TableCell>
                    <TableCell>{formatDateTime(role.created_date)}</TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(role.id)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === role.id}>
                        <ActionMenuItem onClick={() => handleViewDetail(role)}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleEditRole(role)}>
                          <ActionMenuText>Sửa</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          danger
                          onClick={() => {
                            handleDeleteRole(role.id);
                            setOpenActionMenu(null);
                          }}
                        >
                          <ActionMenuText style={{ color: '#e74c3c' }}>Bật/Tắt trạng thái</ActionMenuText>
                        </ActionMenuItem>
                      </ActionDropdown>
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

      {isDetailModalOpen && selectedRole && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chi tiết vai trò</ModalTitle>

            </ModalHeader>
            <DetailSection>
              <DetailItem>
                <DetailLabel>ID:</DetailLabel>
                <DetailValue>{selectedRole.id}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Tên vai trò:</DetailLabel>
                <DetailValue>{selectedRole.role_name}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Giáo viên:</DetailLabel>
                <DetailValue>{selectedRole.is_teacher ? 'Có' : 'Không'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Trạng thái:</DetailLabel>
                <StatusBadge status={selectedRole.status}>{selectedRole.status}</StatusBadge>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Ngày tạo:</DetailLabel>
                <DetailValue>{formatDateTime(selectedRole.created_date)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Ngày cập nhật:</DetailLabel>
                <DetailValue>{formatDateTime(selectedRole.updated_date)}</DetailValue>
              </DetailItem>
            </DetailSection>
            <ModalActions>
              <CloseButton
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                disabled={loading}
              >
                Đóng
              </CloseButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Tạo vai trò mới</ModalTitle>

            </ModalHeader>
            <form onSubmit={handleCreateRole}>
              <FormGroup>
                <Label>Tên vai trò:</Label>
                <Input
                  type="text"
                  value={newRole.role_name}
                  onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Trạng thái:</Label>
                <Select
                  value={newRole.status}
                  onChange={(e) => setNewRole({ ...newRole, status: e.target.value })}
                >
                  <option value="">Chọn trạng thái</option>
                  {statusCodes.map((status) => (
                    <option key={status.code_id} value={status.code_id}>
                      {status.caption}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Có phải giáo viên không:</Label>
                <Checkbox
                  type="checkbox"
                  checked={newRole.is_teacher}
                  onChange={(e) => setNewRole({ ...newRole, is_teacher: e.target.checked })}
                />
              </FormGroup>
              <ModalActions>
                <ActionButton
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={loading}
                >
                  Hủy
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Đang tạo...' : 'Lưu thông tin'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {isEditModalOpen && editRole.id && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chỉnh sửa vai trò</ModalTitle>

            </ModalHeader>
            <form onSubmit={handleUpdateRole}>
              <FormGroup>
                <Label>ID vai trò: </Label>
                <Input type="text" value={editRole.id} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Tên vai trò:</Label>
                <Input
                  type="text"
                  value={editRole.role_name}
                  onChange={(e) => setEditRole({ ...editRole, role_name: e.target.value })}
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
                <ActionButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
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