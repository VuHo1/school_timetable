import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 16px;
  font-weight: 600;
`;

const Message = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 30px;
  max-width: 500px;
  line-height: 1.6;
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

function PlaceholderPage({ title, icon = "🚧" }) {
  return (
    <Container>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      <Message>
        Trang này đang trong quá trình phát triển và sẽ được cập nhật trong phiên bản tiếp theo.
      </Message>
      <Badge>Đang phát triển</Badge>
    </Container>
  );
}

export default PlaceholderPage; 