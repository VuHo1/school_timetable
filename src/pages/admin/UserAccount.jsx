import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import {
  fetchUserList,
  createUser,
  activateUser,
  blockUser,
  deleteUser,
  fetchRoles,
} from '../../api';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const Container = styled.div`
  padding: 15px;
  background-color: #f5f5f5;
 
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: bold;
  text-align: left;
  color: #333;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  align-items: flex-end;
`;

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px;
  font-size: 12px;
`;

const SortSelect = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  width: 180px;
  margin-left: auto;
`;

const SearchButton = styled.button`
  padding: 10px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  margin-top: 8px;
  padding: 5px 10px;
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

const CreateButton = styled.button`
  padding: 10px 12px;
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
  position: relative;
  cursor: pointer;
  
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  max-height: 180px;
  overflow-y: auto;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
`;

const FilterItem = styled.div`
  padding: 6px 12px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  &:hover {
    background-color: #588bc1;
  }
  ${(props) => props.selected && `
    background-color: #007bff;
    color: white;
  `}
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

const ActivateButton = styled(ActionButton)`
  background-color: #28a745;
  color: white;
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const BlockButton = styled(ActionButton)`
  background-color: #ffc107;
  color: white;
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
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

const DatePickerWrapper = styled.div`
  width: 100%;
  & .react-datepicker-wrapper {
    width: 100%;
  }
  & .react-datepicker__input-container input {
    width: 95%;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
`;

