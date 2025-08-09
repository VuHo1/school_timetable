import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestById, addRequestComment } from '../../api';
import { toast } from 'react-hot-toast';
import { FaCommentAlt, FaSpinner, FaArrowLeft } from 'react-icons/fa';

// Styled Components (unchanged except for new styles for content_detail list)
const Container = styled.div`
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 70px);
  overflow-x: hidden;
`;

const Header = styled.div`
  display: flex;
  gap: 50px;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  justify-content: center;
`;

const Title1 = styled.h1`
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
  padding-bottom: 20px;
  margin: 0;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  }
`;

const DetailsContainer = styled.div`
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const RequestInfo = styled.div`
  flex: 1;
  border-right: 2px solid rgba(0, 0, 0, 0.11);
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 15px;
  
  .label {
    font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
  }
  .label1{
    font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
    color: red;
  }
  
  .value {
    color: #666;
    flex: 1;
  }
`;

const ContentDetailList = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  max-width: 90%;
  border: 1px solid #eee;
  border-radius: 8px;
  .label1{
     font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
    color: red;
  }
`;

const ContentDetailItem = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'Chờ xử lý' ? '#fefcbf' : props.status === 'Đã từ chối' ? '#f8d7da' : props.status === 'Đã chấp nhận' ? '#d4edda' : '#ffffff'};
  color: ${props => props.status === 'Chờ xử lý' ? '#744210' : props.status === 'Đã từ chối' ? '#721c24' : props.status === 'Đã chấp nhận' ? '#155724' : '#040404'};
`;

const CommentSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 50%;
`;

const CommentList = styled.div`
  max-height: 400px;
  overflow-y: auto;
    overflow-x: hidden;
  margin-bottom: 15px;
  padding: 16px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  background: #fafafa;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Comment = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: flex-end;
  ${props => props.isOwn && 'flex-direction: row-reverse;'}
`;

const CommentBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  
  ${props => props.isOwn ? `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-bottom-right-radius: 4px;
    margin-left: auto;
  ` : `
    background: #f1f5f9;
    color: #334155;
    border-bottom-left-radius: 4px;
    margin-right: auto;
  `}
  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CommentMeta = styled.div`
  font-size: 11px;
  margin: 2px 8px 0;
  opacity: 0.7;
  ${props => props.isOwn ? 'text-align: right;' : 'text-align: left;'}
`;

const CommentSender = styled.div`
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.8;
`;

const CommentContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
`;

const CommentInput = styled.textarea`
  width: 96%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 10px;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: #3b82f6;
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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #e74c3c;
  font-size: 16px;
