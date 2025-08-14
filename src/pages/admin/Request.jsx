import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    fetchMyRequests,
    approveRequest,
    rejectRequest,
    subApproveRequest,
    subRejectRequest,
    creatorApproveRequest,
    creatorRejectRequest,
    creatorCancelRequest
} from '../../api';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaEye, FaSpinner } from 'react-icons/fa';

// Styled Components (matching SubjectManagement style)
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

const Select = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'Chờ xử lý' ? '#fefcbf' : props.status === 'Đã từ chối' ? '#f8d7da' : props.status === 'Đã chấp nhận' ? '#d4edda' : '#a6a6a6'};
  color: ${props => props.status === 'Chờ xử lý' ? '#744210' : props.status === 'Đã từ chối' ? '#721c24' : props.status === 'Đã chấp nhận' ? '#155724' : '#3d3c3c'};
`;

const ActionButton = styled.button`
  background: ${props => props.type === 'approve' ? '#3b82f6' : props.type === 'reject' ? '#e74c3c' : '#6B7280'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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

const ModalOverlay = styled.div`
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
  max-width: 500px;
  width: 100%;
  padding: 20px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
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

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RejectInput = styled.textarea`
  width: 95%;
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const SubmitButton = styled.button`
  background: #e74c3c;
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
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
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
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
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

// Reject Dialog Component
const RejectDialog = ({ isOpen, onClose, onSubmit, actionLoading, rejectReason, setRejectReason }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Từ chối yêu cầu</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <label style={{ color: '#2c3e50', fontWeight: 500, marginBottom: '8px' }}>
                        Lý do (không bắt buộc):
                    </label>
                    <RejectInput
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối (nếu có)..."
                    />
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>Hủy</CancelButton>
                    <SubmitButton
                        onClick={onSubmit}
                        disabled={actionLoading}
                    >
                        Xác nhận
                    </SubmitButton>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

// Main Request Component
const Request = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rejectType, setRejectType] = useState('');
    const [filters, setFilters] = useState({
        primary_status: '',
        type_name: '',
        sortBy: 'created_date',
        sortOrder: 'desc'
    });
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const userName = user?.user_name;
    const ITEMS_PER_PAGE = 10;

    // Extract unique filter options
    const filterOptions = useMemo(() => {
        const primaryStatuses = [...new Set(requests.map(r => r.primary_status))].filter(Boolean);
        const typeNames = [...new Set(requests.map(r => r.type_name))].filter(Boolean);
        return { primaryStatuses, typeNames };
    }, [requests]);

    // Filter and sort requests
    const filteredRequests = useMemo(() => {
        let result = [...requests];
        if (filters.primary_status) {
            result = result.filter(r => r.primary_status === filters.primary_status);
        }
        if (filters.type_name) {
            result = result.filter(r => r.type_name === filters.type_name);
        }
        result.sort((a, b) => {
            const dateA = new Date(a.created_date);
            const dateB = new Date(b.created_date);
            return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [requests, filters]);

    // Paginate filtered requests
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredRequests, currentPage]);

    // Update total pages
    useEffect(() => {
        setTotalPages(Math.ceil(filteredRequests.length / ITEMS_PER_PAGE) || 1);
        // Reset to first page if currentPage exceeds totalPages
        if (currentPage > Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)) {
            setCurrentPage(1);
        }
    }, [filteredRequests]);

    // Fetch requests
    const loadRequests = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const response = await fetchMyRequests(user.token);
            console.log('API Response:', response);
            setRequests(response.data_set || []);
        } catch (error) {
            console.error('API Error:', error);
            toast.error(error.message || 'Không thể tải danh sách yêu cầu');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch requests when component mounts or sortOrder changes
    useEffect(() => {
        loadRequests();
    }, [user?.token, filters.sortOrder]);

    // Handle filter change
    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle page change
    const handlePageChange = (page) => {
        console.log('Changing to page:', page);
        setCurrentPage(page);
    };

    // Handle approve
    const handleApprove = async (requestId) => {
        try {
            setActionLoading(true);
            const response = await approveRequest(user.token, requestId);
            if (response.success) {
                toast.success(response.description);
                await loadRequests();
            } else {
                toast.error(response.description);
            }

        } catch (error) {
            toast.error(error.message || 'Không thể xác nhận yêu cầu');
        } finally {
            setActionLoading(false);
        }
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
    // Handle approve
    const handleCreatorApprove = async (requestId) => {
        try {
            setActionLoading(true);
            const response = await creatorApproveRequest(user.token, requestId);
            if (response.success) {
                toast.success(response.description);
                await loadRequests();
            } else {
                toast.error(response.description);
            }

        } catch (error) {
            toast.error(error.message || 'Không thể xác nhận yêu cầu');
        } finally {
            setActionLoading(false);
        }
    };
    // Handle cancel
    const handleCreatorCancel = async (requestId) => {
        try {
            setActionLoading(true);
            const response = await creatorCancelRequest(user.token, requestId);
            if (response.success) {
                toast.success(response.description);
                await loadRequests();
            } else {
                toast.error(response.description);
            }

        } catch (error) {
            toast.error(error.message || 'Không thể xác nhận yêu cầu');
        } finally {
            setActionLoading(false);
        }
    };
    // Handle approve
    const handleSubApprove = async (requestId) => {
        try {
            setActionLoading(true);
            const response = await subApproveRequest(user.token, requestId);
            if (response.success) {
                toast.success(response.description);
                await loadRequests();
            } else {
                toast.error(response.description);
            }

        } catch (error) {
            toast.error(error.message || 'Không thể xác nhận yêu cầu');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle reject
    const handleReject = (requestId) => {
        setSelectedRequestId(requestId);
        setRejectReason('');
        setRejectType('primary');
        setIsRejectDialogOpen(true);
    };

    const handleCreatorReject = (requestId) => {
        setSelectedRequestId(requestId);
        setRejectReason('');
        setRejectType('creator');
        setIsRejectDialogOpen(true);
    };

    const handleSubReject = (requestId) => {
        setSelectedRequestId(requestId);
        setRejectReason('');
        setRejectType('sub');
        setIsRejectDialogOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedRequestId) return;
        try {
            setActionLoading(true);
            let response;

            if (rejectType === 'primary') {
                response = await rejectRequest(user.token, selectedRequestId, rejectReason || '');
            } else if (rejectType === 'creator') {
                response = await creatorRejectRequest(user.token, selectedRequestId, rejectReason || '');
            } else if (rejectType === 'sub') {
                response = await subRejectRequest(user.token, selectedRequestId, rejectReason || '');
            }

            if (response?.success) {
                toast.success(response.description);
                await loadRequests();
                setIsRejectDialogOpen(false);
                setRejectReason('');
                setSelectedRequestId(null);
                setRejectType(''); // Reset reject type
            } else {
                toast.error(response?.description || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error(error.message || 'Không thể từ chối yêu cầu');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <Title>📋 Quản lý yêu cầu</Title>
            </Header>
            <FilterSection>
                <Select
                    value={filters.type_name}
                    onChange={(e) => handleFilterChange('type_name', e.target.value)}
                >
                    <option value="">Tất cả loại yêu cầu</option>
                    {filterOptions.typeNames.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Select
                    value={filters.primary_status}
                    onChange={(e) => handleFilterChange('primary_status', e.target.value)}
                >
                    <option value="">Tất cả trạng thái chính</option>
                    {filterOptions.primaryStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </Select>
                <Select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                    <option value="desc">Mới nhất</option>
                    <option value="asc">Cũ nhất</option>
                </Select>
            </FilterSection>
            <TableContainer>
                {loading ? (
                    <LoadingSpinner>
                        <FaSpinner className="animate-spin" size={24} /> Đang tải dữ liệu...
                    </LoadingSpinner>
                ) : paginatedRequests.length === 0 ? (
                    <EmptyState>
                        <div className="icon">📋</div>
                        <div>Không tìm thấy yêu cầu nào</div>
                    </EmptyState>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell style={{ width: '5%' }}>ID</TableHeaderCell>
                                <TableHeaderCell style={{ width: '15%' }}>Mô tả</TableHeaderCell>
                                <TableHeaderCell style={{ width: '15%' }}>Loại đơn</TableHeaderCell>
                                <TableHeaderCell style={{ width: '15%' }}>Trạng thái</TableHeaderCell>
                                <TableHeaderCell style={{ width: '15%' }}>Ngày tạo</TableHeaderCell>
                                <TableHeaderCell style={{ width: '15%' }}>Người tạo</TableHeaderCell>
                                <TableHeaderCell style={{ width: '20%' }}>Thao tác</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <tbody>
                            {paginatedRequests.map(request => {
                                const canPrimaryApprove = request.action_button?.some(btn => btn.label === 'Xác nhận') && request.primary_approver === userName;
                                const canPrimaryReject = request.action_button?.some(btn => btn.label === 'Từ chối') && request.primary_approver === userName;
                                // const canCreatorApprove = request.action_button?.some(btn => btn.label === 'Xác nhận') && request.creator === userName;
                                // const canCreatorReject = request.action_button?.some(btn => btn.label === 'Từ chối') && request.creator === userName;
                                const canCreatorCancel = request.action_button?.some(btn => btn.label === 'Hủy') && request.creator === userName;
                                const canSubApprove = request.action_button?.some(btn => btn.label === 'Xác nhận') && request.sub_approver === userName && request.creator !== userName;
                                const canSubReject = request.action_button?.some(btn => btn.label === 'Từ chối') && request.sub_approver === userName && request.creator !== userName;
                                return (
                                    <TableRow key={request.id}>
                                        <TableCell>{request.id}</TableCell>
                                        <TableCell>{request.description || '-'}</TableCell>
                                        <TableCell>{request.type_name}</TableCell>
                                        <TableCell><StatusBadge status={request.primary_status}>{request.primary_status}</StatusBadge></TableCell>
                                        <TableCell>{formatDateTime(request.created_date)}</TableCell>
                                        <TableCell>{request.creator}</TableCell>
                                        <TableCell>
                                            <ActionButton
                                                type="view"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/request/${request.id}`);
                                                }}
                                            >
                                                Xem
                                            </ActionButton>
                                            {canCreatorCancel && (
                                                <>
                                                    <ActionButton
                                                        type="reject"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCreatorCancel(request.id);
                                                        }}
                                                    >
                                                        <FaTimesCircle /> Hủy đơn
                                                    </ActionButton>
                                                </>
                                            )}
                                            {(canPrimaryApprove || canSubApprove) && (
                                                <>
                                                    <ActionButton
                                                        type="approve"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (canPrimaryApprove) {
                                                                handleApprove(request.id);
                                                                // } else if (canCreatorApprove) {
                                                                //     handleCreatorApprove(request.id);
                                                            } else if (canSubApprove) {
                                                                handleSubApprove(request.id);
                                                            }
                                                        }}
                                                    >
                                                        <FaCheckCircle /> Xác nhận
                                                    </ActionButton>
                                                </>
                                            )}
                                            {(canPrimaryReject || canSubReject) && (
                                                <>
                                                    <ActionButton
                                                        type="reject"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (canPrimaryReject) {
                                                                handleReject(request.id);
                                                                // } else if (canCreatorReject) {
                                                                //     handleCreatorReject(request.id);
                                                            } else if (canSubReject) {
                                                                handleSubReject(request.id);
                                                            }
                                                        }}
                                                    >
                                                        <FaTimesCircle /> Từ chối
                                                    </ActionButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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
            <RejectDialog
                isOpen={isRejectDialogOpen}
                onClose={() => setIsRejectDialogOpen(false)}
                onSubmit={handleRejectSubmit}
                actionLoading={actionLoading}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
            />
        </Container>
    );
};

export default Request;