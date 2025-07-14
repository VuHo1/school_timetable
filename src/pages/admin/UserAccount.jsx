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
  assignUserRole,
} from '../../api';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    background-color: #667eea;
    color: white;
  }
  ${(props) => props.selected && `
    background-color: #667eea;
    color: white;
  `}
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${props => props.variant === 'danger' ? '#e74c3c' : props.variant === 'primary' ? '#3498db' : '#666'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
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
    background: #4338ca; /* Indigo-700 */
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
  }
`;

const ActionMenuIcon = styled.span`
  font-size: 14px;
  width: 16px;
  text-align: center;
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

// Modal Styled Components
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
  padding: 20px;
  border-radius: 12px;
  width:50%;
  height: 80%;
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
  display: flex;
  justify-content: space-between;
`;

const Label = styled.div`
  font-weight: 500;
  color: #2c3e50;
  text-align: left;
  margin-top: 10px;
  padding-right: 10px;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 510px;
  margin-left:10px;
  padding: 10px;
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
  width: 510px;
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
const DatePickerWrapper = styled.div`
  width: 510px;
  & .react-datepicker-wrapper {
    width: 100%;
  }
  & .react-datepicker__input-container input {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #667eea;
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:hover {
      border-color: #bbb;
    }
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
  const [roleOptions, setRoleOptions] = useState([
    { value: '', label: 'Tất cả Vai trò' }
  ]);

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
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false); // New state for role assignment modal
  const [selectedRoleId, setSelectedRoleId] = useState(''); // New state for selected role
  const [selectedUsername, setSelectedUsername] = useState(''); // New state for selected username
  const limit = 10;

  // Refs for dropdown visibility
  const statusDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Add state for action dropdown
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);

  const genderOptions = [
    { value: '', label: 'Tất cả Giới tính' },
    { value: 'Không xác định', label: 'Không xác định' },
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' },
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả Trạng thái' },
    { value: 'Đang hoạt động', label: 'Đang hoạt động' },
    { value: 'Tạm khóa', label: 'Tạm khóa' },
    { value: 'Ngưng hoạt động', label: 'Ngưng hoạt động' },
  ];

  // const roleOptions = [
  //   { value: '', label: 'Tất cả Vai trò' },
  //   ...[...new Set(allUsers.map(user => user.role_name))].map(role => ({
  //     value: role || 'N/A',
  //     label: role || 'N/A',
  //   })),
  // ];

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
        if (Array.isArray(rolesData)) {
          const options = [
            { value: '', label: 'Tất cả Vai trò' },
            ...rolesData.map(role => ({
              value: role.role_name || 'N/A',
              label: role.role_name || 'N/A'
            }))
          ];
          setRoleOptions(options);
        }
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
    if (!filteredUsers.length) {
      setUsers([]);
      setTotalPages(1);
      return;
    }

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
    const totalFilteredPages = Math.ceil(filteredUsers.length / limit);
    // Ensure currentPage is valid for the filtered results
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setUsers(filteredUsers.slice(startIndex, endIndex));
    setTotalPages(totalFilteredPages || 1);
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
  const handleAssignRole = async () => {
    if (!user?.token || !selectedRoleId || !selectedUsername) return;
    setLoading(true);
    try {
      await assignUserRole(user.token, parseInt(selectedRoleId), selectedUsername);
      toast.showToast('Gán vai trò thành công!', 'success');
      setIsAssignRoleModalOpen(false);
      window.location.reload();
      const updatedData = await fetchUserList(user.token);
      setAllUsers(updatedData.data_set || []);
      setSelectedRoleId('');
      setSelectedUsername('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.showToast(error.message || 'Gán vai trò thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleOpenAssignRoleModal = (user) => {
    setSelectedUsername(user.user_name);
    setSelectedRoleId(user.role_id || '');
    setIsAssignRoleModalOpen(true);
    setOpenActionMenu(null);
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

  const handleActionMenuToggle = (userId) => {
    setOpenActionMenu(openActionMenu === userId ? null : userId);
  };

  return (
    <Container>


      <Header>
        <Title>👨‍💼 Quản lý tài khoản</Title>
        <AddButton onClick={() => setIsCreateModalOpen(true)}>
          + Tạo tài khoản
        </AddButton>
      </Header>


      <FilterSection>
        <SearchInput
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
        />

        <SelectMenu
          value={`${sortField}:${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split(':');
            setSortField(field);
            setSortOrder(order);
          }}
        >
          <option value="user_name:ASC">Tên tài khoản (A-Z)</option>
          <option value="user_name:DESC">Tên tài khoản (Z-A)</option>
          <option value="full_name:ASC">Họ tên (A-Z)</option>
          <option value="full_name:DESC">Họ tên (Z-A)</option>
        </SelectMenu>
        <SelectMenu
          value={filterRoleName}
          onChange={(e) => {
            setFilterRoleName(e.target.value);
            resetPageAndFilter();
          }}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectMenu>

        {/* Filter giới tính */}
        <SelectMenu
          value={filterGender}
          onChange={(e) => {
            setFilterGender(e.target.value);
            resetPageAndFilter();
          }}
        >
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectMenu>

        {/* Filter trạng thái */}
        <SelectMenu
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            resetPageAndFilter();
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
          <LoadingSpinner>
            🔄 Đang tải dữ liệu...
          </LoadingSpinner>
        ) : users.length === 0 ? (
          <EmptyState>
            <div className="icon">👨‍💼</div>
            <div>Không tìm thấy tài khoản nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '10%' }}>Tên tài khoản</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Họ và tên</TableHeaderCell>
                  <TableHeaderCell style={{ width: '25%' }}>Email</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Giới tính</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Vai trò</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.user_name}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.role_name}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.status}>
                        {user.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(user.id)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === user.id}>
                        <ActionMenuItem onClick={() => {
                          handleViewDetail(user);
                          setOpenActionMenu(null);
                        }}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => {
                            handleActivateUser(user.user_name);
                            setOpenActionMenu(null);
                          }}
                          style={{
                            opacity: user.status === 'Đang hoạt động' ? 0.5 : 1,
                            cursor: user.status === 'Đang hoạt động' ? 'not-allowed' : 'pointer'
                          }}
                          onMouseDown={(e) => {
                            if (user.status === 'Đang hoạt động') {
                              e.preventDefault();
                              return;
                            }
                          }}
                        >
                          <ActionMenuText >Kích hoạt</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => {
                            handleBlockUser(user.user_name);
                            setOpenActionMenu(null);
                          }}
                          style={{
                            opacity: user.status === 'Tạm khóa' ? 0.5 : 1,
                            cursor: user.status === 'Tạm khóa' ? 'not-allowed' : 'pointer'
                          }}
                          onMouseDown={(e) => {
                            if (user.status === 'Tạm khóa') {
                              e.preventDefault();
                              return;
                            }
                          }}
                        >
                          <ActionMenuText>Chặn</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => handleOpenAssignRoleModal(user)} // New action menu item
                        >
                          <ActionMenuText>Gán vai trò</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => {
                            handleDeleteUser(user.user_name);
                            setOpenActionMenu(null);
                          }}
                          style={{
                            color: '#e74c3c',
                            opacity: user.status === 'Ngưng hoạt động' ? 0.5 : 1,
                            cursor: user.status === 'Ngưng hoạt động' ? 'not-allowed' : 'pointer'
                          }}
                          onMouseDown={(e) => {
                            if (user.status === 'Ngưng hoạt động') {
                              e.preventDefault();
                              return;
                            }
                          }}
                        >
                          <ActionMenuText style={{ color: '#e74c3c' }}>Xóa</ActionMenuText>
                        </ActionMenuItem>
                      </ActionDropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>


          </>
        )}
      </TableContainer>{totalPages > 1 && (
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

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Tạo tài khoản mới</ModalTitle>

            </ModalHeader>
            <form onSubmit={handleCreateUser}>
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Nhập email"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Họ và tên *</Label>
                <Input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Số điện thoại *</Label>
                <Input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Ngày sinh *</Label>

                <DatePickerWrapper>
                  <DatePicker
                    selected={newUser.dob ? new Date(newUser.dob) : null}
                    onChange={(date) => {

                      const formattedDate = date ? formatLocalDate(date) : '';
                      setNewUser({ ...newUser, dob: formattedDate });
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    required
                  />
                </DatePickerWrapper>
              </FormGroup>
              <FormGroup>
                <Label>Giới tính *</Label>
                <Select
                  value={newUser.gender}
                  onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="0">Không xác định</option>
                  <option value="1">Nam</option>
                  <option value="2">Nữ</option>
                  <option value="3">Khác</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Vai trò *</Label>
                <Select
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                  required
                >
                  <option value="">Chọn vai trò</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
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
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
      {/* Assign Role Modal */}
      {isAssignRoleModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Gán vai trò cho tài khoản</ModalTitle>

            </ModalHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAssignRole(); }}>
              <FormGroup>
                <Label>Tên tài khoản</Label>
                <Input type="text" value={selectedUsername} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Vai trò *</Label>
                <Select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  required
                >
                  <option value="">Chọn vai trò</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <ModalActions>
                <ActionButton
                  type="button"
                  onClick={() => setIsAssignRoleModalOpen(false)}
                  disabled={loading}
                >
                  Hủy
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="primary"
                  disabled={loading || !selectedRoleId}
                >
                  {loading ? 'Đang gán...' : 'Gán vai trò'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
      {/* User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chi tiết tài khoản</ModalTitle>
            </ModalHeader>
            <DetailItem>
              <span className="label">Tên tài khoản:</span>
              <span className="value">{selectedUser.user_name}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Họ và tên:</span>
              <span className="value">{selectedUser.full_name}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Số điện thoại:</span>
              <span className="value">{selectedUser.phone || 'N/A'}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Email:</span>
              <span className="value">{selectedUser.email || 'N/A'}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Trạng thái:</span>
              <span className="value">
                <StatusBadge status={selectedUser.status}>
                  {selectedUser.status}
                </StatusBadge>
              </span>
            </DetailItem>
            <DetailItem>
              <span className="label">Giới tính:</span>
              <span className="value">{selectedUser.gender || 'N/A'}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày sinh:</span>
              <span className="value">
                {formatDate(selectedUser.dob)}
              </span>
            </DetailItem>
            <DetailItem>
              <span className="label">Vai trò:</span>
              <span className="value">{selectedUser.role_name || 'N/A'}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày tạo:</span>
              <span className="value">{formatDateTime(selectedUser.created_date)}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Ngày cập nhật:</span>
              <span className="value">{formatDateTime(selectedUser.updated_date)}</span>
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
}