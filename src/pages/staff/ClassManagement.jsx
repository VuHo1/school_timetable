import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAbilities } from '../../hooks/useAbilities';
import { fetchClasses, toggleClassStatus } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SearchSection = styled.div`
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(40, 167, 69, 0.4);
  }
`;

const ClearButton = styled.button`
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(108, 117, 125, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(108, 117, 125, 0.4);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHeader = styled.th`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  color: #495057;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    color: #212529;
  }
  
  &:first-child {
    border-top-left-radius: 16px;
  }
  
  &:last-child {
    border-top-right-radius: 16px;
  }
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f8f9fa;
    transform: scale(1.01);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  &:last-child td:first-child {
    border-bottom-left-radius: 16px;
  }
  
  &:last-child td:last-child {
    border-bottom-right-radius: 16px;
  }
`;

const TableCell = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
  
  &:first-child {
    font-weight: 500;
    color: #2c3e50;
  }
`;

const StatusBadge = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
      default:
        return 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
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
  
  border-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'đang hoạt động':
      case 'active':
        return '#28a745';
      default:
        return '#dc3545';
    }
  }};
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
`;

const ActionButton = styled.button`
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ViewButton = styled(ActionButton)`
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
  }
`;

const UpdateButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 40px;
  font-size: 18px;
  color: #6c757d;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 20px 0;
  
  &::before {
    content: "⏳";
    display: block;
    font-size: 32px;
    margin-bottom: 16px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 2px solid #dc3545;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
  
  &::before {
    content: "⚠️ ";
    margin-right: 8px;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 60px 40px;
  color: #6c757d;
  font-style: italic;
  font-size: 16px;
  
  &::before {
    content: "📋";
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PageButton = styled.button`
  padding: 10px 16px;
  border: 2px solid #e9ecef;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #007bff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    background: #f8f9fa;
    color: #6c757d;
    transform: none;
  }
`;

const PageInfo = styled.span`
  margin: 0 16px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 20px;
`;

const SortIcon = styled.span`
  margin-left: 8px;
  font-size: 14px;
  opacity: 0.7;
  transition: all 0.3s ease;
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 1px solid #e9ecef;
  
  @keyframes slideUp {
    from { 
      transform: translateY(30px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
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
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  
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
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  
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
                <Title>Quản lý lớp học</Title>
                {hasAbility('Quản lí lớp học') && (
                    <CreateButton onClick={handleCreateClass}>
                        Tạo lớp mới
                    </CreateButton>
                )}
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
                                                <ActionButtonContainer>
                                                    <ViewButton
                                                        onClick={() => handleViewDetail(cls.class_code)}
                                                    >
                                                        👁️ Xem
                                                    </ViewButton>
                                                    <UpdateButton
                                                        onClick={() => handleUpdateClass(cls.class_code)}
                                                    >
                                                        ✏️ Cập nhật
                                                    </UpdateButton>
                                                </ActionButtonContainer>
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
