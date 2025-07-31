import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createClass, fetchGradeLevels } from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #5a6268;
  }
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
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
  margin-bottom: 20px;
`;

const Success = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
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

function CreateClass() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [formData, setFormData] = useState({
    class_code: '',
    quantity: 1,
    grade_level: []
  });

  useEffect(() => {
    loadGradeLevels();
  }, []);

  const loadGradeLevels = async () => {
    setLoadingGrades(true);
    try {
      const token = localStorage.getItem('authToken');
      const result = await fetchGradeLevels(token);
      setGradeLevels(result || []);
    } catch (err) {
      console.error('Error loading grade levels:', err);
      setError('Không thể tải danh sách khối học: ' + err.message);
    } finally {
      setLoadingGrades(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
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
      const result = await createClass(token, formData);

      setSuccess('Tạo lớp học thành công!');
      console.log('Created classes:', result);

      // Reset form
      setFormData({
        class_code: '',
        quantity: 1,
        grade_level: []
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/staff/class');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/staff/class');
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          ← Quay lại
        </BackButton>
        <Title>Tạo lớp học mới</Title>
      </Header>

      <FormContainer>
        {error && <Error>{error}</Error>}
        {success && <Success>{success}</Success>}

        <Form onSubmit={handleSubmit}>
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
            <HelpText>
              Nhập mã lớp như A, B, C, CLC. Hệ thống sẽ tự động tạo mã lớp đầy đủ.
            </HelpText>
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
            <HelpText>
              Số lượng lớp cần tạo cho mỗi khối học (từ 1 đến 50)
            </HelpText>
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
            <CancelButton type="button" onClick={handleBack}>
              Hủy
            </CancelButton>
            <SubmitButton type="submit" disabled={loading || loadingGrades}>
              {loading ? 'Đang tạo...' : 'Lưu thông tin'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
}

export default CreateClass; 