import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAbilities } from '../../hooks/useAbilities';
import { fetchClasses, toggleClassStatus } from '../../api';
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

const CreateButton = styled.button`
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
  }
`;

const ClearButton = styled.button`
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const StatusBadge = styled.button`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border:none;
  background: ${props => props.status === 'Đang hoạt động' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.status === 'Đang hoạt động' ? '#155724' : '#721c24'};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${props => props.variant === 'danger' ? '#e74c3c' : props.variant === 'warning' ? '#f39c12' : '#3498db'};
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

const SortIcon = styled.span`
  margin-left: 8px;
  font-size: 14px;
  opacity: 0.7;
  transition: all 0.3s ease;
`;

// Modal styles
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.h3`
  margin: 0 0 20px 0;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  
  &::before {
    content: "⚠️";
    font-size: 24px;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 32px;
  line-height: 1.6;
  color: #495057;
  font-size: 15px;
  
  p {
    margin: 0 0 12px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #2c3e50;
    font-weight: 600;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
`;

const CancelModalButton = styled.button`
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
  }
`;

function ClassManagement() {
  const { user } = useAuth();
  const { hasAbility } = useAbilities();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('class_code');
  const [sortOrder, setSortOrder] = useState('asc');
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalData, setModalData] = useState({ classCode: '', currentStatus: '', action: '' });

  const loadClasses = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const searchParams = {
        page: currentPage,
        limit: 10,
        sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
        ...params
      };

      if (searchTerm) {
        searchParams.search = searchTerm;
      }

      const result = await fetchClasses(token, searchParams);

      if (result && result.data_set) {
        setClasses(result.data_set);
        if (result.pagination) {
          setTotalPages(result.pagination.last || 1);
        } else {
          setTotalPages(Math.ceil((result.data_set.length) / 20));
        }
      } else {
        setClasses([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Không thể tải danh sách lớp học: ' + err.message);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [currentPage, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadClasses({ search: searchTerm });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadClasses();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleViewDetail = (classCode) => {
    navigate(`/staff/class/${classCode}`);
  };

  const handleUpdateClass = (classCode) => {
    navigate(`/staff/class/update/${classCode}`);
  };

  const handleCreateClass = () => {
    navigate('/staff/class/create');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleToggleStatus = (classCode, currentStatus) => {
    const action = currentStatus?.toLowerCase() === 'đang hoạt động' ? 'deactivate' : 'activate';
    setModalData({ classCode, currentStatus, action });
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    const { classCode, currentStatus } = modalData;
    setShowConfirmModal(false);
    setUpdatingStatus(prev => ({ ...prev, [classCode]: true }));

    try {
      const token = localStorage.getItem('authToken');
      await toggleClassStatus(token, classCode, currentStatus);

      // Reload data để cập nhật trạng thái mới
      await loadClasses();
    } catch (err) {
      setError('Không thể cập nhật trạng thái lớp: ' + err.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [classCode]: false }));
    }
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setModalData({ classCode: '', currentStatus: '', action: '' });
  };

  return (
    <Container>
      <Header>
        <Title>📚 Quản lý lớp học</Title>
        {hasAbility('Quản lí lớp học') && (
          <CreateButton onClick={handleCreateClass}>
            + Tạo lớp mới
          </CreateButton>
        )}
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo mã lớp, khối, tên phòng, loại phòng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchButton onClick={handleSearch}>
          🔍 Tìm kiếm
        </SearchButton>
        {searchTerm && (
          <ClearButton onClick={handleClearSearch}>
            ❌ Xóa
          </ClearButton>
        )}
      </FilterSection>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner>
          🔄 Đang tải danh sách lớp học...
        </LoadingSpinner>
      ) : (
        <>
          <TableContainer>
            {classes.length === 0 ? (
              <EmptyState>
                <div className="icon">📚</div>
                <div>
                  {searchTerm
                    ? `Không tìm thấy lớp học nào với từ khóa "${searchTerm}"`
                    : "Không có lớp học nào"
                  }
                </div>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell onClick={() => handleSort('class_code')}>
                      Mã lớp
                      <SortIcon>{getSortIcon('class_code')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell onClick={() => handleSort('grade_level')}>
                      Khối
                      <SortIcon>{getSortIcon('grade_level')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell onClick={() => handleSort('room_name')}>
                      Phòng học
                      <SortIcon>{getSortIcon('room_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell onClick={() => handleSort('room_type_name')}>
                      Loại phòng
                      <SortIcon>{getSortIcon('room_type_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell onClick={() => handleSort('teacher_full_name')}>
                      GVCN
                      <SortIcon>{getSortIcon('teacher_full_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell>Trạng thái</TableHeaderCell>
                    <TableHeaderCell>Thao tác</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {classes.map((cls) => (
                    <TableRow key={cls.class_code}>
                      <TableCell>{cls.class_code}</TableCell>
                      <TableCell>{cls.grade_level || 'N/A'}</TableCell>
                      <TableCell>{cls.room_name || 'Chưa xếp phòng'}</TableCell>
                      <TableCell>{cls.room_type_name || 'N/A'}</TableCell>
                      <TableCell>{cls.teacher_full_name || 'Chưa có GVCN'}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={cls.status}
                          onClick={() => handleToggleStatus(cls.class_code, cls.status)}
                          disabled={updatingStatus[cls.class_code]}
                          title={cls.status?.toLowerCase() === 'đang hoạt động'
                            ? 'Click để ngừng hoạt động'
                            : 'Click để kích hoạt lại'}
                        >
                          {updatingStatus[cls.class_code]
                            ? 'Đang cập nhật...'
                            : (cls.status || 'N/A')
                          }
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButton
                          variant="primary"
                          onClick={() => handleViewDetail(cls.class_code)}
                        >
                          👁️ Xem
                        </ActionButton>
                        <ActionButton
                          variant="warning"
                          onClick={() => handleUpdateClass(cls.class_code)}
                        >
                          ✏️ Cập nhật
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </TableContainer>

          {totalPages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau →
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              Xác nhận
            </ModalHeader>
            <ModalBody>
              {modalData.action === 'deactivate' ? (
                <>
                  <p><strong>Thao tác này sẽ xóa lớp cùng với các môn học và cấu hình lịch học liên quan.</strong></p>
                  <p>Bạn có chắc chắn muốn ngừng hoạt động lớp <strong>{modalData.classCode}</strong>?</p>
                </>
              ) : (
                <p>Bạn có chắc chắn muốn kích hoạt lại lớp <strong>{modalData.classCode}</strong>?</p>
              )}
            </ModalBody>
            <ModalFooter>
              <CancelModalButton onClick={handleCancelModal}>
                Hủy
              </CancelModalButton>
              <ConfirmButton onClick={handleConfirmToggle}>
                Xác nhận
              </ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default ClassManagement; 
