import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAbilities } from '../../hooks/useAbilities';
import { fetchClasses, toggleClassStatus, fetchClassScheduleConfig, addClassScheduleConfig } from '../../api';
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
  user-select: none;
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
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
  }
`;

const ActionMenuText = styled.span`
  font-size: 14px;
  color: #2c3e50;
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
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);

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
      if (searchTerm && searchTerm.trim()) {
        searchParams.search = searchTerm.trim();
      }
      const result = await fetchClasses(token, searchParams);

      if (result && result.data_set) {
        setClasses(result.data_set);
        if (result.pagination) {
          setTotalPages(result.pagination.last || 1);
        } else {
          setTotalPages(Math.ceil((result.data_set.length) / 10));
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

  useEffect(() => {
    loadClasses();
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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

  const handleAddSubject = (classCode) => {
    navigate(`/staff/class/add-subject/${classCode}`);
  };

  const handleConfigureSchedule = (classCode) => {
    navigate(`/staff/class/schedule-config/${classCode}`);
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

  const handleActionMenuToggle = (classCode) => {
    setOpenActionMenu(openActionMenu === classCode ? null : classCode);
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
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={searchTerm}
          onChange={handleSearch}
        />
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
                    <TableHeaderCell style={{ width: '7%' }} onClick={() => handleSort('class_code')}>
                      Mã lớp
                      <SortIcon>{getSortIcon('class_code')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '5%' }} onClick={() => handleSort('grade_level')}>
                      Khối
                      <SortIcon>{getSortIcon('grade_level')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '7%' }} onClick={() => handleSort('room_code')}>
                      Phòng học
                      <SortIcon>{getSortIcon('room_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '16%' }} onClick={() => handleSort('room_name')}>
                      Tên phòng
                      <SortIcon>{getSortIcon('room_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '15%' }} onClick={() => handleSort('room_type_name')}>
                      Loại phòng
                      <SortIcon>{getSortIcon('room_type_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '30%' }} onClick={() => handleSort('teacher_full_name')}>
                      GVCN
                      <SortIcon>{getSortIcon('teacher_full_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                    <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {classes.map((cls) => (
                    <TableRow key={cls.class_code}>
                      <TableCell>{cls.class_code}</TableCell>
                      <TableCell>{cls.grade_level || 'N/A'}</TableCell>
                      <TableCell>{cls.room_code || 'Chưa xếp phòng'}</TableCell>
                      <TableCell>{cls.room_name || 'N/A'}</TableCell>
                      <TableCell>{cls.room_type_name || 'N/A'}</TableCell>
                      <TableCell>
                        {cls.teacher_full_name
                          ? `${cls.teacher_full_name} (${cls.teacher_user_name})`
                          : 'Chưa có giáo viên chủ nhiệm'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cls.status}>
                          {cls.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell style={{ position: 'relative' }}>
                        <ActionMenuButton
                          onClick={() => handleActionMenuToggle(cls.class_code)}
                          ref={actionMenuRef}
                        >
                          ⋯
                        </ActionMenuButton>
                        <ActionDropdown isOpen={openActionMenu === cls.class_code}>
                          <ActionMenuItem onClick={() => {
                            handleViewDetail(cls.class_code);
                            setOpenActionMenu(null);
                          }}>
                            <ActionMenuText>Xem chi tiết</ActionMenuText>
                          </ActionMenuItem>
                          {/* <ActionMenuItem onClick={() => {
                            handleUpdateClass(cls.class_code);
                            setOpenActionMenu(null);
                          }}>
                            <ActionMenuText>Cập nhật</ActionMenuText>
                          </ActionMenuItem> */}
                          <ActionMenuItem onClick={() => {
                            handleAddSubject(cls.class_code);
                            setOpenActionMenu(null);
                          }}>
                            <ActionMenuText>Thêm môn học</ActionMenuText>
                          </ActionMenuItem>
                          <ActionMenuItem onClick={() => {
                            handleConfigureSchedule(cls.class_code);
                            setOpenActionMenu(null);
                          }}>
                            <ActionMenuText>Cấu hình lịch học</ActionMenuText>
                          </ActionMenuItem>
                          <ActionMenuItem
                            onClick={() => {
                              handleToggleStatus(cls.class_code, cls.status);
                              setOpenActionMenu(null);
                            }}
                          >
                            <ActionMenuText style={{ color: cls.status?.toLowerCase() === 'đang hoạt động' ? '#e74c3c' : '#28a745' }}>
                              {cls.status?.toLowerCase() === 'đang hoạt động'
                                ? 'Xóa'
                                : 'Kích hoạt'}
                            </ActionMenuText>
                          </ActionMenuItem>
                        </ActionDropdown>
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
                Tiếp →
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}

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