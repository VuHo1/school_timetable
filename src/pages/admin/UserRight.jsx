import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import {
  fetchUserRights,
  fetchUserRightsByRoleId,
  addUserRight,
  fetchRoles,
  fetchUserCommands,
} from '../../api';

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

const AddButton = styled.button`
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
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
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

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #2c3e50;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
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

const ModalOverlay = styled.div`
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
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

const ModalBody = styled.div`
  padding: 30px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const ModalTableContainer = styled.div`
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const ModalActions = styled.div`
  padding: 20px 30px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
    box-shadow: 0 4px 15px ${(props) => props.variant === 'primary' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(231, 76, 60, 0.4)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  background: ${props => props.active ? '#667EEa' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#667EEa' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UserRight = () => {
  const [userRights, setUserRights] = useState([]);
  const [roles, setRoles] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    role_id: '',
    command_id: [],
  });
  const [masterLoaded, setMasterLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // 10 items per page

  const groupedCommands = React.useMemo(() => {
    const result = commands.reduce((acc, command) => {
      const appName = command.application || 'Khác';
      if (!acc[appName]) {
        acc[appName] = [];
      }
      acc[appName].push(command);
      acc[appName].sort((a, b) => a.command_name.localeCompare(b.command_name));
      return acc;
    }, {});
    return result;
  }, [commands]);

  const fetchUserRightsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        setUserRights([]);
        return;
      }
      const data = await fetchUserRights(token);
      setUserRights(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách quyền');
      setUserRights([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        toast.error('Vui lòng đăng nhập lại');
        setRoles([]);
        setCommands([]);
        return;
      }
      const [rolesData, commandsData] = await Promise.all([
        fetchRoles(token).catch(err => {
          console.error('Failed to fetch roles:', err);
          return [];
        }),
        fetchUserCommands(token).catch(err => {
          console.error('Failed to fetch commands:', err);
          return [];
        }),
      ]);
      setRoles(rolesData);
      setCommands(commandsData);
      setMasterLoaded(true);
    } catch (error) {
      console.error('fetchMasterData error:', error);
      toast.error(error.message || 'Không thể tải dữ liệu');
      setMasterLoaded(false);
    }
  };

  const handleOpenModal = async () => {
    if (!masterLoaded || roles.length === 0 || commands.length === 0) {
      await fetchMasterData();
    }
    setFormData({ role_id: '', command_id: [] });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }
      const { role_id, command_id } = formData;
      const response = await addUserRight(token, {
        role_id,
        command_id
      });
      if (response.success) {
        toast.success(response.description);
      } else {
        toast.error(response.description);
      }
      setShowModal(false);
      setFormData({ role_id: '', command_id: [] });
      setCurrentPage(1);
      await fetchUserRightsData();
    } catch (error) {
      toast.error('Có lỗi khi phân quyền: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRoleChange = async (e) => {
    const roleId = e.target.value;
    if (roleId) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          toast.error('Vui lòng đăng nhập lại');
          return;
        }
        const data = await fetchUserRightsByRoleId(token, roleId);
        console.log('Raw API response:', data);
        const checked = Array.isArray(data)
          ? data
            .map(item => {
              console.log('Processing item:', item);
              return item.command_id ? String(item.command_id) : null;
            })
            .filter(id => id)
          : [];
        console.log('Checked commands:', checked);
        setFormData(prev => ({ role_id: roleId, command_id: checked }));
      } catch (error) {
        console.error('handleRoleChange error:', error);
        toast.error('Không thể tải quyền hiện tại');
        setFormData(prev => ({ role_id: roleId, command_id: [] }));
      }
    } else {
      setFormData(prev => ({ role_id: '', command_id: [] }));
    }
  };

  const handleCommandChange = (commandId, isChecked) => {
    setFormData(prev => {
      const newCommands = isChecked
        ? [...prev.command_id, commandId]
        : prev.command_id.filter(id => id !== commandId);
      return { ...prev, command_id: newCommands };
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const filteredUserRights = React.useMemo(() => {
    const result = userRights.filter(right => !roleFilter || right.role_id === parseInt(roleFilter));
    return result;
  }, [userRights, roleFilter]);

  // Pagination logic
  const paginatedUserRights = React.useMemo(() => {
    const totalFilteredPages = Math.ceil(filteredUserRights.length / limit);
    setTotalPages(totalFilteredPages || 1);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1);
    }
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUserRights.slice(startIndex, endIndex);
  }, [filteredUserRights, currentPage, limit]);

  useEffect(() => {
    fetchMasterData();
    fetchUserRightsData();
  }, []);

  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  return (
    <Container>
      <Header>
        <Title>🔐 Quản lí phân quyền</Title>
        <AddButton onClick={handleOpenModal}>
          + Phân quyền
        </AddButton>
      </Header>

      <FilterSection>
        <Select value={roleFilter} onChange={handleFilterChange}>
          <option value="">Tất cả vai trò</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.role_name}</option>
          ))}
        </Select>
      </FilterSection>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>🔄 Đang tải...</LoadingSpinner>
        ) : filteredUserRights.length === 0 ? (
          <EmptyState>
            <div className="icon">📚</div>
            <div>Không có dữ liệu</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Vai trò</TableHeaderCell>
                  <TableHeaderCell>Mã chức năng</TableHeaderCell>
                  <TableHeaderCell>Tên chức năng</TableHeaderCell>
                  <TableHeaderCell>Ngày Tạo</TableHeaderCell>
                  <TableHeaderCell>Ngày cập nhật</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {paginatedUserRights.map(right => (
                  <TableRow key={right.id}>
                    <TableCell>{right.id}</TableCell>
                    <TableCell>{roles.find(r => r.id === right.role_id)?.role_name || right.role_id}</TableCell>
                    <TableCell>{right.command_id}</TableCell>
                    <TableCell>{right.command_name}</TableCell>
                    <TableCell>{formatDateTime(right.created_date)}</TableCell>
                    <TableCell>{formatDateTime(right.updated_date)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <Pagination>
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Tiếp →
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </TableContainer>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Phân quyền</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Vai trò</Label>
                <Select value={formData.role_id} onChange={handleRoleChange}>
                  <option value="">Chọn vai trò</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </Select>
              </FormGroup>
              {commands.length === 0 ? (
                <LoadingSpinner>🔄 Đang tải dữ liệu lệnh...</LoadingSpinner>
              ) : (
                <ModalTableContainer>
                  {Object.keys(groupedCommands).map(app => (
                    <FormGroup key={app}>
                      <Label>{app}</Label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell style={{ width: '10%' }}>Chọn</TableHeaderCell>
                            <TableHeaderCell style={{ width: '30%' }}>Mã chức năng</TableHeaderCell>
                            <TableHeaderCell style={{ width: '60%' }}>Tên chức năng</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <tbody>
                          {groupedCommands[app].map(command => {
                            const isChecked = formData.command_id.includes(String(command.command_id));
                            return (
                              <TableRow key={command.command_id}>
                                <TableCell>
                                  <CheckboxItem>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleCommandChange(String(command.command_id), e.target.checked)}
                                      disabled={!formData.role_id}
                                    />
                                  </CheckboxItem>
                                </TableCell>
                                <TableCell>{command.command_id}</TableCell>
                                <TableCell>{command.command_name}</TableCell>
                              </TableRow>
                            );
                          })}
                        </tbody>
                      </Table>
                    </FormGroup>
                  ))}
                </ModalTableContainer>
              )}
            </ModalBody>
            <ModalActions>
              <ActionButton onClick={() => setShowModal(false)}>
                Hủy
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleSubmit}
                disabled={modalLoading || !formData.role_id}
              >
                {modalLoading ? '⏳ Đang lưu...' : 'Gửi'}
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default UserRight;