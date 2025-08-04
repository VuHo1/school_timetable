import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  fetchRoomTypes,
  fetchAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../../api'; // Import API functions from api.js

// Existing styled components (unchanged)
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
    box-shadow: 0 4px 15px rgba(142, 68, 173, 0.4);
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

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
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
    border-color: #8e44ad;
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
  background: ${props => props.status === 'Đang hoạt động' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.status === 'Đang hoạt động' ? '#155724' : '#721c24'};
`;

const RoomTypeBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'type',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.type) {
      case 'LR': return '#e1f5fe';
      case 'LAB': return '#f3e5f5';
      case 'GYM': return '#e8f5e8';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'LR': return '#01579b';
      case 'LAB': return '#4a148c';
      case 'GYM': return '#1b5e20';
      default: return '#666';
    }
  }};
`;

const AssignedBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'assigned',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.assigned ? '#fff3cd' : '#d1ecf1'};
  color: ${props => props.assigned ? '#856404' : '#0c5460'};
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
  background: ${props => props.active ? '#8e44ad' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#8e44ad' : '#f8f9fa'};
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
  padding: 20px;
  border-radius: 12px;
  width: auto;
  min-width: 30%;
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

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
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
  margin-left: 10px;
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

const ModalSelect = styled.select`
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

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: space-around;
  .label {
    font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
    text-align: left;
  }
  .value {
    text-align: right;
    color: #666;
    flex: 1;
  }
`;

// Hàm debounce thủ công
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function RoomManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('room_code');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [createForm, setCreateForm] = useState({
    building_prefix: '',
    floor: 1,
    quantity: 1,
    room_type: '',
  });
  const [updateForm, setUpdateForm] = useState({
    room_code: '',
    room_name: '',
    room_type: '',
  });
  const actionMenuRef = useRef(null);

  // Room type mapping
  const getRoomTypeName = useCallback((type) => {
    const typeMap = roomTypes.reduce((map, type) => {
      map[type.code_id] = type.caption;
      return map;
    }, {});
    return typeMap[type] || type;
  }, [roomTypes]);

  // Fetch room types
  const fetchRoomTypesList = useCallback(async () => {
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    try {
      const roomTypesData = await fetchRoomTypes(user.token);
      setRoomTypes(roomTypesData);
    } catch (error) {
      console.error('Error fetching room types:', error);
      toast.error('Không thể tải danh sách loại phòng.');
    }
  }, [user, navigate]);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sort: `${sortField}:${sortOrder}`,
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (typeFilter || statusFilter) {
        params.filter = {};
        if (typeFilter) params.filter.room_type = typeFilter;
        if (statusFilter) params.filter.room_status = statusFilter;
      }

      const { rooms, pagination } = await fetchAllRooms(user.token, params);
      setRooms(rooms);
      setTotalPages(Math.ceil((pagination?.total || rooms.length || 0) / 10));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      let errorMessage = 'Không thể tải danh sách phòng học.';
      if (error.message.includes('401')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        await logout();
        navigate('/login');
      } else if (error.message.includes('403')) {
        errorMessage = 'Bạn không có quyền truy cập chức năng này.';
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint không tồn tại.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      }
      toast.error(errorMessage);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [user, navigate, logout, currentPage, searchTerm, typeFilter, statusFilter, sortField, sortOrder]);

  // Create room
  const handleCreateRoom = useCallback(async (e) => {
    e.preventDefault();
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    if (!createForm.floor || createForm.floor < 1) {
      toast.error('Tầng phải là số dương.');
      return;
    }
    if (!createForm.quantity || createForm.quantity < 1) {
      toast.error('Số lượng phải là số dương.');
      return;
    }
    if (!createForm.room_type) {
      toast.error('Loại phòng không được để trống.');
      return;
    }
    setIsSubmitting(true);
    try {
      const roomData = {
        building_prefix: createForm.building_prefix,
        floor: parseInt(createForm.floor),
        quantity: parseInt(createForm.quantity),
        room_type: createForm.room_type,
      };
      await createRoom(user.token, roomData);
      toast.success('Tạo phòng học thành công!');
      setShowCreateModal(false);
      setCreateForm({ building_prefix: '', floor: 1, quantity: 1, room_type: '' });
      fetchRooms();
    } catch (error) {
      console.error('Create room error:', error);
      toast.error(error.message || 'Không thể tạo phòng học.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, navigate, createForm, fetchRooms]);

  // Update room
  const handleUpdateRoom = useCallback(async (e) => {
    e.preventDefault();
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    if (!updateForm.room_name) {
      toast.error('Tên phòng không được để trống.');
      return;
    }
    if (!updateForm.room_type) {
      toast.error('Loại phòng không được để trống.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRoom(user.token, updateForm);
      toast.success('Cập nhật phòng học thành công!');
      setShowUpdateModal(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Update room error:', error);
      toast.error(error.message || 'Không thể cập nhật phòng học.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, navigate, updateForm, fetchRooms]);

  // Toggle room status
  const handleToggleStatus = useCallback(async (room) => {
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    const newStatus = room.room_status === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    if (!['Đang hoạt động', 'Ngừng hoạt động'].includes(newStatus)) {
      toast.error('Trạng thái không hợp lệ.');
      return;
    }
    setIsSubmitting(true);
    try {
      const roomData = {
        room_code: room.room_code,
        room_name: room.room_name,
        room_type: room.room_type,
        room_status: newStatus,
      };
      await updateRoom(user.token, roomData);
      toast.success('Cập nhật trạng thái phòng học thành công!');
      fetchRooms();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, navigate, fetchRooms]);

  // Delete room
  const handleDelete = useCallback(async (roomCode) => {
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteRoom(user.token, roomCode);
      toast.success('Thành công!');
      fetchRooms();
    } catch (error) {
      console.error('Delete room error:', error);
      let errorMessage = 'Không thể xóa phòng học.';
      if (error.message.includes('401')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        await logout();
        navigate('/login');
      } else if (error.message.includes('403')) {
        errorMessage = 'Bạn không có quyền xóa phòng học này.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Phòng học không tồn tại.';
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, navigate, logout, fetchRooms]);

  const handleViewDetails = useCallback((room) => {
    setSelectedRoom(room);
    setIsDetailModalOpen(true);
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleTypeFilter = useCallback((value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleActionMenuToggle = useCallback((roomId) => {
    setOpenActionMenu(openActionMenu === roomId ? null : roomId);
  }, [openActionMenu]);

  // Handle click outside to close action menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (!user?.token) {
      toast.error('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    fetchRooms();
    fetchRoomTypesList();
  }, [user, navigate, fetchRooms, fetchRoomTypesList, currentPage, searchTerm, typeFilter, statusFilter, sortField, sortOrder]);

  return (
    <Container>
      <Header>
        <Title>🏠 Quản lí phòng học</Title>
        <AddButton onClick={() => setShowCreateModal(true)}>
          + Tạo phòng học
        </AddButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo mã phòng, tên phòng, loại phòng..."
          onChange={handleSearch}
        />
        <Select
          value={typeFilter}
          onChange={(e) => handleTypeFilter(e.target.value)}
        >
          <option value="">Tất cả loại phòng</option>
          {roomTypes.map((type) => (
            <option key={type.code_id} value={type.caption}>
              {type.caption}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Ngưng hoạt động">Ngừng hoạt động</option>
        </Select>
      </FilterSection>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>🔄 Đang tải dữ liệu...</LoadingSpinner>
        ) : rooms.length === 0 ? (
          <EmptyState>
            <div className="icon">🏠</div>
            <div>Không tìm thấy phòng học nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '10%' }}>Mã phòng</TableHeaderCell>
                  <TableHeaderCell style={{ width: '30%' }}>Tên phòng</TableHeaderCell>
                  <TableHeaderCell style={{ width: '30%' }}>Loại phòng</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Lớp đang học</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {rooms.map((room) => (
                  <TableRow key={room.room_code}>
                    <TableCell>{room.room_code}</TableCell>
                    <TableCell>{room.room_name}</TableCell>
                    <TableCell>
                      <RoomTypeBadge type={room.room_type}>
                        {getRoomTypeName(room.room_type)}
                      </RoomTypeBadge>
                    </TableCell>
                    <TableCell>
                      <AssignedBadge assigned={room.use_by_class}>
                        {room.use_by_class || 'Chưa có lớp'}
                      </AssignedBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={room.room_status}>
                        {room.room_status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(room.id)}
                        ref={actionMenuRef}
                        aria-label={`Thao tác cho phòng ${room.room_code}`}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === room.id}>
                        <ActionMenuItem onClick={() => handleViewDetails(room)}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => {
                            setSelectedRoom(room);
                            setUpdateForm({
                              room_code: room.room_code,
                              room_name: room.room_name,
                              room_type: room.room_type,
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          <ActionMenuText>Cập nhật</ActionMenuText>
                        </ActionMenuItem>

                        <ActionMenuItem
                          onClick={() => handleDelete(room.room_code)}
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

      {/* Create Room Modal */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Tạo phòng học mới</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleCreateRoom}>
              <FormGroup>
                <Label>Mã tòa nhà</Label>
                <Input
                  type="text"
                  placeholder="Nhập mã tòa nhà (không bắt buộc)"
                  value={createForm.building_prefix}
                  onChange={(e) => setCreateForm({ ...createForm, building_prefix: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Tầng *</Label>
                <Input
                  type="number"
                  placeholder="Nhập tầng"
                  value={createForm.floor}
                  onChange={(e) => setCreateForm({ ...createForm, floor: e.target.value })}
                  min="1"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Số lượng *</Label>
                <Input
                  type="number"
                  placeholder="Nhập số lượng"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
                  min="1"
                  required
                />
              </FormGroup>
              <ModalActions>
                <ActionButton
                  type="button"
                  variant="danger"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Update Room Modal */}
      {showUpdateModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Cập nhật phòng học</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleUpdateRoom}>
              <FormGroup>
                <Label>Mã phòng</Label>
                <Input
                  type="text"
                  placeholder="Mã phòng"
                  value={updateForm.room_code}
                  readOnly
                />
              </FormGroup>
              <FormGroup>
                <Label>Tên phòng *</Label>
                <Input
                  type="text"
                  placeholder="Nhập tên phòng"
                  value={updateForm.room_name}
                  onChange={(e) => setUpdateForm({ ...updateForm, room_name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Loại phòng *</Label>
                <ModalSelect
                  value={updateForm.room_type}
                  onChange={(e) => setUpdateForm({ ...updateForm, room_type: e.target.value })}
                  required
                >
                  <option value="">Chọn loại phòng</option>
                  {roomTypes.map((type) => (
                    <option key={type.code_id} value={type.code_id}>
                      {type.caption}
                    </option>
                  ))}
                </ModalSelect>
              </FormGroup>
              <ModalActions>
                <ActionButton
                  type="button"
                  variant="danger"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRoom && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chi tiết phòng học</ModalTitle>
            </ModalHeader>
            <DetailItem>
              <span className="label">Mã phòng:</span>
              <span className="value">{selectedRoom.room_code}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Tên phòng:</span>
              <span className="value">{selectedRoom.room_name}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Loại phòng:</span>
              <span className="value">{getRoomTypeName(selectedRoom.room_type)}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Lớp đang học:</span>
              <span className="value">{selectedRoom.use_by_class || 'Trống'}</span>
            </DetailItem>
            <DetailItem>
              <span className="label">Trạng thái:</span>
              <span className="value">
                <StatusBadge status={selectedRoom.room_status}>
                  {selectedRoom.room_status}
                </StatusBadge>
              </span>
            </DetailItem>
            <ModalActions>
              <ActionButton
                type="button"
                variant="danger"
                onClick={() => setIsDetailModalOpen(false)}
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

export default RoomManagement;