import React, { useState, useEffect } from 'react';
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

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      // Build query parameters according to API documentation
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: 'subject_code'
      });

      // Add search parameter if provided
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Add grade filter if provided
      if (gradeFilter) {
        params.append('filter[grade]', gradeFilter);
      }

      const response = await fetch(`/api/subject?${params}`, {
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
      let subjectList = [];
      if (Array.isArray(data)) {
        subjectList = data;
      } else if (data.data_set && Array.isArray(data.data_set)) {
        subjectList = data.data_set;
      } else if (data.data && Array.isArray(data.data)) {
        subjectList = data.data;
      } else {
        subjectList = [];
      }
      
      setSubjects(subjectList);
      setTotalPages(Math.ceil((data.pagination?.total || subjectList.length || 0) / 20));
      
      toast.success(`Tải thành công ${subjectList.length} môn học`);
      
    } catch (error) {
      console.error('Error fetching subjects:', error);
      
      // More detailed error messages
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền truy cập chức năng này.');
      } else if (error.message.includes('404')) {
        toast.error('API endpoint không tồn tại.');
      } else {
        toast.error('Không thể tải danh sách môn học. Vui lòng thử lại.');
      }
      
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle subject deletion
  const handleDelete = async (subjectCode) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subject/remove/${subjectCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Xóa môn học thành công');
      fetchSubjects(); // Refresh data
    } catch (error) {
      console.error('Error deleting subject:', error);
      
      if (error.message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message.includes('403')) {
        toast.error('Bạn không có quyền xóa môn học này.');
      } else if (error.message.includes('404')) {
        toast.error('Môn học không tồn tại.');
      } else {
        toast.error('Không thể xóa môn học. Vui lòng thử lại.');
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleGradeFilter = (value) => {
    setGradeFilter(value);
    setCurrentPage(1);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubjects();
  }, [currentPage, searchTerm, gradeFilter]);

  return (
    <Container>
      <Header>
        <Title>📚 Quản lí môn học</Title>
        <AddButton onClick={() => toast.success('Chức năng thêm môn học đang phát triển')}>
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
          onChange={(e) => handleGradeFilter(e.target.value)}
        >
          <option value="">Tất cả khối</option>
          <option value="10">Khối 10</option>
          <option value="11">Khối 11</option>
          <option value="12">Khối 12</option>
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
                        variant="primary"
                        onClick={() => toast.success('Chức năng xem chi tiết đang phát triển')}
                      >
                        Xem
                      </ActionButton>
                      <ActionButton 
                        variant="warning"
                        onClick={() => toast.success('Chức năng chỉnh sửa đang phát triển')}
                      >
                        Sửa
                      </ActionButton>
                      <ActionButton 
                        variant="danger"
                        onClick={() => handleDelete(subject.subject_code)}
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

export default SubjectManagement; 