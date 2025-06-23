import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchClasses, toggleClassStatus } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const CreateButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #0056b3;
  }
`;

const SearchSection = styled.div`
  margin-bottom: 20px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #218838;
  }
`;

const ClearButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #5a6268;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #f8f9fa;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: #e9ecef;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

const StatusBadge = styled.button`
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return '#d4edda';
      default:
        return '#f8d7da';
    }
  }};
  color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return '#155724';
      default:
        return '#721c24';
    }
  }};
  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ViewButton = styled.button`
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  &:hover {
    background-color: #138496;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: #c82333;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
`;

const Error = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const NoData = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background-color: #e9ecef;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PageInfo = styled.span`
  margin: 0 10px;
  font-size: 14px;
  color: #666;
`;

const SortIcon = styled.span`
  margin-left: 5px;
  font-size: 12px;
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.h3`
  margin: 0 0 16px 0;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
  line-height: 1.5;
  color: #333;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #c82333;
  }
`;

const CancelModalButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #5a6268;
  }
`;

function ClassManagement() {
    const { user } = useAuth();
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
                limit: 20,
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
                <Title>Quản lý lớp học</Title>
                <CreateButton onClick={handleCreateClass}>
                    Tạo lớp mới
                </CreateButton>
            </Header>

            <SearchSection>
                <SearchForm onSubmit={handleSearch}>
                    <SearchInput
                        type="text"
                        placeholder="Tìm kiếm theo mã lớp, khối, tên phòng, loại phòng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchButton type="submit">
                        Tìm kiếm
                    </SearchButton>
                    {searchTerm && (
                        <ClearButton type="button" onClick={handleClearSearch}>
                            Xóa
                        </ClearButton>
                    )}
                </SearchForm>
            </SearchSection>

            {error && <Error>{error}</Error>}

            {loading ? (
                <Loading>Đang tải danh sách lớp học...</Loading>
            ) : (
                <>
                    <TableContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader onClick={() => handleSort('class_code')}>
                                        Mã lớp
                                        <SortIcon>{getSortIcon('class_code')}</SortIcon>
                                    </TableHeader>
                                    <TableHeader onClick={() => handleSort('grade_level')}>
                                        Khối
                                        <SortIcon>{getSortIcon('grade_level')}</SortIcon>
                                    </TableHeader>
                                    <TableHeader onClick={() => handleSort('room_name')}>
                                        Phòng học
                                        <SortIcon>{getSortIcon('room_name')}</SortIcon>
                                    </TableHeader>
                                    <TableHeader onClick={() => handleSort('room_type_name')}>
                                        Loại phòng
                                        <SortIcon>{getSortIcon('room_type_name')}</SortIcon>
                                    </TableHeader>
                                    <TableHeader onClick={() => handleSort('teacher_full_name')}>
                                        GVCN
                                        <SortIcon>{getSortIcon('teacher_full_name')}</SortIcon>
                                    </TableHeader>
                                    <TableHeader>Trạng thái</TableHeader>
                                    <TableHeader>Thao tác</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.length > 0 ? (
                                    classes.map((cls) => (
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
                                                <ViewButton
                                                    onClick={() => handleViewDetail(cls.class_code)}
                                                >
                                                    Xem chi tiết
                                                </ViewButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <tr>
                                        <TableCell colSpan="7">
                                            <NoData>
                                                {searchTerm 
                                                    ? `Không tìm thấy lớp học nào với từ khóa "${searchTerm}"`
                                                    : "Không có lớp học nào"
                                                }
                                            </NoData>
                                        </TableCell>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                        <Pagination>
                            <PageButton
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← Trước
                            </PageButton>
                            
                            <PageInfo>
                                Trang {currentPage} / {totalPages}
                            </PageInfo>
                            
                            <PageButton
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau →
                            </PageButton>
                        </Pagination>
                    )}
                </>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <ModalOverlay onClick={handleCancelModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
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
                </ModalOverlay>
            )}
        </Container>
    );
}

export default ClassManagement; 