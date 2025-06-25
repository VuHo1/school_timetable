import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { 
  fetchSubjects as apiFetchSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  fetchGradeLevels 
} from '../../api';

// Get API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hast-app.online';

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
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
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

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Form data
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
  
  // Master data
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjectCodes, setSubjectCodes] = useState([]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      const params = {
        page: currentPage,
        limit: 20,
        sort: 'subject_code'
      };

      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (gradeFilter || statusFilter) {
        params.filter = {};
        if (gradeFilter) params.filter.grade = gradeFilter;
        if (statusFilter) params.filter.status = statusFilter;
      }

      const data = await apiFetchSubjects(token, params);
      const subjectList = data.data_set || data.data || [];
      
      setSubjects(subjectList);
      setTotalPages(Math.ceil((data.pagination?.total || subjectList.length || 0) / 20));
      
      toast.success(`Tải thành công ${subjectList.length} môn học`);
      
    } catch (error) {
      console.error('Error fetching subjects:', error);
      
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền truy cập chức năng này.');
      } else {
        toast.error('Không thể tải danh sách môn học. Vui lòng thử lại.');
      }
      
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch grade levels
      const grades = await fetchGradeLevels(token);
      setGradeLevels(grades || []);
      
      // Fetch subject codes
      const response = await fetch(`${API_BASE_URL}/api/code-list/SUBJECT`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/plain',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjectCodes(data.data_set || []);
      }
      
    } catch (error) {
      console.error('Error fetching master data:', error);
      // Use fallback data
      setGradeLevels([
        { code_id: '10', caption: 'Khối 10' },
        { code_id: '11', caption: 'Khối 11' },
        { code_id: '12', caption: 'Khối 12' }
      ]);
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
        also_update_for_class_subject: 'A' // Update all related class subjects
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
              <Label>Giới hạn đồng thời</Label>
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
            variant="success"
            onClick={isEdit ? handleUpdate : handleCreate}
            disabled={modalLoading}
          >
            {modalLoading ? '⏳ Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo môn học')}
          </ActionButton>
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
          + Thêm môn học
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
                  <TableHeaderCell>Mã môn</TableHeaderCell>
                  <TableHeaderCell>Tên môn</TableHeaderCell>
                  <TableHeaderCell>Khối</TableHeaderCell>
                  <TableHeaderCell>Tiết/tuần</TableHeaderCell>
                  <TableHeaderCell>Tiết liên tiếp</TableHeaderCell>
                  <TableHeaderCell>Học online</TableHeaderCell>
                  <TableHeaderCell>Giới hạn</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                  <TableHeaderCell>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {subjects.map((subject) => (
                  <TableRow key={subject.subject_code}>
                    <TableCell>{subject.subject_code}</TableCell>
                    <TableCell>{subject.subject_name}</TableCell>
                    <TableCell>{subject.grade}</TableCell>
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
                    <TableCell>
                      <ActionButton 
                        onClick={() => handleEdit(subject)}
                        variant="warning"
                      >
                        Sửa
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleDelete(subject.subject_code)}
                        variant="danger"
                      >
                        Xóa
                      </ActionButton>
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
                  « Trước
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
                  Sau »
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </TableContainer>

      {/* Modals */}
      {showCreateModal && <SubjectModal />}
      {showEditModal && <SubjectModal isEdit />}
    </Container>
  );
}

export default SubjectManagement; 