`;

// Request Detail Component
const RequestDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const dayOfWeekMap = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    0: 'Chủ nhật'
  };
  // Fetch request details
  useEffect(() => {
    const loadRequest = async () => {
      if (!user?.token || !id) return;
      try {
        setLoading(true);
        const details = await fetchRequestById(user.token, id);
        setRequest(details);
      } catch (error) {
        toast.error(error.message || 'Không thể tải chi tiết yêu cầu');
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [user?.token, id]);

  // Handle add comment
  const handleAddComment = async () => {
    if (!comment.trim() || !request?.id) return;
    try {
      setActionLoading(true);
      const response = await addRequestComment(user.token, request.id, comment);
      if (response.success) {
        toast.success(response.description);
        const details = await fetchRequestById(user.token, request.id);
        setRequest(details);
        setComment('');
      } else {
        toast.error(response.description);
      }

    } catch (error) {
      toast.error(error.message || 'Không thể thêm bình luận');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/request')}>
        <FaArrowLeft /> Quay lại
      </BackButton>
      <Header>
        <Title>📋 Chi tiết yêu cầu</Title>
      </Header>
      <DetailsContainer>
        {loading ? (
          <LoadingSpinner>
            <FaSpinner className="animate-spin" size={24} /> Đang tải dữ liệu...
          </LoadingSpinner>
        ) : !request ? (
          <ErrorMessage>
            Không tìm thấy yêu cầu
          </ErrorMessage>
        ) : (
          <>
            <RequestInfo>
              <DetailItem>
                <span className="label">Loại đơn:</span>
                <span className="value">{request.type_name || '-'}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">Mô tả:</span>
                <span className="value">{request.description || 'Không có mô tả'}</span>
              </DetailItem>
              {request.content_detail && request.content_detail.length > 0 ? (
                <ContentDetailList>
                  <span className="label1">Nội dung</span>
                  {request.content_detail.map((detail, index) => (
                    <ContentDetailItem key={detail.id || index}>
                      <DetailItem>
                        <span className="label">Ngày dạy:</span>
                        <span className="value">{dayOfWeekMap[detail.day_of_week] || detail.day_of_week_str}, {new Date(detail.date).toLocaleDateString('vi-VN')}</span>
                      </DetailItem>
                      <DetailItem>
                        <span className="label">Tiết:</span>
                        <span className="value">{detail.time_slot_id}</span>
                      </DetailItem>
                      <DetailItem>
                        <span className="label">Lớp:</span>
                        <span className="value">{detail.class_code}</span>
                      </DetailItem>
                      <DetailItem>
                        <span className="label">Môn:</span>
                        <span className="value">{detail.subject_code}</span>
                      </DetailItem>
                      <DetailItem>
                        <span className="label">Phòng:</span>
                        <span className="value">{detail.room_code}</span>
                      </DetailItem>
                    </ContentDetailItem>
                  ))}
                </ContentDetailList>
              ) : (
                <DetailItem>
                  <span className="label1">Nội dung:</span>
                  <span className="value">Không có chi tiết nội dung</span>
                </DetailItem>
              )}
              <DetailItem>
                <span className="label">Người tạo:</span>
                <span className="value">{request.creator || '-'}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">Người duyệt:</span>
                <span className="value">{request.primary_approver || '-'}</span>
              </DetailItem>
              {request.sub_approver && (
                <DetailItem>
                  <span className="label">Người thay thế:</span>
                  <span className="value">{request.sub_approver}</span>
                </DetailItem>
              )}
              <DetailItem>
                <span className="label">Trạng thái chính:</span>
                <span className="value">
                  <StatusBadge status={request.primary_status}>{request.primary_status}</StatusBadge>
                </span>
              </DetailItem>
              {request.sub_status && (
                <DetailItem>
                  <span className="label">Trạng thái phụ:</span>
                  <span className="value">{request.sub_status}</span>
                </DetailItem>
              )}
              {request.reject_reason && (
                <DetailItem>
                  <span className="label">Lý do từ chối:</span>
                  <span className="value">{request.reject_reason}</span>
                </DetailItem>
              )}
              <DetailItem>
                <span className="label">Ngày tạo:</span>
                <span className="value">{new Date(request.created_date).toLocaleString('vi-VN')}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">Ngày cập nhật:</span>
                <span className="value">{new Date(request.updated_date).toLocaleString('vi-VN')}</span>
              </DetailItem>
              {request.content && (
                <DetailItem>
                  <span className="label">Nội dung:</span>
                  <span className="value">{request.content}</span>
                </DetailItem>
              )}
            </RequestInfo>
            <CommentSection>
              <Title1 >Trao đổi</Title1>
              <CommentList>
                {request.request_comment?.length > 0 ? (
                  request.request_comment.map((comment, index) => {
                    const isOwn = comment.is_my_comment;
                    return (
                      <Comment key={comment.id || index} isOwn={isOwn}>
                        <div>
                          <CommentBubble isOwn={isOwn}>
                            <CommentSender>{isOwn ? '' : comment.sender}</CommentSender>
                            <CommentContent>{comment.content}</CommentContent>
                          </CommentBubble>
                          <CommentMeta isOwn={isOwn}>
                            {comment.created_date ? new Date(comment.created_date).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Vừa xong'}
                          </CommentMeta>
                        </div>
                      </Comment>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px' }}>
                    Không có nội dung
                  </div>
                )}
              </CommentList>
              <CommentInput
                value={comment}
                maxLength={250}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập nội dung..."
              />
              <div style={{
                fontSize: '12px',
                color: comment.length > 200 ? '#e74c3c' : '#666',
                textAlign: 'right',
                marginTop: '5px'
              }}>
                {comment.length}/250 ký tự
              </div>
              <SubmitButton
                onClick={handleAddComment}
                disabled={!comment.trim() || actionLoading}
              >
                <FaCommentAlt /> Gửi
              </SubmitButton>
            </CommentSection>
          </>
        )}
      </DetailsContainer>
    </Container>
  );
};

export default RequestDetail;