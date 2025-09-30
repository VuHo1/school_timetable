
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAbilities } from '../../hooks/useAbilities';
import { fetchClasses, toggleClassStatus, createClass, fetchGradeLevels } from '../../api';
import ClassAndSubjectImport from '../../components/ClassAndSubjectImport';
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

const SmallModalContent = styled(ModalContent)`
  max-width: 420px;
  padding: 20px;
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
  background: #3b82f6;
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
  background: #e74c3c;
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
const CreateModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 95%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  overflow-y: auto;
`;

const CreateModalHeader = styled.h2`
  color: #333;
  margin: 0 0 20px 0;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #495057;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px;
  background-color: #f8f9fa;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover:not(:disabled) {
    background-color: #218838;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #5a6268;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 5px;
`;

const Success = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 5px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const HelpText = styled.small`
  color: #666;
  font-size: 12px;
  margin-top: 4px;
`;

const ExampleBox = styled.div`
  background-color: #e9ecef;
  border-left: 4px solid #007bff;
  padding: 12px;
  margin-top: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ExportButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const ImportButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
`;

const CompactButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  background: ${props => props.variant === 'danger' ? '#e74c3c' : props.variant === 'warning' ? '#f59e0b' : '#3b82f6'};
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [formData, setFormData] = useState({
    class_code: '',
    quantity: 1,
    grade_level: []
  });
  const actionMenuRef = useRef(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState('classes');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewSummary, setPreviewSummary] = useState(null);

  const buildPreviewSummary = (res) => {
    try {
      const root = res || {};
      const data = root.data || root.result || root.report || {};
      const pagination = root.pagination || data.pagination || {};
      const totals = {
        total: root.total_rows ?? data.total_rows ?? pagination.total ?? 0,
        success: root.success_count ?? data.success_count ?? data.success_rows ?? 0,
        failed: root.failed_count ?? data.failed_count ?? data.failed_rows_count ?? 0,
      };
      let failedRows = root.failed_rows || data.failed_rows || [];
      const extra = {
        created_classes: data.created_classes ?? 0,
        updated_classes: data.updated_classes ?? 0,
        created_teacher_subjects: data.created_teacher_subjects ?? 0,
        updated_teacher_subjects: data.updated_teacher_subjects ?? 0,
        created_class_subjects: data.created_class_subjects ?? 0,
        updated_class_subjects: data.updated_class_subjects ?? 0,
        deleted_class_subjects: data.deleted_class_subjects ?? 0,
      };

      // Map errors array nếu backend trả về
      const errorsArr = root.errors || data.errors || [];
      if (Array.isArray(errorsArr) && errorsArr.length > 0) {
        const mapped = errorsArr.map((e) => {
          const row = e.row_num ?? e.row ?? data.process_row ?? data.processed_row ?? data.processed_rows ?? '-';
          const parts = [
            e.error_message,
            e.sheet_name ? `Sheet: ${e.sheet_name}` : '',
            e.column_name ? `Cột: ${e.column_name}` : '',
            e.cell_value ? `Giá trị: ${e.cell_value}` : ''
          ].filter(Boolean).join(' | ');
          return { row_number: row, error_message: parts || (root.description || 'Lỗi không xác định') };
        });
        failedRows = failedRows.concat(mapped);
        if (!totals.failed) totals.failed = mapped.length;
        if (!totals.total) totals.total = data.total_rows ?? mapped.length;
        if (!totals.success && totals.total) totals.success = Math.max(totals.total - totals.failed, 0);
      }

      // Thu thập lỗi đơn lẻ nếu backend chỉ trả trong error/error_detail
      const err = root.error || data.error || root.error_detail || data.error_detail || {};
      const hasSingleError = Object.keys(err).length > 0;
      if (hasSingleError) {
        const composed = [
          err.message,
          err.sheet_name ? `Sheet: ${err.sheet_name}` : '',
          (err.row_num || err.row) ? `Dòng: ${err.row_num ?? err.row}` : '',
          (err.col_name || err.column) ? `Cột: ${err.col_name ?? err.column}` : '',
          err.cell_value ? `Giá trị: ${err.cell_value}` : '',
        ].filter(Boolean).join(' | ');
        failedRows = failedRows.concat([{ row_number: err.row_num ?? err.row ?? '-', error_message: composed || (root.description || 'Lỗi không xác định') }]);
        totals.failed = failedRows.length;
        totals.total = Math.max(totals.total || 0, failedRows.length);
        totals.success = Math.max(totals.total - totals.failed, 0);
      }
      return { totals, failedRows, extra };
    } catch (e) {
      return { totals: { total: 0, success: 0, failed: 0 }, failedRows: [], extra: {} };
    }
  };

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

  const loadGradeLevels = async () => {
    setLoadingGrades(true);
    try {
      const token = localStorage.getItem('authToken');
      const result = await fetchGradeLevels(token);
      setGradeLevels(result || []);
    } catch (err) {
      setCreateError('Không thể tải danh sách khối học: ' + err.message);
    } finally {
      setLoadingGrades(false);
    }
  };
  const handleImportSuccess = async () => {
    setLoading(true);
    try {
      await loadClasses();
      toast.showToast('Import lớp học và môn học thành công!', 'success');
    } catch (error) {
      console.error('Error refreshing classes:', error);
      toast.showToast('Không thể làm mới danh sách lớp học', 'error');
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
    if (showCreateModal) {
      loadGradeLevels();
    }
  }, [showCreateModal]);

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
    setShowCreateModal(true);
    setFormData({ class_code: '', quantity: 1, grade_level: [] });
    setCreateError('');
    setCreateSuccess('');
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
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const handleGradeLevelChange = (gradeId, checked) => {
    setFormData(prev => ({
      ...prev,
      grade_level: checked
        ? [...prev.grade_level, gradeId]
        : prev.grade_level.filter(id => id !== gradeId)
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      if (!formData.class_code.trim()) {
        throw new Error('Vui lòng nhập mã lớp');
      }
      if (formData.grade_level.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một khối học');
      }
      if (formData.quantity < 1 || formData.quantity > 50) {
        throw new Error('Số lượng lớp phải từ 1 đến 50');
      }

      const token = localStorage.getItem('authToken');
      await createClass(token, formData);
      setCreateSuccess('Tạo lớp học thành công!');
      setFormData({
        class_code: '',
        quantity: 1,
        grade_level: []
      });
      await loadClasses();
      setTimeout(() => setShowCreateModal(false), 2000);
    } catch (err) {
      setCreateError(err.message || 'Có lỗi xảy ra khi tạo lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCancel = () => {
    setShowCreateModal(false);
    setFormData({ class_code: '', quantity: 1, grade_level: [] });
    setCreateError('');
    setCreateSuccess('');
  };

  const handleDownloadTemplate = async () => {
    if (!user?.token) return;
    try {
      let blob;
      if (importType === 'classes') blob = await downloadTemplateClasses(user.token);
      else if (importType === 'teacher-subjects') blob = await downloadTemplateTeacherSubjects(user.token);
      else blob = await downloadTemplateClassSubjects(user.token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${importType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Tải template thất bại');
    }
  };

  const handlePreviewImport = async () => {
    if (!user?.token || !selectedFile) return;
    setIsImporting(true);
    try {
      let res;
      if (importType === 'classes') res = await importClasses(user.token, selectedFile, true);
      else if (importType === 'teacher-subjects') res = await importTeacherSubjects(user.token, selectedFile, true);
      else res = await importClassSubjects(user.token, selectedFile, true);
      setPreviewData(res);
      setPreviewSummary(buildPreviewSummary(res));
      // Nếu API trả về lỗi 400 nhưng có message mô tả, thêm vào failedRows để hiển thị
      if (!res.http_ok && res.description && (!res.failed_rows || res.failed_rows.length === 0)) {
        setPreviewSummary(prev => prev ? ({
          ...prev,
          totals: { total: prev.totals.total || 1, success: 0, failed: 1 },
          failedRows: [{ row_number: '-', error_message: res.description }]
        }) : ({ totals: { total: 1, success: 0, failed: 1 }, failedRows: [{ row_number: '-', error_message: res.description }], extra: {} }));
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Xem trước thất bại');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile || !user?.token) return;
    setIsImporting(true);
    try {
      let res;
      if (importType === 'classes') res = await importClasses(user.token, selectedFile, false);
      else if (importType === 'teacher-subjects') res = await importTeacherSubjects(user.token, selectedFile, false);
      else res = await importClassSubjects(user.token, selectedFile, false);
      if (!res.http_ok || res.success === false) {
        // Hiển thị lỗi trong modal thay vì alert
        const summary = buildPreviewSummary(res);
        // Nếu vẫn chưa có failedRows, thêm description làm lỗi
        if ((!summary.failedRows || summary.failedRows.length === 0) && res.description) {
          summary.failedRows = [{ row_number: '-', error_message: res.description }];
          summary.totals = { total: 1, success: 0, failed: 1 };
        }
        setPreviewSummary(summary);
        setPreviewData(res);
      } else {
        window.alert(res?.description || 'Import thành công');
        setIsImportModalOpen(false);
        setSelectedFile(null);
        setPreviewData(null);
        setPreviewSummary(null);
        // Làm mới danh sách lớp
        await loadClasses();
      }
    } catch (error) {
      console.error('Error importing users:', error);
      // Không alert chung chung; đưa lỗi vào preview
      setPreviewSummary({ totals: { total: 1, success: 0, failed: 1 }, failedRows: [{ row_number: '-', error_message: error.message || 'Không thể import dữ liệu' }], extra: {} });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>🏫 Quản lí lớp học</Title>
        {hasAbility('Quản lí lớp học') && (
          <HeaderActions>
            <Select value={importType} onChange={(e) => setImportType(e.target.value)}>
              <option value="classes">Lớp</option>
              <option value="teacher-subjects">Phân công môn dạy</option>
              <option value="class-subjects">Môn học lớp</option>
            </Select>
            <ExportButton onClick={handleDownloadTemplate}>📥 Tải mẫu</ExportButton>
            <ImportButton onClick={() => setIsImportModalOpen(true)}>📤 Import</ImportButton>
            <CreateButton onClick={handleCreateClass}>+ Tạo lớp học</CreateButton>
          </HeaderActions>
        )}
      </Header>
      <ClassAndSubjectImport
        token={user?.token}
        onImportSuccess={handleImportSuccess}
      />
      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo mã lớp, khối, mã phòng..."
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
                    <TableHeaderCell style={{ width: '20%' }} onClick={() => handleSort('teacher_user_name')}>
                      GVCN
                      <SortIcon>{getSortIcon('teacher_user_name')}</SortIcon>
                    </TableHeaderCell>
                    <TableHeaderCell style={{ width: '10%' }}>Cập nhật</TableHeaderCell>
                    <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                    <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {classes.map((cls) => (
                    <TableRow key={cls.class_code}>
                      <TableCell>{cls.class_code}</TableCell>
                      <TableCell>{cls.grade_level || 'N/A'}</TableCell>
                      <TableCell>{!cls.room_code || cls.room_code == 'NONE' ? 'Chưa xếp' : cls.room_code}</TableCell>
                      <TableCell>{cls.room_name}</TableCell>
                      <TableCell>{cls.room_type_name || 'N/A'}</TableCell>
                      <TableCell>
                        {!cls.teacher_full_name || cls.teacher_full_name == 'Default' ? 'Chưa có GVCN' : `${cls.teacher_full_name} (${cls.teacher_user_name})`}
                      </TableCell>
                      <TableCell>{formatDateTime(cls.updated_date)}</TableCell>
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

      {showCreateModal && (
        <Modal>
          <CreateModalContent>
            <CreateModalHeader>Tạo lớp học mới</CreateModalHeader>
            {createError && <ErrorMessage>{createError}</ErrorMessage>}
            {createSuccess && <Success>{createSuccess}</Success>}
            <FormContainer>
              <Form onSubmit={handleCreateSubmit}>
                <FormGroup>
                  <Label htmlFor="class_code">Mã lớp *</Label>
                  <Input
                    type="text"
                    id="class_code"
                    name="class_code"
                    value={formData.class_code}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: A, B, C, CLC..."
                    required
                  />
                  <ExampleBox>
                    <strong>Ví dụ:</strong> Nếu chọn mã lớp "A", số lượng 3, khối 10 → Sẽ tạo: 10A01, 10A02, 10A03
                  </ExampleBox>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="quantity">Số lượng lớp *</Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Khối học *</Label>
                  <CheckboxGroup>
                    {loadingGrades ? (
                      <Loading>Đang tải danh sách khối học...</Loading>
                    ) : gradeLevels.length > 0 ? (
                      gradeLevels.map(grade => (
                        <CheckboxItem key={grade.code_id}>
                          <Checkbox
                            type="checkbox"
                            id={`grade_${grade.code_id}`}
                            checked={formData.grade_level.includes(grade.code_id)}
                            onChange={(e) => handleGradeLevelChange(grade.code_id, e.target.checked)}
                          />
                          <CheckboxLabel htmlFor={`grade_${grade.code_id}`}>
                            {grade.caption}
                          </CheckboxLabel>
                        </CheckboxItem>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', color: '#666' }}>
                        Không có dữ liệu khối học
                      </div>
                    )}
                  </CheckboxGroup>
                  <HelpText>
                    Chọn các khối học để tạo lớp. Có thể chọn nhiều khối.
                  </HelpText>
                </FormGroup>

                <ButtonGroup>
                  <CancelButton type="button" onClick={handleCreateCancel}>
                    Hủy
                  </CancelButton>
                  <SubmitButton type="submit" disabled={loading || loadingGrades}>
                    {loading ? 'Đang tạo...' : 'Lưu thông tin'}
                  </SubmitButton>
                </ButtonGroup>
              </Form>
            </FormContainer>
          </CreateModalContent>
        </Modal>
      )}

      {isImportModalOpen && (
        <Modal>
          <SmallModalContent>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              Import {importType === 'classes' ? 'Lớp' : importType === 'teacher-subjects' ? 'Phân công môn dạy' : 'Môn học lớp'}
            </h3>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#2c3e50', minWidth: 90 }}>File Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setPreviewData(null); }}
                style={{ flex: 1, border: '1px solid #ddd', padding: 8, borderRadius: 8, background: '#fff' }}
              />
            </div>

            {previewSummary && (
              <div style={{
                background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: 12, marginBottom: 12
              }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ background: '#eef2ff', color: '#3730a3', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Tổng: {previewSummary.totals.total}</span>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Hợp lệ: {previewSummary.totals.success}</span>
                  <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Lỗi: {previewSummary.totals.failed}</span>
                </div>
                {Array.isArray(previewSummary.failedRows) && previewSummary.failedRows.length > 0 && (
                  <div style={{ marginTop: 10, maxHeight: 180, overflow: 'auto' }}>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {previewSummary.failedRows.map((r, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#991b1b' }}>Dòng {r.row_number}: {r.error_message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Hiển thị thêm chỉ số chi tiết nếu có */}
                {previewSummary.extra && Object.values(previewSummary.extra).some(v => Number(v) > 0) && (
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, color: '#334155' }}>
                    {Object.entries(previewSummary.extra).map(([k, v]) => (
                      <div key={k}>{k.replaceAll('_', ' ')}: <strong>{v}</strong></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Mẹo: Hãy dùng "👁️ Xem trước" để kiểm tra lỗi trước khi import.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CompactButton variant="warning" onClick={handlePreviewImport} disabled={!selectedFile || isImporting}>👁️ Xem trước</CompactButton>
                <CompactButton variant="primary" onClick={handleConfirmImport} disabled={isImporting || (!previewSummary && !selectedFile)}>
                  {previewSummary ? '✅ Xác nhận import' : '🚀 Upload trực tiếp'}
                </CompactButton>
                <CompactButton variant="danger" onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); setPreviewData(null); }}>Đóng</CompactButton>
              </div>
            </div>
          </SmallModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default ClassManagement;