const PageButton = styled.button`
  padding: 6px 10px;
  background-color: ${props => props.active ? '#007bff' : '#fff'};
  color: ${props => props.active ? '#fff' : '#007bff'};
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: ${props => props.active ? '#0056b3' : '#e7f0fa'};
  }
`;

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
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
const formatLocalDate = (date) => {
  if (!date) return '';
  // Lấy ngày local (không bị ảnh hưởng bởi múi giờ)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Trả về định dạng YYYY-MM-DD
};
export default function UserAccount() {
  const { user } = useAuth();
  const toast = useToast();
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterRoleName, setFilterRoleName] = useState('');
  const [sortField, setSortField] = useState('user_name');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone: '',
    gender: '',
    dob: '',
    role_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roles, setRoles] = useState([]);
  const limit = 10;

  // Refs for dropdown visibility
  const statusDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const genderOptions = [
    { value: '', label: 'Tất cả Giới tính' },
    { value: 'Không xác định / Chưa chọn', label: 'Không xác định / Chưa chọn' },
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' },
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả Trạng thái' },
    { value: 'Đang hoạt động', label: 'Đang hoạt động' },
    { value: 'Bị chặn / Đã khóa', label: 'Bị chặn' },
    { value: 'Đã xóa', label: 'Đã xóa' },
  ];

  const roleOptions = [
    { value: '', label: 'Tất cả Vai trò' },
    ...[...new Set(allUsers.map(user => user.role_name))].map(role => ({
      value: role || 'N/A',
      label: role || 'N/A',
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) {
        console.log('No token found in user object:', user);
        return;
      }
      setLoading(true);
      try {
        console.log('Fetching user list and roles with token:', user.token);
        const [userData, rolesData] = await Promise.all([
          fetchUserList(user.token, { limit: 1000 }),
          fetchRoles(user.token),
        ]);
        console.log('Fetched user data:', userData);
        console.log('Fetched roles data:', rolesData);
        if (Array.isArray(userData)) {
          setAllUsers(userData);
        } else {
          setAllUsers(userData.data_set || []);
        }
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.showToast('Không thể tải dữ liệu. Chi tiết:', 'error');
        console.log('Error details:', error.message);
      } finally {
        setLoading(false);
        applyFilters();
      }
    };
    fetchData();
  }, [user]);

  const applyFilters = () => {
    let filteredUsers = [...allUsers];

    if (searchKeyword) {
      filteredUsers = filteredUsers.filter(user =>
        user.user_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (filterStatus) {
      filteredUsers = filteredUsers.filter(user => user.status === filterStatus);
    }

    if (filterGender) {
      filteredUsers = filteredUsers.filter(user => user.gender === filterGender);
    }

    if (filterRoleName) {
      filteredUsers = filteredUsers.filter(user => user.role_name === filterRoleName);
    }

    filteredUsers.sort((a, b) => {
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
    setUsers(filteredUsers.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredUsers.length / limit));
  };
  const resetPageAndFilter = () => {
    setCurrentPage(1); // Đặt lại về trang 1
    applyFilters(); // Áp dụng bộ lọc
  };
  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterStatus, filterGender, filterRoleName, sortField, sortOrder, currentPage, allUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    applyFilters(); // Chỉ gọi lọc ngay lập tức dựa trên searchKeyword
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!user?.token) return;
    setLoading(true);
    try {
      const phoneRegex = /^0\d{9}$/;
      const currentDate = new Date();
      const inputDate = new Date(newUser.dob);
      if (!phoneRegex.test(newUser.phone)) {
        toast.showToast('Số điện thoại không hợp lệ', 'error');
        return;
      }
      if (inputDate > currentDate) {
        toast.showToast('Ngày sinh không được là ngày tương lai.', 'error');
        return;
      }
      const userData = {
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        gender: newUser.gender,
        dob: new Date(newUser.dob).toISOString(),
        role_id: parseInt(newUser.role_id),
      };
      const response = await createUser(user.token, userData);
      if (!response.success) {
        throw new Error(response.description || 'Tạo tài khoản thất bại.');
      }
      toast.showToast('Tạo tài khoản thành công!', 'success');
      setIsCreateModalOpen(false);
      const updatedData = await fetchUserList(user.token);
      if (Array.isArray(updatedData)) {
        setAllUsers(updatedData);
      } else {
        setAllUsers(updatedData.data_set || []);
      }
      setNewUser({ email: '', full_name: '', phone: '', gender: '', dob: '', role_id: '' });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.showToast(error.message || 'Tạo tài khoản thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (username) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      await activateUser(user.token, username);
      toast.showToast('Kích hoạt tài khoản thành công!', 'success');
      const updatedData = await fetchUserList(user.token);
      if (Array.isArray(updatedData)) {
        setAllUsers(updatedData);
      } else {
        setAllUsers(updatedData.data_set || []);
      }
    } catch (error) {
      console.error('Error activating user:', error);
      toast.showToast('Kích hoạt tài khoản thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (username) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      await blockUser(user.token, username);
      toast.showToast('Chặn tài khoản thành công!', 'success');
      const updatedData = await fetchUserList(user.token);
      if (Array.isArray(updatedData)) {
        setAllUsers(updatedData);
      } else {
        setAllUsers(updatedData.data_set || []);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.showToast('Chặn tài khoản thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      await deleteUser(user.token, username);
      toast.showToast('Xóa tài khoản thành công!', 'success');
      const updatedData = await fetchUserList(user.token);
      if (Array.isArray(updatedData)) {
        setAllUsers(updatedData);
      } else {
        setAllUsers(updatedData.data_set || []);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.showToast('Xóa tài khoản thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // Handle mouse leave to close dropdowns
  useEffect(() => {
    const handleMouseLeave = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.relatedTarget)) {
        setShowStatusDropdown(false);
      }
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.relatedTarget)) {
        setShowGenderDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.relatedTarget)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return (
    <Container>
      <Title>Quản lý tài khoản 👨‍💼</Title>

      <SearchSection>
        <SearchInput
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Tìm kiếm theo tên ,email,số điện thoại..."
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          Tìm kiếm
        </SearchButton>
        <SortSelect
          value={`${sortField}:${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split(':');
            setSortField(field);
            setSortOrder(order);
            setCurrentPage(1);
          }}
        >
          <option value="user_name:ASC">Tên tài khoản (A-Z)</option>
          <option value="user_name:DESC">Tên tài khoản (Z-A)</option>
          <option value="full_name:ASC">Họ tên (A-Z)</option>
          <option value="full_name:DESC">Họ tên (Z-A)</option>
        </SortSelect>
        <CreateButton onClick={() => setIsCreateModalOpen(true)} disabled={loading}>
          + Tạo tài khoản
        </CreateButton>
      </SearchSection>

      <Table>
        <TableHead>
          <tr>
            <TableHeader>Tên tài khoản</TableHeader>
            <TableHeader>Họ và tên</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader
              onMouseEnter={() => setShowGenderDropdown(true)}
              onMouseLeave={() => setShowGenderDropdown(false)}
            >
              Giới tính ▼
              {showGenderDropdown && (
                <FilterDropdown isOpen={showGenderDropdown} ref={genderDropdownRef}>
                  {genderOptions.map((option) => (
                    <FilterItem
                      key={option.value}
                      selected={filterGender === option.value}
                      onClick={() => {
                        setFilterGender(option.value);
                        setShowGenderDropdown(false);
                        applyFilters();
                        resetPageAndFilter();
                      }}
                    >
                      {option.label}
                    </FilterItem>
                  ))}
                </FilterDropdown>
              )}
            </TableHeader>
            <TableHeader
              onMouseEnter={() => setShowRoleDropdown(true)}
              onMouseLeave={() => setShowRoleDropdown(false)}
            >
              Vai trò ▼
              {showRoleDropdown && (
                <FilterDropdown isOpen={showRoleDropdown} ref={roleDropdownRef}>
                  {roleOptions.map((option) => (
                    <FilterItem
                      key={option.value}
                      selected={filterRoleName === option.value}
                      onClick={() => {
                        setFilterRoleName(option.value);
                        setShowRoleDropdown(false);
                        applyFilters();
                        resetPageAndFilter();
                      }}
                    >
                      {option.label}
                    </FilterItem>
                  ))}
                </FilterDropdown>
              )}
            </TableHeader>
            <TableHeader
              onMouseEnter={() => setShowStatusDropdown(true)}
              onMouseLeave={() => setShowStatusDropdown(false)}
            >
              Trạng thái ▼
              {showStatusDropdown && (
                <FilterDropdown isOpen={showStatusDropdown} ref={statusDropdownRef}>
                  {statusOptions.map((option) => (
                    <FilterItem
                      key={option.value}
                      selected={filterStatus === option.value}
                      onClick={() => {
                        setFilterStatus(option.value);
                        setShowStatusDropdown(false);
                        applyFilters();
                        resetPageAndFilter();
                      }}
                    >
                      {option.label}
                    </FilterItem>
                  ))}
                </FilterDropdown>
              )}
            </TableHeader>
            <TableHeader>Hành động</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {loading ? (
            <tr>
              <TableCell colSpan="7" style={{ textAlign: 'center', padding: '15px' }}>Đang tải...</TableCell>
            </tr>
          ) : users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user_name}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email || `N/A`}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{user.role_name}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <ViewButton onClick={() => handleViewDetail(user)}>Xem</ViewButton>
                  <ActivateButton
                    onClick={() => handleActivateUser(user.user_name)}
                    disabled={user.status === 'Đang hoạt động'}
                  >
                    Kích hoạt
                  </ActivateButton>
                  <BlockButton
                    onClick={() => handleBlockUser(user.user_name)}
                    disabled={user.status !== 'Đang hoạt động'}
                  >
                    Chặn
                  </BlockButton>
                  <DeleteButton onClick={() => handleDeleteUser(user.user_name)}>Xóa</DeleteButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <TableCell colSpan="7" style={{ textAlign: 'center', padding: '15px' }}>Không có tài khoản nào.</TableCell>
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

      {isCreateModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Tạo Tài Khoản Mới</ModalTitle>
            <form onSubmit={handleCreateUser}>
              <FormGroup>
                <Label>Email :</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Họ và tên:</Label>
                <Input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Số điện thoại :</Label>
                <Input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Giới tính :</Label>
                <Select
                  value={newUser.gender}
                  onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="0">Không xác định / Chưa chọn</option>
                  <option value="1">Nam</option>
                  <option value="2">Nữ</option>
                  <option value="3">Khác</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Ngày sinh :</Label>
                <DatePickerWrapper>
                  <DatePicker
                    selected={newUser.dob ? new Date(newUser.dob) : null}
                    onChange={(date) => {
                      // Lưu ngày dưới dạng chuỗi YYYY-MM-DD
                      const formattedDate = date ? formatLocalDate(date) : '';
                      setNewUser({ ...newUser, dob: formattedDate });
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    required
                  />
                </DatePickerWrapper>
              </FormGroup>
              <FormGroup>
                <Label>Vai trò :</Label>
                <Select
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                  required
                >
                  <option value="">Chọn vai trò </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
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

      {isDetailModalOpen && selectedUser && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Chi Tiết Tài Khoản</ModalTitle>
            <DetailSection>
              <DetailItem>
                <DetailLabel>Tên đăng nhập:</DetailLabel>
                <DetailValue>{selectedUser.user_name}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Họ và tên:</DetailLabel>
                <DetailValue>{selectedUser.full_name}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Số điện thoại:</DetailLabel>
                <DetailValue>{selectedUser.phone || 'N/A'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Email:</DetailLabel>
                <DetailValue>{selectedUser.email || 'N/A'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Trạng thái:</DetailLabel>
                <DetailValue>{selectedUser.status}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Giới tính:</DetailLabel>
                <DetailValue>{selectedUser.gender || 'N/A'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Ngày sinh:</DetailLabel>
                <DetailValue>{formatDate(selectedUser.dob)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Vai trò:</DetailLabel>
                <DetailValue>{selectedUser.role_name || 'N/A'}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Ngày tạo:</DetailLabel>
                <DetailValue>{formatDateTime(selectedUser.created_date)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Ngày cập nhật:</DetailLabel>
                <DetailValue>{formatDateTime(selectedUser.updated_date)}</DetailValue>
              </DetailItem>
            </DetailSection>
            <CloseButton onClick={() => setIsDetailModalOpen(false)}>Đóng</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}