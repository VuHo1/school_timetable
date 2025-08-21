import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import {
  fetchSchool,
  createSchool,
  updateSchool,
  deleteSchool,
} from '../../api';
import styled from 'styled-components';

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
  color: #2c3e50;
`;

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
      case 'Ngưng hoạt động':
        return '#721c24';
      default:
        return '#6c757d';
    }
  }};
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
  max-width: 600px;
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
  background-color: #dc3545;
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

const Select = styled.select`
  box-sizing: border-box;
  width: 100%;
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

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
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

const SchoolManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [allSchools, setAllSchools] = useState([]);
  const [schools, setSchools] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('school_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newSchool, setNewSchool] = useState({
    school_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [updateSchoolData, setUpdateSchoolData] = useState({
    id: '',
    school_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const limit = 10;
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Đang hoạt động', label: 'Đang hoạt động' },
    { value: 'Ngưng hoạt động', label: 'Ngưng hoạt động' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) {
        toast.showToast('Không tìm thấy token xác thực.', 'error');
        return;
      }
      setLoading(true);
      try {
        const schoolData = await fetchSchool(user.token);
        setAllSchools(schoolData);
      } catch (error) {
        toast.showToast('Không thể tải dữ liệu.', 'error');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const applyFilters = () => {
    let filteredSchools = [...allSchools];

    if (!filteredSchools.length) {
      setSchools([]);
      setTotalPages(1);
      return;
    }

    if (searchKeyword) {
      filteredSchools = filteredSchools.filter(
        (school) =>
          school.school_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          school.address?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          school.phone?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          school.email?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (filterStatus) {
      filteredSchools = filteredSchools.filter((school) => school.status === filterStatus);
    }

    filteredSchools.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    const totalFilteredPages = Math.ceil(filteredSchools.length / limit);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1);
    }
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setSchools(filteredSchools.slice(startIndex, endIndex));
    setTotalPages(totalFilteredPages || 1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterStatus, sortField, sortOrder, currentPage, allSchools]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (!user?.token) return;
    setLoading(true);
    try {
      // Trim whitespace from all fields
      const trimmedData = {
        school_name: newSchool.school_name.trim(),
        address: newSchool.address.trim(),
        phone: newSchool.phone.trim(),
        email: newSchool.email.trim(),
        website: newSchool.website.trim(),
      };

      const resultData = await createSchool(user.token, trimmedData);
      if (resultData.success) {
        toast.showToast(resultData.description, 'success');
        setIsCreateModalOpen(false);
        const updatedData = await fetchSchool(user.token);
        setAllSchools(updatedData);
        setNewSchool({ school_name: '', address: '', phone: '', email: '', website: '' });
        setCurrentPage(1);
      } else {
        toast.showToast(resultData.description, 'error');
      }
    } catch (error) {
      toast.showToast(error.message || 'Tạo trường thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    if (!user?.token) return;
    setLoading(true);
    try {
      // Trim whitespace from all fields
      const trimmedData = {
        id: updateSchoolData.id,
        school_name: updateSchoolData.school_name.trim(),
        address: updateSchoolData.address.trim(),
        phone: updateSchoolData.phone.trim(),
        email: updateSchoolData.email.trim(),
        website: updateSchoolData.website.trim(),
      };

      const resultData = await updateSchool(user.token, trimmedData);
      if (resultData.success) {
        toast.showToast(resultData.description, 'success');
        setIsUpdateModalOpen(false);
        const updatedData = await fetchSchool(user.token);
        setAllSchools(updatedData);
        setCurrentPage(1);
      } else {
        toast.showToast(resultData.description, 'error');
      }
    } catch (error) {
      toast.showToast(error.message || 'Cập nhật trường thất bại.', 'error');
    } finally {
      setLoading(false);
      setOpenActionMenu(null);
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const resultData = await deleteSchool(user.token, schoolId);
      if (resultData.success) {
        toast.showToast(resultData.description, 'success');
        const updatedData = await fetchSchool(user.token);
        setAllSchools(updatedData);
        setCurrentPage(1);
      } else {
        toast.showToast(resultData.description, 'error');
      }
    } catch (error) {
      toast.showToast(error.message || 'Xóa trường thất bại.', 'error');
    } finally {
      setLoading(false);
      setOpenActionMenu(null);
    }
  };

  const handleViewDetail = (school) => {
    setSelectedSchool(school);
    setIsDetailModalOpen(true);
    setOpenActionMenu(null);
  };

  const handleOpenUpdateModal = (school) => {
    setUpdateSchoolData({
      id: school.id,
      school_name: school.school_name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      website: school.website,
    });
    setIsUpdateModalOpen(true);
    setOpenActionMenu(null);
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

  const handleActionMenuToggle = (schoolId) => {
    setOpenActionMenu(openActionMenu === schoolId ? null : schoolId);
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

  return (
    <Container>
      <Header>
        <Title>🏫 Quản lý trường</Title>
        <AddButton onClick={() => setIsCreateModalOpen(true)}>
          + Tạo trường
        </AddButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          value={searchKeyword}
          onChange={handleSearchChange}
          placeholder="Tìm kiếm theo tên trường, địa chỉ, số điện thoại..."
        />
        <SelectMenu
          value={`${sortField}:${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split(':');
            setSortField(field);
            setSortOrder(order);
            setCurrentPage(1);
          }}
        >
          <option value="school_name:ASC">Tên trường (A-Z)</option>
          <option value="school_name:DESC">Tên trường (Z-A)</option>
          <option value="created_date:ASC">Ngày tạo (Cũ nhất)</option>
          <option value="created_date:DESC">Ngày tạo (Mới nhất)</option>
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
        ) : schools.length === 0 ? (
          <EmptyState>
            <div className="icon">🏫</div>
            <div>Không tìm thấy trường nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '5%' }}>Id</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Tên trường</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Địa chỉ</TableHeaderCell>
                  <TableHeaderCell style={{ width: '15%' }}>Số điện thoại</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Email</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>{school.id}</TableCell>
                    <TableCell>{school.school_name}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell>{school.phone}</TableCell>
                    <TableCell>{school.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={school.status}>{school.status}</StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(school.id)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === school.id}>
                        <ActionMenuItem
                          onClick={() => handleViewDetail(school)}
                        >
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => handleOpenUpdateModal(school)}
                        >
                          <ActionMenuText>Cập nhật</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => handleDeleteSchool(school.id)}
                          style={{ color: '#e74c3c' }}
                        >
                          <ActionMenuText style={{ color: '#e74c3c' }}>Bật/Tắt trạng thái</ActionMenuText>
                        </ActionMenuItem>
                      </ActionDropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </TableContainer>

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

      {/* Create School Modal */}
      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Tạo trường mới</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleCreateSchool}>
              <FormGroup>
                <Label>Tên trường *</Label>
                <Input
                  type="text"
                  value={newSchool.school_name}
                  onChange={(e) => setNewSchool({ ...newSchool, school_name: e.target.value })}
                  placeholder="Nhập tên trường"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Địa chỉ *</Label>
                <Input
                  type="text"
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Số điện thoại *</Label>
                <Input
                  type="tel"
                  value={newSchool.phone}
                  onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newSchool.email}
                  onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                  placeholder="Nhập email"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Website</Label>
                <Input
                  type="url"
                  value={newSchool.website}
                  onChange={(e) => setNewSchool({ ...newSchool, website: e.target.value })}
                  placeholder="Nhập website (tùy chọn)"
                />
              </FormGroup>
              <ModalActions>
                <ActionButton type="button" onClick={() => setIsCreateModalOpen(false)} disabled={loading}>
                  Hủy
                </ActionButton>
                <ActionButton type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Lưu thông tin'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Update School Modal */}
      {isUpdateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Cập nhật trường</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleUpdateSchool}>
              <FormGroup>
                <Label>Tên trường *</Label>
                <Input
                  type="text"
                  value={updateSchoolData.school_name}
                  onChange={(e) => setUpdateSchoolData({ ...updateSchoolData, school_name: e.target.value })}
                  placeholder="Nhập tên trường"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Địa chỉ *</Label>
                <Input
                  type="text"
                  value={updateSchoolData.address}
                  onChange={(e) => setUpdateSchoolData({ ...updateSchoolData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Số điện thoại *</Label>
                <Input
                  type="tel"
                  value={updateSchoolData.phone}
                  onChange={(e) => setUpdateSchoolData({ ...updateSchoolData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={updateSchoolData.email}
                  onChange={(e) => setUpdateSchoolData({ ...updateSchoolData, email: e.target.value })}
                  placeholder="Nhập email"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Website</Label>
                <Input
                  type="url"
                  value={updateSchoolData.website}
                  onChange={(e) => setUpdateSchoolData({ ...updateSchoolData, website: e.target.value })}
                  placeholder="Nhập website (tùy chọn)"
                />
              </FormGroup>
              <ModalActions>
                <ActionButton type="button" onClick={() => setIsUpdateModalOpen(false)} disabled={loading}>
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

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSchool && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chi tiết trường</ModalTitle>
            </ModalHeader>
            <DetailItem>
              <span className="label">Tên trường:</span>
              <span className="value">{selectedSchool.school_name}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Địa chỉ:</span>
              <span className="value">{selectedSchool.address}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Số điện thoại:</span>
              <span className="value">{selectedSchool.phone}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Email:</span>
              <span className="value">{selectedSchool.email}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Website:</span>
              <span className="value">
                {selectedSchool.website ? (
                  <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer">
                    {selectedSchool.website}
                  </a>
                ) : 'N/A'}
              </span>
            </DetailItem>
            <DetailItem>
              <span className="label">Trạng thái:</span>
              <span className="value">
                <StatusBadge status={selectedSchool.status}>{selectedSchool.status}</StatusBadge>
              </span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày tạo:</span>
              <span className="value">{formatDateTime(selectedSchool.created_date)}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày cập nhật:</span>
              <span className="value">{formatDateTime(selectedSchool.updated_date)}</span>
            </DetailItem>
            <ModalActions>
              <CloseButton onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </CloseButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default SchoolManagement;
