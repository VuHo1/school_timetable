
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import {
  fetchSubjects as apiFetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchGradeLevels,
  fetchSubjectCodeList
} from '../../api';

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
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
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
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
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
    border-color: #27ae60;
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

const OnlineBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOnline',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.isOnline ? '#cce5ff' : '#f0f0f0'};
  color: ${props => props.isOnline ? '#0066cc' : '#666'};
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
  background: ${props => props.active ? '#27ae60' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#27ae60' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal Styles
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
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
  padding: 30px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const ModalActions = styled.div`
  padding: 20px 30px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${(props) => props.variant === 'primary' ? '#3b82f6' : '#e74c3c'};
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
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
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

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
  const [formData, setFormData] = useState({
    subject_code: '',
    grade_level: [],
    is_online_course: false,
    weekly_slot: 1,
    continuous_slot: 1,
    limit: 0,
    fixed_slot: [],
    avoid_slot: []
  });
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjectCodes, setSubjectCodes] = useState([]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = {
        page: currentPage,
        limit: 10,
        sort: 'subject_code'
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (gradeFilter || statusFilter) {
        params.filter = {};
        if (gradeFilter) params.filter.grade_level_id = gradeFilter;
        if (statusFilter) params.filter.status = statusFilter;
      }
      const data = await apiFetchSubjects(token, params);
      const subjectList = data.data_set || data.data || [];
      setSubjects(subjectList);
      setTotalPages(data.pagination.last);
    } catch (error) {
      toast.error(error.message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const grades = await fetchGradeLevels(token);
      setGradeLevels(grades || []);
      const subjectCodeList = await fetchSubjectCodeList(token);
      setSubjectCodes(subjectCodeList || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle create subject
  const handleCreate = async () => {
    try {
      setModalLoading(true);
      if (!formData.subject_code || formData.grade_level.length === 0) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      const token = localStorage.getItem('authToken');
      await createSubject(token, formData);
      toast.success('Tạo môn học thành công!');
      setShowCreateModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Có lỗi khi tạo môn học: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle update subject
  const handleUpdate = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('authToken');
      const updateData = {
        subject_code: selectedSubject.subject_code,
        is_online_course: formData.is_online_course,
        weekly_slot: formData.weekly_slot,
        continuous_slot: formData.continuous_slot,
        limit: formData.limit,
        fixed_slot: formData.fixed_slot,
        avoid_slot: formData.avoid_slot,
        also_update_for_class_subject: 'A'
      };
      await updateSubject(token, updateData);
      toast.success('Cập nhật môn học thành công!');
      setShowEditModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error('Có lỗi khi cập nhật môn học: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete subject
  const handleDelete = async (subjectCode) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await deleteSubject(token, subjectCode);
      toast.success('Xóa môn học thành công');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Có lỗi khi xóa môn học: ' + error.message);
    }
  };

  // Handle view details
  const handleViewDetails = (subject) => {
    setSelectedSubject(subject);
    setShowDetailModal(true);
    setOpenActionMenu(null);
  };

  // Handle edit click
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      grade_level: subject.grade_level || [],
      is_online_course: subject.is_online_course || false,
      weekly_slot: subject.weekly_slot || 1,
      continuous_slot: subject.continuous_slot || 1,
      limit: subject.limit || 0,
      fixed_slot: subject.fixed_slot || [],
      avoid_slot: subject.avoid_slot || []
    });
    setShowEditModal(true);
    setOpenActionMenu(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      subject_code: '',
      grade_level: [],
      is_online_course: false,
      weekly_slot: 1,
      continuous_slot: 1,
      limit: 0,
      fixed_slot: [],
      avoid_slot: []
    });
    setSelectedSubject(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle grade level selection
  const handleGradeLevelChange = (gradeId, isChecked) => {
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        grade_level: [...prev.grade_level, gradeId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        grade_level: prev.grade_level.filter(id => id !== gradeId)
      }));
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    if (type === 'grade') {
      setGradeFilter(value);
    } else if (type === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubjects();
  }, [currentPage, searchTerm, gradeFilter, statusFilter]);

  // Fetch master data on mount
  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionMenuToggle = (subject_code) => {
    setOpenActionMenu(openActionMenu === subject_code ? null : subject_code);
  };

  // Create/Edit Modal Component
  const SubjectModal = ({ isEdit = false }) => (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && (isEdit ? setShowEditModal(false) : setShowCreateModal(false))}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</ModalTitle>
          <CloseButton onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <FormGrid>
            <FormGroup>
              <Label>Mã môn học *</Label>
              {isEdit ? (
                <Input
                  type="text"
                  value={formData.subject_code}
                  disabled
                />
              ) : (
                <Select
                  value={formData.subject_code}
                  onChange={(e) => handleInputChange('subject_code', e.target.value)}
                  required
                >
                  <option value="">Chọn mã môn</option>
                  {subjectCodes.map(code => (
                    <option key={code.code_id} value={code.code_id}>
                      {code.code_id} - {code.caption}
                    </option>
                  ))}
                </Select>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Học online</Label>
              <CheckboxItem>
                <input
                  type="checkbox"
                  checked={formData.is_online_course}
                  onChange={(e) => handleInputChange('is_online_course', e.target.checked)}
                />
                Môn học online
              </CheckboxItem>
            </FormGroup>
            <FormGroup>
              <Label>Số tiết/tuần *</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.weekly_slot}
                onChange={(e) => handleInputChange('weekly_slot', parseInt(e.target.value) || 1)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Số tiết liên tiếp tối đa *</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.continuous_slot}
                onChange={(e) => handleInputChange('continuous_slot', parseInt(e.target.value) || 1)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Giới hạn cùng thời điểm</Label>
              <Input
                type="number"
                min="0"
                value={formData.limit}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value) || 0)}
                placeholder="0 = không giới hạn"
              />
            </FormGroup>
          </FormGrid>
          {!isEdit && (
            <FormGroup>
              <Label>Khối học *</Label>
              <CheckboxGroup>
                {gradeLevels.map(grade => (
                  <CheckboxItem key={grade.code_id}>
                    <input
                      type="checkbox"
                      checked={formData.grade_level.includes(grade.code_id)}
                      onChange={(e) => handleGradeLevelChange(grade.code_id, e.target.checked)}
                    />
                    {grade.caption}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormGroup>
          )}
        </ModalBody>
        <ModalActions>
          <ActionButton
            onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
          >
            Hủy
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={isEdit ? handleUpdate : handleCreate}
            disabled={modalLoading}
          >
            {modalLoading ? '⏳ Đang lưu...' : (isEdit ? 'Xác nhận' : 'Lưu thông tin')}
          </ActionButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );

  // Detail Modal Component
  const DetailModal = ({ subject }) => (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Chi tiết môn học</ModalTitle>
          <CloseButton onClick={() => setShowDetailModal(false)}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <DetailItem>
            <span className="label">Mã môn học:</span>
            <span className="value">{subject.subject_code}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Tên môn học:</span>
            <span className="value">{subject.subject_name}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Khối học:</span>
            <span className="value">{subject.grade_level || 'N/A'}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Số tiết/tuần:</span>
            <span className="value">{subject.weekly_slot}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Số tiết liên tiếp:</span>
            <span className="value">{subject.continuous_slot}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Phương thức :</span>
            <span className="value">{subject.is_online_course ? 'Online' : 'Offline'}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Giới hạn:</span>
            <span className="value">{subject.limit || 'Không giới hạn'}</span>
          </DetailItem>
          <DetailItem>
            <span className="label">Trạng thái:</span>
            <span className="value">
              <StatusBadge status={subject.status}>{subject.status}</StatusBadge>
            </span>
          </DetailItem>
        </ModalBody>
        <ModalActions>
          <ActionButton onClick={() => setShowDetailModal(false)}>Đóng</ActionButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );

  return (
    <Container>
      <Header>
        <Title>📚 Quản lí môn học</Title>
        <AddButton onClick={() => {
          resetForm();
          setShowCreateModal(true);
        }}>
          + Tạo môn học
        </AddButton>
      </Header>
      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm theo mã môn, tên môn, khối..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <Select
          value={gradeFilter}
          onChange={(e) => handleFilterChange('grade', e.target.value)}
        >
          <option value="">Tất cả khối</option>
          {gradeLevels.map(grade => (
            <option key={grade.code_id} value={grade.code_id}>
              {grade.caption}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Dừng hoạt động">Dừng hoạt động</option>
        </Select>
      </FilterSection>
      <TableContainer>
        {loading ? (
          <LoadingSpinner>
            🔄 Đang tải dữ liệu...
          </LoadingSpinner>
        ) : subjects.length === 0 ? (
          <EmptyState>
            <div className="icon">📚</div>
            <div>Không tìm thấy môn học nào</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: '10%' }}>Mã môn</TableHeaderCell>
                  <TableHeaderCell style={{ width: '20%' }}>Tên môn</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Khối</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Tiết/tuần</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Tiết liên tiếp</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Học online</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Giới hạn</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Trạng thái</TableHeaderCell>
                  <TableHeaderCell style={{ width: '10%' }}>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {subjects.map((subject) => (
                  <TableRow key={subject.subject_code}>
                    <TableCell>{subject.subject_code}</TableCell>
                    <TableCell>{subject.subject_name}</TableCell>
                    <TableCell>{subject.grade_level}</TableCell>
                    <TableCell>{subject.weekly_slot}</TableCell>
                    <TableCell>{subject.continuous_slot}</TableCell>
                    <TableCell>
                      <OnlineBadge isOnline={subject.is_online_course}>
                        {subject.is_online_course ? 'Online' : 'Offline'}
                      </OnlineBadge>
                    </TableCell>
                    <TableCell>{subject.limit || 'Không giới hạn'}</TableCell>
                    <TableCell>
                      <StatusBadge status={subject.status}>
                        {subject.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ position: 'relative' }}>
                      <ActionMenuButton
                        onClick={() => handleActionMenuToggle(subject.subject_code)}
                        ref={actionMenuRef}
                      >
                        ⋯
                      </ActionMenuButton>
                      <ActionDropdown isOpen={openActionMenu === subject.subject_code}>
                        <ActionMenuItem onClick={() => handleViewDetails(subject)}>
                          <ActionMenuText>Xem chi tiết</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleEdit(subject)}>
                          <ActionMenuText>Cập nhật</ActionMenuText>
                        </ActionMenuItem>
                        <ActionMenuItem
                          onClick={() => {
                            handleDelete(subject.subject_code);
                            setOpenActionMenu(null);
                          }}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationButton
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationButton>
                ))}
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
      {showCreateModal && <SubjectModal />}
      {showEditModal && <SubjectModal isEdit />}
      {showDetailModal && <DetailModal subject={selectedSubject} />}
    </Container>
  );
}

export default SubjectManagement;
