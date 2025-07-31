import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

// Styled Components
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

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hast-app.online';
  // Room type mapping
  const getRoomTypeName = (type) => {
    const typeMap = {
      'LR': 'Lớp học',
      'LAB': 'Phòng thí nghiệm',
      'GYM': 'Phòng thể dục',
    };
    return typeMap[type] || type;
  };

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);

      // Build query parameters according to API documentation
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort: 'room_code'
      });

      // Add search parameter if provided
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Add room type filter if provided
      if (typeFilter) {
        params.append('filter[room_type]', typeFilter);
      }

      const response = await fetch(`${API_BASE_URL}/api/room?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Set data based on actual API response structure
      let roomList = [];
      if (Array.isArray(data)) {
        roomList = data;
      } else if (data.data_set && Array.isArray(data.data_set)) {
        roomList = data.data_set;
      } else if (data.data && Array.isArray(data.data)) {
        roomList = data.data;
      } else {
        roomList = [];
      }

      setRooms(roomList);
      setTotalPages(Math.ceil((data.pagination?.total || roomList.length || 0) / 10));


    } catch (error) {
      console.error('Error fetching rooms:', error);

      // More detailed error messages
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền truy cập chức năng này.');
      } else if (error.message.includes('404')) {
        toast.error('API endpoint không tồn tại.');
      } else {
        toast.error('Không thể tải danh sách phòng học. Vui lòng thử lại.');
      }

      setRooms([]);
    } finally {
      setLoading(false);
    }
  };
  const handleActionMenuToggle = (roomId) => {
    setOpenActionMenu(openActionMenu === roomId ? null : roomId);
  };
  // Handle room deletion
  const handleDelete = async (roomCode) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng học này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/room/remove/${roomCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Xóa phòng học thành công');
      fetchRooms(); // Refresh data
    } catch (error) {
      console.error('Error deleting room:', error);

      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền xóa phòng học này.');
      } else if (error.message.includes('404')) {
        toast.error('Phòng học không tồn tại.');
      } else {
        toast.error('Không thể xóa phòng học. Vui lòng thử lại.');
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchRooms();
  }, [currentPage, searchTerm, typeFilter]);

  return (
    <Container>
      <Header>
        <Title>🏠 Quản lí phòng học</Title>
        <AddButton onClick={() => toast.success('Chức năng thêm phòng học đang phát triển')}>
          + Tạo phòng học
        </AddButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo mã phòng, tên phòng, loại phòng..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <Select
          value={typeFilter}
          onChange={(e) => handleTypeFilter(e.target.value)}
        >
          <option value="">Tất cả loại phòng</option>
          <option value="LR">Lớp học</option>
          <option value="LAB">Phòng thí nghiệm</option>
          <option value="GYM">Phòng thể dục</option>
        </Select>
      </FilterSection>

      <TableContainer>
        {loading ? (
          <LoadingSpinner>
            🔄 Đang tải dữ liệu...
          </LoadingSpinner>
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
                  <TableHeaderCell style={{ width: '10%' }}>Lớp được phân</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {rooms.map((room) => (
                  <TableRow key={room.room_code}>
                    <TableCell>{room.room_code}</TableCell>
                    <TableCell>{room.room_name}</TableCell>
                    <TableCell>{room.room_type}</TableCell>
                    <TableCell>{room.use_by_class || 'Chưa phân'}</TableCell>
                    <TableCell>
                      <StatusBadge status={room.room_status}>
                        {room.room_status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(room.id)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === room.id}>
                        <ActionMenuItem
                          onClick={() => toast.success('Chức năng đang phát triển')}
                        >
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => toast.success('Chức năng đang phát triển')}
                        >
                          <ActionMenuText>Cập nhật</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => toast.success('Chức năng đang phát triển')}
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
    </Container>
  );
}

export default RoomManagement; 