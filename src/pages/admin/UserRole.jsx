import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { fetchRoles, createRole, updateRole, deleteRole, fetchCodeListSYSSTS } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 15px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  text-align: left;
  color: #333;
`;

const CreateButton = styled.button`
  padding: 10px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 15px;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
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
  padding: 8px;
  border: 1px solid #dee2e6;
  text-align: left;
  background-color: #e9ecef;
  font-size: 14px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #dee2e6;
  font-size: 14px;
  text-align: left;
`;

const ActionButton = styled.button`
  padding: 3px 6px;
  margin-right: 4px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  &:hover {
    opacity: 0.9;
  }
`;

const ViewButton = styled(ActionButton)`
  background-color: #007bff;
  color: white;
`;

const EditButton = styled(ActionButton)`
  background-color: #ffc107;
  color: white;
`;

const DeleteButton = styled(ActionButton)`
  background-color: #dc3545;
  color: white;
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
  width: 450px;
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

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px;
  background-color: #f9f9f9;
  border-radius: 3px;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  color: #555;
  font-size: 12px;
`;

const DetailValue = styled.span`
  color: #333;
  font-size: 12px;
`;

const CloseButton = styled.button`
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
  margin-left: 397px;
  &:hover {
    background-color: #c82333;
  }
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

const Select = styled.select`
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

const Checkbox = styled.input`
  margin-left: 10px;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
`;

const PageButton = styled.button`
  padding: 6px 10px;
  background-color: ${(props) => (props.active ? '#007bff' : '#fff')};
  color: ${(props) => (props.active ? '#fff' : '#007bff')};
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: ${(props) => (props.active ? '#0056b3' : '#e7f0fa')};
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
  }, [user, toast]);

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
        throw new Error(response.description || 'Tạo vai trò thất bại.');
      }
      toast.showToast(response.description, 'success');
      setIsCreateModalOpen(false);
      setNewRole({ role_name: '', is_teacher: false, status: '' });
      const updatedRoles = await fetchRoles(user.token);
      setAllRoles(updatedRoles);
    } catch (error) {
      console.error('Error creating role:', error);
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
        throw new Error(response.description || 'Cập nhật vai trò thất bại.');
      }
      toast.showToast(response.description, 'success');
      setIsEditModalOpen(false);
      setEditRole({ id: '', role_name: '' });
      const updatedRoles = await fetchRoles(user.token);
      setAllRoles(updatedRoles);
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
        throw new Error(response.description || 'Xóa vai trò thất bại.');
      }
      toast.showToast(response.description, 'success');
      const updatedRoles = await fetchRoles(user.token);
      setAllRoles(updatedRoles);
      setCurrentPage(1);
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
  };

  const handleEditRole = (role) => {
    setEditRole({ id: role.id, role_name: role.role_name });
    setIsEditModalOpen(true);
  };

  return (
    <Container>
      <Title>Quản Lý Vai Trò</Title>
      <CreateButton onClick={() => setIsCreateModalOpen(true)} disabled={loading}>
        + Tạo Vai Trò
      </CreateButton>

      <Table>
        <TableHead>
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Tên Vai Trò</TableHeader>
            <TableHeader>Là Giáo Viên</TableHeader>
            <TableHeader>Trạng Thái</TableHeader>
            <TableHeader>Ngày Tạo</TableHeader>
            <TableHeader>Hành Động</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {loading ? (
            <tr>
              <TableCell colSpan="6" style={{ textAlign: 'center', padding: '15px' }}>
                Đang tải...
              </TableCell>
            </tr>
          ) : roles.length > 0 ? (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.role_name}</TableCell>
                <TableCell>{role.is_teacher ? 'Có' : 'Không'}</TableCell>
                <TableCell>{role.status}</TableCell>
                <TableCell>{formatDateTime(role.created_date)}</TableCell>
                <TableCell>
                  <ViewButton onClick={() => handleViewDetail(role)}>Xem</ViewButton>
                  <EditButton onClick={() => handleEditRole(role)}>Sửa</EditButton>
                  <DeleteButton onClick={() => handleDeleteRole(role.id)}>Xóa</DeleteButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <TableCell colSpan="6" style={{ textAlign: 'center', padding: '15px' }}>
                Không có vai trò nào.
              </TableCell>
            </tr>
          )}
        </TableBody>
      </Table>

      <Pagination>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </PageButton>
        ))}
      </Pagination>

      {isDetailModalOpen && selectedRole && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Chi Tiết Vai Trò</ModalTitle>
            <DetailSection>
              <DetailItem>
                <DetailLabel>ID:</DetailLabel>
                <DetailValue>{selectedRole.id}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Tên Vai Trò:</DetailLabel>
                <DetailValue>{selectedRole.role_name}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Là Giáo Viên:</DetailLabel>
                <DetailValue>{selectedRole.is_teacher ? 'Có' : 'Không'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Trạng Thái:</DetailLabel>
                <DetailValue>{selectedRole.status}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Ngày Tạo:</DetailLabel>
                <DetailValue>{formatDateTime(selectedRole.created_date)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Ngày Cập Nhật:</DetailLabel>
                <DetailValue>{formatDateTime(selectedRole.updated_date)}</DetailValue>
              </DetailItem>
            </DetailSection>
            <CloseButton onClick={() => setIsDetailModalOpen(false)}>Đóng</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isCreateModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Tạo Vai Trò Mới</ModalTitle>
            <form onSubmit={handleCreateRole}>
              <FormGroup>
                <Label>Tên Vai Trò:</Label>
                <Input
                  type="text"
                  value={newRole.role_name}
                  onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Là Giáo Viên:</Label>
                <Checkbox
                  type="checkbox"
                  checked={newRole.is_teacher}
                  onChange={(e) => setNewRole({ ...newRole, is_teacher: e.target.checked })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Trạng Thái:</Label>
                <Select
                  value={newRole.status}
                  onChange={(e) => setNewRole({ ...newRole, status: e.target.value })}
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  {statusCodes.map((status) => (
                    <option key={status.code_id} value={status.code_id}>
                      {status.caption}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <ModalButtonGroup>
                <SubmitButton type="submit" disabled={loading}>Tạo</SubmitButton>
                <CancelButton type="button" onClick={() => setIsCreateModalOpen(false)}>Hủy</CancelButton>
              </ModalButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      {isEditModalOpen && editRole.id && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Chỉnh Sửa Vai Trò</ModalTitle>
            <form onSubmit={handleUpdateRole}>
              <FormGroup>
                <Label>ID:</Label>
                <Input type="text" value={editRole.id} readOnly />
              </FormGroup>
              <FormGroup>
                <Label>Tên Vai Trò:</Label>
                <Input
                  type="text"
                  value={editRole.role_name}
                  onChange={(e) => setEditRole({ ...editRole, role_name: e.target.value })}
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