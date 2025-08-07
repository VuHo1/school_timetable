import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { fetchReport, fetchReportSemester } from '../../api';
import {
  Users,
  BookOpen,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
    border-color: #8e44ad;
  }
`;

const OverviewCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #10B981;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background: ${props => props.color || '#10B981'};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatTitle = styled.h3`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
`;

const ReportCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
`;

const ReportCardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const ReportCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ReportCardContent = styled.div`
  padding: 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f9fafb;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin-right: 4px;
  margin-bottom: 4px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const GridCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 22px;
`;

const NavButton = styled.button`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PeriodText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  min-width: 200px;
  text-align: center;
`;

function ReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [option, setOption] = useState('Weekly');
  const [expandedCards, setExpandedCards] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [reportDescription, setReportDescription] = useState([]);
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const token = user?.token;
  useEffect(() => {
    if (option === 'Semester') {
      fetchSemesterData();
    } else {
      fetchReportData();
    }
  }, [current, option, currentSemesterIndex]);

  useEffect(() => {
    if (option === 'Semester') {
      fetchSemesterList();
    }
  }, [option]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchReport(token, current, option);
      if (response.success) {
        setReports(response.data || []);
        setReportDescription(response.description);
      } else {
        toast.error(response.description);
        setReportDescription('Không có dữ liệu');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesterList = async () => {
    try {
      const response = await fetchReportSemester(token);
      if (response.success) {
        setSemesters(response.data_set || []);
        setCurrentSemesterIndex(0);
      } else {
        toast.error(response.description);
        setReportDescription('Không có dữ liệu');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải danh sách học kỳ');
    }
  };

  const fetchSemesterData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (semesters.length > 0) {
        const currentSemester = semesters[currentSemesterIndex];
        const response = await fetchReport(token, currentSemester.id, option);
        if (response.success) {
          setReports(response.data || []);
          setReportDescription(response.description);
        } else {
          toast.error(response.description);
          setReportDescription('Không có dữ liệu');
        }
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải dữ liệu báo cáo học kỳ');
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handlePrevPeriod = () => {
    if (option === 'Semester') {
      if (currentSemesterIndex > 0) {
        setCurrentSemesterIndex(currentSemesterIndex - 1);
      }
    } else {
      setCurrent(current - 1);
    }
  };

  const handleNextPeriod = () => {
    if (option === 'Semester') {
      if (currentSemesterIndex < semesters.length - 1) {
        setCurrentSemesterIndex(currentSemesterIndex + 1);
      }
    } else {
      setCurrent(current + 1);
    }
  };

  const getPeriodDescription = () => {
    if (option === 'Semester') {
      if (semesters.length > 0 && semesters[currentSemesterIndex]) {
        if (reportDescription === 'Không có dữ liệu')
          return reportDescription;
        return `${semesters[currentSemesterIndex].semester_name} - ${reportDescription}`;
      }
      return 'Không có học kỳ';
    }
    return reportDescription;
  };

  const isPrevDisabled = () => {
    if (option === 'Semester') {
      return currentSemesterIndex === 0;
    }
    return false; // Allow negative numbers for Weekly/Monthly
  };

  const isNextDisabled = () => {
    if (option === 'Semester') {
      return currentSemesterIndex === semesters.length - 1;
    }
    return false; // Allow unlimited forward navigation for Weekly/Monthly
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vắng mặt':
        return 'bg-red-100 text-red-800';
      case 'Đang học':
        return 'bg-green-100 text-green-800';
      case 'Chưa diễn ra':
        return 'bg-yellow-100 text-yellow-800';
      case 'Chờ xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã duyệt':
        return 'bg-green-100 text-green-800';
      case 'Từ chối':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Vắng mặt':
      case 'Từ chối':
        return <XCircle className="w-4 h-4" />;
      case 'Đang học':
      case 'Đã duyệt':
        return <CheckCircle className="w-4 h-4" />;
      case 'Chưa diễn ra':
      case 'Chờ xử lý':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Đang tải dữ liệu báo cáo...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <strong>Lỗi:</strong> {error}
        </ErrorMessage>
      </Container>
    );
  }

  // Extract overview data from the first report (school overview)
  const schoolOverview = reports.find(report =>
    report.report_name === "Báo cáo tổng quan thời khóa biểu toàn trường"
  )?.report_data || {};

  // Reorder reports to show school overview first
  const reorderedReports = [...reports].sort((a, b) => {
    if (a.report_name === "Báo cáo tổng quan thời khóa biểu toàn trường") return -1;
    if (b.report_name === "Báo cáo tổng quan thời khóa biểu toàn trường") return 1;
    return 0;
  });

  return (
    <Container>
      <Header>
        <Title>📊 Báo cáo thống kê</Title>
      </Header>

      <FilterSection>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
            Thời gian báo cáo:
          </label>
          <Select value={option} onChange={(e) => setOption(e.target.value)}>
            <option value="Weekly">Theo tuần</option>
            <option value="Monthly">Theo tháng</option>
            <option value="Semester">Theo học kỳ</option>
          </Select>
        </div>
        <div>
          <NavigationContainer >
            <NavButton onClick={handlePrevPeriod} disabled={loading || isPrevDisabled()}>
              <ChevronLeft size={22} />
            </NavButton>
            <div>
              <PeriodText>{getPeriodDescription()}</PeriodText>
            </div>
            <NavButton onClick={handleNextPeriod} disabled={loading || isNextDisabled()}>
              <ChevronRight size={22} />
            </NavButton>
          </NavigationContainer>
        </div>

      </FilterSection>

      {/* Overview Cards */}
      <OverviewCards>
        <StatCard>
          <StatCardHeader>
            <StatIcon color="#3B82F6">
              <Users size={24} />
            </StatIcon>
            <StatContent>
              <StatTitle>Tổng số giáo viên</StatTitle>
              <StatValue>{schoolOverview.total_teachers || 0}</StatValue>
            </StatContent>
          </StatCardHeader>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon color="#10B981">
              <BookOpen size={24} />
            </StatIcon>
            <StatContent>
              <StatTitle>Tổng số lớp học</StatTitle>
              <StatValue>{schoolOverview.total_classes || 0}</StatValue>
            </StatContent>
          </StatCardHeader>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon color="#8B5CF6">
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatTitle>Tổng số tiết học</StatTitle>
              <StatValue>{schoolOverview.total_lessons || 0}</StatValue>
            </StatContent>
          </StatCardHeader>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon color="#F59E0B">
              <FileText size={24} />
            </StatIcon>
            <StatContent>
              <StatTitle>Tổng số môn học</StatTitle>
              <StatValue>{schoolOverview.total_subjects || 0}</StatValue>
            </StatContent>
          </StatCardHeader>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon color="#EF4444">
              <AlertCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatTitle>Tiết vắng mặt</StatTitle>
              <StatValue>{schoolOverview.absent_lessons || 0}</StatValue>
            </StatContent>
          </StatCardHeader>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon color="#10B981">
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatTitle>Tiết đang học</StatTitle>
              <StatValue>{schoolOverview.on_going_lessons || 0}</StatValue>
            </StatContent>
          </StatCardHeader>
        </StatCard>
      </OverviewCards>

      {/* Detailed Reports */}
      {reorderedReports.map((report, index) => (
        <ReportCard key={index}>
          <ReportCardHeader onClick={() => toggleCard(index)}>
            <ReportCardTitle>{report.report_name}</ReportCardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {Array.isArray(report.report_data.details)
                  ? `${report.report_data.details.length} mục`
                  : 'Xem chi tiết'}
              </span>
              {expandedCards[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </ReportCardHeader>

          {expandedCards[index] && (
            <ReportCardContent>

              {report.report_name === "Báo cáo tổng quan thời khóa biểu toàn trường" && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    <GridCard>
                      <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>Tổng quan</h4>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Tổng tiết học:</span>
                          <strong>{report.report_data.total_lessons}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Tổng giờ học:</span>
                          <strong>{report.report_data.total_hours}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>TB tiết/ngày:</span>
                          <strong>{report.report_data.average_lessons_per_day}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Ngày nghỉ lễ:</span>
                          <strong>{report.report_data.holidays}</strong>
                        </div>
                      </div>
                    </GridCard>
                    <GridCard>
                      <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>Trạng thái tiết học</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Chưa bắt đầu:</span>
                            <strong>{report.report_data.not_yet_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Sắp diễn ra:</span>
                            <strong>{report.report_data.in_comming_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Đang học:</span>
                            <strong>{report.report_data.on_going_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Có mặt đúng giờ:</span>
                            <strong>{report.report_data.attendace_lessons}</strong>
                          </div>
                        </div>
                        <div style={{
                          width: '1px',
                          backgroundColor: '#e5e7eb',
                          height: '100%',
                          minHeight: '120px',
                          margin: '0 8px'
                        }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Vắng mặt:</span>
                            <strong>{report.report_data.absent_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Đi muộn:</span>
                            <strong>{report.report_data.late_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Được phép nghỉ:</span>
                            <strong>{report.report_data.leaving_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tiết bị hủy:</span>
                            <strong>{report.report_data.cancel_lessons}</strong>
                          </div>
                        </div>
                      </div>
                    </GridCard>
                  </div>
                </div>
              )}

              {report.report_name === "Báo cáo khối lượng công việc của giáo viên" && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Tổng số giáo viên:</strong> {report.report_data.total_teachers}
                  </div>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Tên GV</TableHeader>
                        <TableHeader>Tổng giờ</TableHeader>
                        <TableHeader>Tổng lớp</TableHeader>
                        <TableHeader>Tổng tiết</TableHeader>
                        <TableHeader>Môn học</TableHeader>
                        <TableHeader>TB tiết/ngày</TableHeader>
                        <TableHeader>Trạng thái</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {report.report_data.details.map((teacher, idx) => (
                        <TableRow key={idx}>
                          <TableCell style={{ fontWeight: '600' }}>{teacher.teacher_user_name}</TableCell>
                          <TableCell>{teacher.total_hours}</TableCell>
                          <TableCell>{teacher.total_classes}</TableCell>
                          <TableCell>{teacher.total_lessons}</TableCell>
                          <TableCell>{teacher.total_subjects}</TableCell>
                          <TableCell>{teacher.average_lessons_per_day}</TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {teacher.status_details.map((status, statusIdx) => (
                                <StatusBadge key={statusIdx} className={getStatusColor(status.status)}>
                                  {status.status}: {status.count} ({status.rate}%)
                                </StatusBadge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {report.report_name === "Báo cáo khối lượng học tập của lớp" && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Tổng số lớp:</strong> {report.report_data.total_classes}
                  </div>
                  <GridContainer>
                    {report.report_data.details.map((classItem, idx) => (
                      <GridCard key={idx}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#3B82F6' }}>{classItem.class_code}</h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tổng giờ:</span>
                            <strong>{classItem.total_hours}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tổng tiết:</span>
                            <strong>{classItem.total_lessons}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Môn học:</span>
                            <strong>{classItem.total_subjects}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>TB tiết/ngày:</span>
                            <strong>{classItem.average_lessons_per_day}</strong>
                          </div>
                        </div>
                      </GridCard>
                    ))}
                  </GridContainer>
                </div>
              )}

              {report.report_name === "Báo cáo phân bổ môn học" && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Tổng số môn học:</strong> {report.report_data.total_subjects}
                  </div>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Mã môn</TableHeader>
                        <TableHeader>Tên môn</TableHeader>
                        <TableHeader>Tổng tiết</TableHeader>
                        <TableHeader>Tổng lớp</TableHeader>
                        <TableHeader>Tổng GV</TableHeader>
                        <TableHeader>TB tiết/ngày</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {[...report.report_data.details]
                        .sort((a, b) => {
                          const codeA = a.subject_code.slice(2);
                          const codeB = b.subject_code.slice(2);

                          const numCompare = codeA.localeCompare(codeB, undefined, { numeric: true });
                          if (numCompare !== 0) return numCompare;

                          return a.subject_code.localeCompare(b.subject_code);
                        })
                        .map((subject, idx) => (
                          <TableRow key={idx}>
                            <TableCell style={{ fontWeight: '600' }}>{subject.subject_code}</TableCell>
                            <TableCell>{subject.subject_name}</TableCell>
                            <TableCell>{subject.total_lessons}</TableCell>
                            <TableCell>{subject.total_classes}</TableCell>
                            <TableCell>{subject.total_teachers}</TableCell>
                            <TableCell>{subject.average_lessons_per_day}</TableCell>
                          </TableRow>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {report.report_name === "Báo cáo tổng quan đơn yêu cầu của giáo viên" && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Tổng số giáo viên:</strong> {report.report_data.total_teachers} |
                    <strong> Tổng số yêu cầu:</strong> {report.report_data.total_requests}
                  </div>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {report.report_data.details.map((teacher, idx) => (
                      <GridCard key={idx} style={{ background: '#EFF6FF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, color: '#1f2937' }}>Giáo viên: {teacher.creator}</h4>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            Tổng yêu cầu: {teacher.total_requests}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {teacher.request_details.map((request, reqIdx) => (
                            <div key={reqIdx} style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '500' }}>{request.type}</span>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                  Tổng: {request.total}
                                </span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                                {request.status_details.map((status, statusIdx) => (
                                  <div key={statusIdx} className={`p-3 rounded text-center ${getStatusColor(status.status)}`}>
                                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{status.status}: {status.count}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GridCard>
                    ))}
                  </div>
                </div>
              )}

              {report.report_name === "Báo cáo hiệu suất xử lý đơn yêu cầu" && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Tổng số người duyệt:</strong> {report.report_data.total_approver} |
                    <strong> Tổng số yêu cầu:</strong> {report.report_data.total_requests}
                  </div>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {report.report_data.details.map((approver, idx) => (
                      <GridCard key={idx} style={{ background: '#EFF6FF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, color: '#1f2937' }}>Người duyệt: {approver.approver}</h4>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            Tổng yêu cầu: {approver.total_requests}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {approver.request_details.map((request, reqIdx) => (
                            <div key={reqIdx} style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '500' }}>{request.type}</span>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                  Tổng: {request.total}
                                </span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                                {request.status_details.map((status, statusIdx) => (
                                  <div key={statusIdx} className={`p-3 rounded text-center ${getStatusColor(status.status)}`}>
                                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{status.status}: {status.count} ({status.rate}%)</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GridCard>
                    ))}
                  </div>
                </div>
              )}
            </ReportCardContent>
          )}
        </ReportCard>
      ))}
    </Container>
  );
}

export default ReportPage;
