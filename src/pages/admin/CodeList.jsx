import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { fetchCodeList, addCode, updateCode, deleteCode } from '../../api';
import styled from 'styled-components';

// Styled components inspired by UserAccount.jsx
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  align-items: center;
  overflow-x: auto;
`;

const SearchInput = styled.input`
  width: 250px;
  flex-shrink: 0;
  flex-grow: 0;
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

const SelectMenu = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 150px;
  &:focus {
    outline: none;
    border-color: #667eea;
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.status === 'Đang hoạt động' ? '#d4edda' : '#f8d7da'};
  color: ${(props) =>
    props.status === 'Đang hoạt động' ? '#155724' : '#721c24'};
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
`;

const ActionMenuText = styled.span`
  font-size: 14px;
  color: ${(props) => props.color || '#2c3e50'};
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
  background: ${(props) =>
    props.variant === 'primary' ? '#667eea' : '#6c757d'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.8;
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function CodeList() {
  const { user } = useAuth();
  const toast = useToast();
  const [allCodes, setAllCodes] = useState([]);
  const [codes, setCodes] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCodeName, setFilterCodeName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('code_id');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [codeNameOptions, setCodeNameOptions] = useState([
    { value: '', label: 'Tất cả Mã loại' },
  ]);
  const [statusOptions] = useState([
    { value: '', label: 'Tất cả Trạng thái' },
    { value: 'Đang hoạt động', label: 'Đang hoạt động' },
    { value: 'Ngưng hoạt động', label: 'Ngưng hoạt động' },
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code_id: '',
    code_name: '',
    caption: '',
  });
  const [selectedCode, setSelectedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
  const limit = 10;

  // Handle click outside to close action menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch code list and populate code_name options
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) {
        console.log('No user token available');
        return;
      }
      setLoading(true);
      try {
        const data = await fetchCodeList(user.token);
        console.log('Fetched code list:', data);
        setAllCodes(data || []);
        const uniqueCodeNames = [...new Set(data.map((code) => code.code_name))];
        setCodeNameOptions([
          { value: '', label: 'Tất cả Mã loại' },
          ...uniqueCodeNames.map((name) => ({ value: name, label: name })),
        ]);
      } catch (error) {
        console.error('Error fetching code list:', error);
        toast.showToast('Không thể tải danh sách mã: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

  // Apply filters and pagination
  const applyFilters = () => {
    console.log('Applying filters with:', { searchKeyword, filterCodeName, filterStatus });
    let filteredCodes = [...allCodes];

    if (!filteredCodes.length) {
      setCodes([]);
      setTotalPages(1);
      return;
    }

    if (searchKeyword) {
      filteredCodes = filteredCodes.filter(
        (code) =>
          code.code_id?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          code.code_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          code.caption?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (filterCodeName) {
      filteredCodes = filteredCodes.filter((code) => code.code_name === filterCodeName);
    }

    if (filterStatus) {
      filteredCodes = filteredCodes.filter((code) => code.status === filterStatus);
    }

    filteredCodes.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setCodes(filteredCodes.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredCodes.length / limit));
  };

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterCodeName, filterStatus, sortField, sortOrder, currentPage, allCodes]);

  // Handle action menu toggle
  const handleActionMenuToggle = (id) => {
    console.log('Toggling action menu for id:', id);
    setOpenActionMenu(openActionMenu === id ? null : id);
  };

  // Handle create code
  const handleCreateCode = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      console.log('No user token available');
      return;
    }
    setLoading(true);
    try {
      const response = await addCode(user.token, newCode);
      console.log('Add code response:', response);
      toast.showToast('Thêm mã thành công!', 'success');
      setIsCreateModalOpen(false);
      setNewCode({ code_id: '', code_name: '', caption: '' });
      const updatedData = await fetchCodeList(user.token);
      console.log('Fetched code list after add:', updatedData);
      setAllCodes(updatedData || []);
      setFilterCodeName('');
      setCurrentPage(1);
      const uniqueCodeNames = [...new Set(updatedData.map((code) => code.code_name))];
      setCodeNameOptions([
        { value: '', label: 'Tất cả Mã loại' },
        ...uniqueCodeNames.map((name) => ({ value: name, label: name })),
      ]);
    } catch (error) {
      console.error('Error adding code:', error);
      toast.showToast(error.message || 'Thêm mã thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle update code
  const handleUpdateCode = async (e) => {
    e.preventDefault();
    if (!user?.token || !selectedCode) {
      console.log('No user token or selected code:', { user, selectedCode });
      return;
    }
    setLoading(true);
    try {
      const response = await updateCode(user.token, selectedCode.id, selectedCode.caption);
      console.log('Update code response:', response);
      toast.showToast(response.description, 'success');
      setIsEditModalOpen(false);
      setSelectedCode(null);
      const updatedData = await fetchCodeList(user.token);
      console.log('Fetched code list after update:', updatedData);
      setAllCodes(updatedData || []);
      setFilterCodeName('');
      setCurrentPage(1);
    } catch (error) {
      console.error('Error updating code:', error);
      toast.showToast(error.message || 'Cập nhật mã thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete code
  const handleDeleteCode = async (id) => {
    console.log('Attempting to delete code with id:', id);
    if (!user?.token) {
      console.log('No user token available');
      return;
    }
    setLoading(true);
    try {
      const response = await deleteCode(user.token, id);
      console.log('Delete code response:', response);
      toast.showToast('Thành công thay đổi trạng thái hoạt động', 'success');
      const updatedData = await fetchCodeList(user.token);
      console.log('Fetched code list after delete:', updatedData);
      setAllCodes(updatedData || []);
      setFilterCodeName('');
      setCurrentPage(1);
      const uniqueCodeNames = [...new Set(updatedData.map((code) => code.code_name))];
      setCodeNameOptions([
        { value: '', label: 'Tất cả Mã loại' },
        ...uniqueCodeNames.map((name) => ({ value: name, label: name })),
      ]);
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.showToast(error.message || 'Xóa mã thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle view detail
  const handleViewDetail = (code) => {
    console.log('Viewing details for code:', code);
    setSelectedCode(code);
    setIsDetailModalOpen(true);
    setOpenActionMenu(null);
  };

  // Handle open edit modal
  const handleOpenEditModal = (code) => {
    console.log('Opening edit modal for code:', code);
    setSelectedCode(code);
    setIsEditModalOpen(true);
    setOpenActionMenu(null);
  };

  return (
    <Container>
      <Header>
        <Title>📋 Quản lý Danh sách Mã</Title>
        <AddButton onClick={() => setIsCreateModalOpen(true)}>
          + Thêm mã mới
        </AddButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm mã, tên mã, chú thích..."
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setCurrentPage(1);
          }}
        />
        <SelectMenu
          value={`${sortField}:${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split(':');
            setSortField(field);
            setSortOrder(order);
          }}
        >
          <option value="code_id:ASC">Mã (A-Z)</option>
          <option value="code_id:DESC">Mã (Z-A)</option>
          <option value="code_name:ASC">Tên mã (A-Z)</option>
          <option value="code_name:DESC">Tên mã (Z-A)</option>
        </SelectMenu>
        <SelectMenu
          value={filterCodeName}
          onChange={(e) => {
            setFilterCodeName(e.target.value);
            setCurrentPage(1);
          }}
        >
          {codeNameOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectMenu>
        <SelectMenu
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectMenu>
      </FilterSection>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>🔄 Đang tải dữ liệu...</LoadingSpinner>
        ) : codes.length === 0 ? (
          <EmptyState>
            <div className="icon">📋</div>
            <div>Không tìm thấy mã nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '15%' }}>Mã</TableHeaderCell>
                  <TableHeaderCell style={{ width: '20%' }}>Tên mã</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Chú thích</TableHeaderCell>
                  <TableHeaderCell style={{ width: '15%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '15%' }}>Ngày tạo</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>{code.code_id}</TableCell>
                    <TableCell>{code.code_name}</TableCell>
                    <TableCell>{code.caption}</TableCell>
                    <TableCell>
                      <StatusBadge status={code.status}>{code.status}</StatusBadge>
                    </TableCell>
                    <TableCell>{formatDate(code.created_date)}</TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(code.id)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === code.id}>
                        <ActionMenuItem onClick={() => handleViewDetail(code)}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleOpenEditModal(code)}>
                          <ActionMenuText>Chỉnh sửa</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleDeleteCode(code.id)}>
                          <ActionMenuText color="#e74c3c">Bật/Tắt trạng thái</ActionMenuText>
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

      {/* Create Code Modal */}
      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Thêm mã mới</ModalTitle>
              <CloseButton onClick={() => setIsCreateModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <form onSubmit={handleCreateCode}>
              <FormGroup>
                <Label>Mã *</Label>
                <Input
                  type="text"
                  value={newCode.code_id}
                  onChange={(e) => setNewCode({ ...newCode, code_id: e.target.value })}
                  placeholder="Nhập mã"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Tên mã *</Label>
                <Input
                  type="text"
                  value={newCode.code_name}
                  onChange={(e) => setNewCode({ ...newCode, code_name: e.target.value })}
                  placeholder="Nhập tên mã"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Chú thích *</Label>
                <Input
                  type="text"
                  value={newCode.caption}
                  onChange={(e) => setNewCode({ ...newCode, caption: e.target.value })}
                  placeholder="Nhập chú thích"
                  required
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
                <ActionButton type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Đang thêm...' : 'Thêm mã'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Code Modal */}
      {isEditModalOpen && selectedCode && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chỉnh sửa mã</ModalTitle>

            </ModalHeader>
            <form onSubmit={handleUpdateCode}>
              <FormGroup>
                <Label>Mã</Label>
                <Input type="text" value={selectedCode.code_id} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Tên mã</Label>
                <Input type="text" value={selectedCode.code_name} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Chú thích *</Label>
                <Input
                  type="text"
                  value={selectedCode.caption}
                  onChange={(e) =>
                    setSelectedCode({ ...selectedCode, caption: e.target.value })
                  }
                  placeholder="Nhập chú thích"
                  required
                />
              </FormGroup>
              <ModalActions>
                <ActionButton
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedCode(null);
                  }}
                  disabled={loading}
                >
                  Hủy
                </ActionButton>
                <ActionButton type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedCode && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chi tiết mã</ModalTitle>

            </ModalHeader>
            <DetailItem>
              <span className="label">Mã:</span>
              <span className="value">{selectedCode.code_id}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Tên mã:</span>
              <span className="value">{selectedCode.code_name}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Chú thích:</span>
              <span className="value">{selectedCode.caption}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Trạng thái:</span>
              <span className="value">
                <StatusBadge status={selectedCode.status}>
                  {selectedCode.status}
                </StatusBadge>
              </span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày tạo:</span>
              <span className="value">{formatDate(selectedCode.created_date)}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày cập nhật:</span>
              <span className="value">{formatDate(selectedCode.updated_date)}</span>
            </DetailItem>
            <ModalActions>
              <ActionButton
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedCode(null);
                }}
                disabled={loading}
              >
                Đóng
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}