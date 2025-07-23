import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { fetchSystemLogs } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 15px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: bold;
  text-align: left;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
`;

const TableHead = styled.thead``;

const TableHeader = styled.th`
  padding: 8px;
  border: 1px solid #dee2e6;
  text-align: left;
  background-color: #e9ecef;
  font-size: 14px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #dee2e6;
  font-size: 14px;
  text-align: left;
`;

const ActionButton = styled.button`
  padding: 3px 6px;
  margin-right: 4px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  &:hover {
    opacity: 0.9;
  }
`;

const ViewButton = styled(ActionButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 300;
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  width: 60%;
  margin-top: 20px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px;
  background-color: #f9f9f9;
  border-radius: 3px;
`;
const DetailItem2 = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 6px;
  background-color: #f9f9f9;
  border-radius: 3px;
`;
const DetailLabel = styled.p`
  font-weight: bold;
  color: #555;
  font-size: 12px;
  text-align: left;
`;

const DetailValue = styled.p`
  color: #333;
  font-size: 12px;
  text-align: right;
`;

const CloseButton = styled.button`
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;

  &:hover {
    background-color: #c82333;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
`;

const PageButton = styled.button`
  padding: 6px 10px;
  background-color: ${(props) => (props.active ? '#007bff' : '#fff')};
  color: ${(props) => (props.active ? '#fff' : '#007bff')};
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: ${(props) => (props.active ? '#0056b3' : '#e7f0fa')};
  }
`;

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function SystemError() {
  const { user } = useAuth();
  const toast = useToast();
  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const limit = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.token) {
        toast.showToast('Không tìm thấy token xác thực.', 'error');
        return;
      }
      setLoading(true);
      try {
        const data = await fetchSystemLogs(user.token, { limit: 1000 });
        setAllLogs(data.data_set || []);
      } catch (error) {
        console.error('Error fetching system logs:', error);
        toast.showToast('Không thể tải nhật ký hệ thống.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user, toast]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setLogs(allLogs.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allLogs.length / limit));
  }, [currentPage, allLogs]);

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  return (
    <Container>
      <Title>Nhật ký & Giám sát 📊</Title>

      <Table>
        <TableHead>
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Phương thức</TableHeader>
            <TableHeader>Thông báo</TableHeader>
            <TableHeader>Ngày tạo</TableHeader>
            <TableHeader>Hành động</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {loading ? (
            <tr>
              <TableCell colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>
                Đang tải...
              </TableCell>
            </tr>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.method}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{formatDateTime(log.created_date)}</TableCell>
                <TableCell>
                  <ViewButton onClick={() => handleViewDetail(log)}>Xem</ViewButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <TableCell colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>
                Không có nhật ký nào.
              </TableCell>
            </tr>
          )}
        </TableBody>
      </Table>

      <Pagination>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </PageButton>
        ))}
      </Pagination>

      {isDetailModalOpen && selectedLog && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Chi tiết nhật ký</ModalTitle>
            <DetailSection>
              <DetailItem>
                <DetailLabel style={{ width: '30%' }}>ID:</DetailLabel>
                <DetailValue>{selectedLog.id}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel style={{ width: '30%' }}>Phương thức:</DetailLabel>
                <DetailValue>{selectedLog.method}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel style={{ width: '30%' }}>Thông điệp:</DetailLabel>
                <DetailValue>{selectedLog.message}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel style={{ width: '30%' }}>Stack Trace:</DetailLabel>
                <DetailValue>
                  {selectedLog.stack_trace}
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel style={{ width: '30%' }}>Ngày tạo:</DetailLabel>
                <DetailValue>{formatDateTime(selectedLog.created_date)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel style={{ width: '30%' }}>Ngày cập nhật:</DetailLabel>
                <DetailValue>{formatDateTime(selectedLog.updated_date)}</DetailValue>
              </DetailItem>
            </DetailSection>
            <DetailItem2><CloseButton onClick={() => setIsDetailModalOpen(false)}>Đóng</CloseButton></DetailItem2>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}