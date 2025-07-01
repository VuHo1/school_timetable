

// UserCommand.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import {
    fetchUserCommands,
    fetchApplications,
    createUserCommand,
    updateUserCommand,
    deleteUserCommand,
} from '../../api';
import styled from 'styled-components';

// Styled components remain unchanged (omitted for brevity)
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
  max-width: 500px;
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
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
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


const UserCommand = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [allCommands, setAllCommands] = useState([]);
    const [commands, setCommands] = useState([]);
    const [applications, setApplications] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterApplication, setFilterApplication] = useState('');
    const [sortField, setSortField] = useState('command_id');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newCommand, setNewCommand] = useState({
        command_id: '',
        command_name: '',
        application: '',
    });
    const [updateCommand, setUpdateCommand] = useState({
        command_id: '',
        command_name: '',
        application: '',
    });
    const limit = 10;
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const actionMenuRef = useRef(null);

    const statusOptions = [
        { value: '', label: 'Tất cả Trạng thái' },
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
                const [commandData, appData] = await Promise.all([
                    fetchUserCommands(user.token, { limit: 1000 }),
                    fetchApplications(user.token),
                ]);
                setAllCommands(commandData);
                setApplications(appData);
            } catch (error) {
                toast.showToast('Không thể tải dữ liệu.', 'error');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, toast]); // Added toast to dependencies

    const applyFilters = () => {
        let filteredCommands = [...allCommands];

        if (!filteredCommands.length) {
            setCommands([]);
            setTotalPages(1);
            return;
        }

        if (searchKeyword) {
            filteredCommands = filteredCommands.filter(
                (cmd) =>
                    cmd.command_id?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    cmd.command_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    cmd.application?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        if (filterStatus) {
            filteredCommands = filteredCommands.filter((cmd) => cmd.status === filterStatus);
        }

        if (filterApplication) {
            filteredCommands = filteredCommands.filter((cmd) => cmd.application === filterApplication);
        }

        filteredCommands.sort((a, b) => {
            let aValue = a[sortField] || '';
            let bValue = b[sortField] || '';
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
            return 0;
        });

        const totalFilteredPages = Math.ceil(filteredCommands.length / limit);
        // Ensure currentPage is valid for the filtered results
        if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
            setCurrentPage(1);
        }
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        setCommands(filteredCommands.slice(startIndex, endIndex));
        setTotalPages(totalFilteredPages || 1);
    };

    useEffect(() => {
        applyFilters();
    }, [searchKeyword, filterStatus, filterApplication, sortField, sortOrder, currentPage, allCommands]);

    const handleSearchChange = (e) => {
        setSearchKeyword(e.target.value);
        setCurrentPage(1); // Reset to page 1 on search change
    };

    const handleCreateCommand = async (e) => {
        e.preventDefault();
        if (!user?.token) return;
        setLoading(true);
        try {
            if (allCommands.some(cmd => cmd.command_id === newCommand.command_id)) {
                toast.showToast('Mã chức năng đã tồn tại.', 'error');
                return;
            }
            await createUserCommand(user.token, newCommand);
            toast.showToast('Tạo chức năng thành công!', 'success');
            setIsCreateModalOpen(false);
            const updatedData = await fetchUserCommands(user.token, { limit: 1000 });
            setAllCommands(updatedData);
            setNewCommand({ command_id: '', command_name: '', application: '' });
            setCurrentPage(1); // Reset to page 1 after creating
        } catch (error) {
            toast.showToast(error.message || 'Tạo chức năng thất bại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCommand = async (e) => {
        e.preventDefault();
        if (!user?.token) return;
        setLoading(true);
        try {
            await updateUserCommand(user.token, updateCommand);
            toast.showToast('Cập nhật chức năng thành công!', 'success');
            setIsUpdateModalOpen(false);
            const updatedData = await fetchUserCommands(user.token, { limit: 1000 });
            setAllCommands(updatedData);
            setCurrentPage(1); // Reset to page 1 after updating
        } catch (error) {
            toast.showToast(error.message || 'Cập nhật chức năng thất bại.', 'error');
        } finally {
            setLoading(false);
            setOpenActionMenu(null);
        }
    };

    const handleDeleteCommand = async (commandId) => {
        if (!user?.token) return;
        setLoading(true);
        try {
            await deleteUserCommand(user.token, commandId);
            toast.showToast('Xóa chức năng thành công!', 'success');
            const updatedData = await fetchUserCommands(user.token, { limit: 1000 });
            setAllCommands(updatedData);
            setCurrentPage(1); // Reset to page 1 after deleting
        } catch (error) {
            toast.showToast(error.message || 'Xóa chức năng thất bại.', 'error');
        } finally {
            setLoading(false);
            setOpenActionMenu(null);
        }
    };

    const handleViewDetail = (command) => {
        setSelectedCommand(command);
        setIsDetailModalOpen(true);
        setOpenActionMenu(null);
    };

    const handleOpenUpdateModal = (command) => {
        setUpdateCommand({
            command_id: command.command_id,
            command_name: command.command_name,
            application: command.application,
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

    const handleActionMenuToggle = (commandId) => {
        setOpenActionMenu(openActionMenu === commandId ? null : commandId);
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
                <Title>⚙️ Quản lý chức năng</Title>
                <AddButton onClick={() => setIsCreateModalOpen(true)}>
                    + Tạo chức năng
                </AddButton>
            </Header>

            <FilterSection>
                <SearchInput
                    type="text"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    placeholder="Tìm kiếm theo ID, tên chức năng, ứng dụng..."
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
                    <option value="command_id:ASC">Mã chức năng (A-Z)</option>
                    <option value="command_id:DESC">Mã chức năng (Z-A)</option>
                    <option value="command_name:ASC">Tên chức năng (A-Z)</option>
                    <option value="command_name:DESC">Tên chức năng (Z-A)</option>
                </SelectMenu>
                <SelectMenu
                    value={filterApplication}
                    onChange={(e) => {
                        setFilterApplication(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">Tất cả Ứng dụng</option>
                    {applications.map((app) => (
                        <option key={app.application} value={app.application}>
                            {app.application}
                        </option>
                    ))}
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
                ) : commands.length === 0 ? (
                    <EmptyState>
                        <div className="icon">⚙️</div>
                        <div>Không tìm thấy chức năng nào</div>
                    </EmptyState>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell style={{ width: '15%' }}>Mã chức năng</TableHeaderCell>
                                    <TableHeaderCell style={{ width: '30%' }}>Tên chức năng</TableHeaderCell>
                                    <TableHeaderCell style={{ width: '25%' }}>Ứng dụng</TableHeaderCell>
                                    <TableHeaderCell style={{ width: '15%' }}>Trạng thái</TableHeaderCell>
                                    <TableHeaderCell style={{ width: '15%' }}>Thao tác</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <tbody>
                                {commands.map((command) => (
                                    <TableRow key={command.id}>
                                        <TableCell>{command.command_id}</TableCell>
                                        <TableCell>{command.command_name}</TableCell>
                                        <TableCell>{command.application}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={command.status}>{command.status}</StatusBadge>
                                        </TableCell>
                                        <TableCell style={{ position: 'relative' }}>
                                            <ActionMenuButton
                                                onClick={() => handleActionMenuToggle(command.id)}
                                                ref={actionMenuRef}
                                            >
                                                ⋯
                                            </ActionMenuButton>
                                            <ActionDropdown isOpen={openActionMenu === command.id}>
                                                <ActionMenuItem
                                                    onClick={() => handleViewDetail(command)}
                                                >
                                                    <ActionMenuText>Xem chi tiết</ActionMenuText>
                                                </ActionMenuItem>
                                                <ActionMenuItem
                                                    onClick={() => handleOpenUpdateModal(command)}
                                                >
                                                    <ActionMenuText>Cập nhật</ActionMenuText>
                                                </ActionMenuItem>
                                                <ActionMenuItem
                                                    onClick={() => handleDeleteCommand(command.command_id)}
                                                    style={{ color: '#e74c3c' }}
                                                >
                                                    <ActionMenuText style={{ color: '#e74c3c' }}>Xóa</ActionMenuText>
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

            {/* Create Command Modal */}
            {isCreateModalOpen && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Tạo chức năng mới</ModalTitle>
                            <CloseButton onClick={() => setIsCreateModalOpen(false)}>×</CloseButton>
                        </ModalHeader>
                        <form onSubmit={handleCreateCommand}>
                            <FormGroup>
                                <Label>Mã chức năng *</Label>
                                <Input
                                    type="text"
                                    value={newCommand.command_id}
                                    onChange={(e) => setNewCommand({ ...newCommand, command_id: e.target.value })}
                                    placeholder="Nhập mã chức năng"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Tên chức năng *</Label>
                                <Input
                                    type="text"
                                    value={newCommand.command_name}
                                    onChange={(e) => setNewCommand({ ...newCommand, command_name: e.target.value })}
                                    placeholder="Nhập tên chức năng"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Ứng dụng *</Label>
                                <Select
                                    value={newCommand.application}
                                    onChange={(e) => setNewCommand({ ...newCommand, application: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn ứng dụng</option>
                                    {applications.map((app) => (
                                        <option key={app.application} value={app.application}>
                                            {app.application}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <ModalActions>
                                <ActionButton type="button" onClick={() => setIsCreateModalOpen(false)} disabled={loading}>
                                    Hủy
                                </ActionButton>
                                <ActionButton type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Đang tạo...' : 'Tạo chức năng'}
                                </ActionButton>
                            </ModalActions>
                        </form>
                    </ModalContent>
                </Modal>
            )}

            {/* Update Command Modal */}
            {isUpdateModalOpen && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Cập nhật chức năng</ModalTitle>
                            <CloseButton onClick={() => setIsUpdateModalOpen(false)}>×</CloseButton>
                        </ModalHeader>
                        <form onSubmit={handleUpdateCommand}>
                            <FormGroup>
                                <Label>Mã chức năng</Label>
                                <Input
                                    type="text"
                                    value={updateCommand.command_id}
                                    disabled
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Tên chức năng *</Label>
                                <Input
                                    type="text"
                                    value={updateCommand.command_name}
                                    onChange={(e) => setUpdateCommand({ ...updateCommand, command_name: e.target.value })}
                                    placeholder="Nhập tên chức năng"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Ứng dụng *</Label>
                                <Select
                                    value={updateCommand.application}
                                    onChange={(e) => setUpdateCommand({ ...updateCommand, application: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn ứng dụng</option>
                                    {applications.map((app) => (
                                        <option key={app.application} value={app.application}>
                                            {app.application}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <ModalActions>
                                <ActionButton type="button" onClick={() => setIsUpdateModalOpen(false)} disabled={loading}>
                                    Hủy
                                </ActionButton>
                                <ActionButton type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật chức năng'}
                                </ActionButton>
                            </ModalActions>
                        </form>
                    </ModalContent>
                </Modal>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedCommand && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Chi tiết chức năng</ModalTitle>
                            <CloseButton onClick={() => setIsDetailModalOpen(false)}>×</CloseButton>
                        </ModalHeader>
                        <DetailItem>
                            <span className="label">Mã chức năng:</span>
                            <span className="value">{selectedCommand.command_id}</span>
                        </DetailItem>
                        <DetailItem>
                            <span className="label">Tên chức năng:</span>
                            <span className="value">{selectedCommand.command_name}</span>
                        </DetailItem>
                        <DetailItem>
                            <span className="label">Ứng dụng:</span>
                            <span className="value">{selectedCommand.application}</span>
                        </DetailItem>
                        <DetailItem>
                            <span className="label">Trạng thái:</span>
                            <span className="value">
                                <StatusBadge status={selectedCommand.status}>{selectedCommand.status}</StatusBadge>
                            </span>
                        </DetailItem>
                        <DetailItem>
                            <span className="label">Ngày tạo:</span>
                            <span className="value">{formatDateTime(selectedCommand.created_date)}</span>
                        </DetailItem>
                        <DetailItem>
                            <span className="label">Ngày cập nhật:</span>
                            <span className="value">{formatDateTime(selectedCommand.updated_date)}</span>
                        </DetailItem>
                        <ModalActions>
                            <ActionButton onClick={() => setIsDetailModalOpen(false)}>
                                Đóng
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
};

export default UserCommand;