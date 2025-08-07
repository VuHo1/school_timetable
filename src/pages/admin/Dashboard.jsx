import React, { useState, useEffect } from 'react';
import { useAuth, user } from '../../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components with soft mint theme
const Container = styled.div`
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f2f8f5 0%, #e8f2ed 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const AnimatedBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(143, 196, 164, 0.13) 0%, transparent 70%),
    radial-gradient(circle at 80% 70%, rgba(143, 196, 164, 0.10) 0%, transparent 70%),
    radial-gradient(circle at 60% 20%, rgba(143, 196, 164, 0.10) 0%, transparent 70%);
  z-index: 0;
`;

const WelcomeCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.97);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(143, 196, 164, 0.10);
  padding: 2rem 3.2rem;
  max-width: 900px;
  width: 100%;
  transform: scale(0.1);
  transform-origin: top center;
  text-align: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: 1.5px solid #e8f2ed;
  background-clip: padding-box;
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #e8f2ed, #f2f8f5, #8fc4a4);
    z-index: -1;
    border-radius: 1.5rem;
    animation: gradientBorder 8s linear infinite;
    opacity: 0.5;
  }
  @keyframes gradientBorder {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 400% 50%;
    }
  }
`;

const Title = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 800;
  color: #5a6b60;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #8fc4a4, #5a6b60);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  width: 100%;
`;

const StatCard = styled(motion.div)`
  background: rgba(143, 196, 164, 0.08);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(143, 196, 164, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(143, 196, 164, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(143, 196, 164, 0.2);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #8fc4a4;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #5a6b60;
  opacity: 0.8;
`;

const QuickActions = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  width: 100%;
`;

const ActionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.6);
  border: 1.5px solid rgba(143, 196, 164, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(143, 196, 164, 0.1);
    border-color: rgba(143, 196, 164, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(143, 196, 164, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(143, 196, 164, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #8fc4a4;
`;

const ActionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #5a6b60;
  margin-bottom: 0.3rem;
`;

const RoleBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #8fc4a4;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(143, 196, 164, 0.18);
`;

const TimeGreeting = styled(motion.div)`
  font-size: 1.1rem;
  color: #5a6b60;
  margin-bottom: 1rem;
  opacity: 0.9;
`;

const FeatureHighlight = styled(motion.div)`
  background: linear-gradient(135deg, #8fc4a4 0%, #7ab093 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  margin: 1rem 0;
  text-align: center;
`;

const Sparkle = styled(motion.div)`
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #8fc4a4 60%, #e8f2ed 100%);
  border-radius: 50%;
  z-index: 2;
  opacity: 1;
  filter: blur(2.5px);
  pointer-events: none;
`;

function Dashboard() {
  const { role, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Reset khi component unmount
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 17) return "Chào buổi chiều";
    return "Chào buổi tối";
  };


  const stats = [
    { number: "24/7", label: "Truy cập mọi lúc" },
    { number: "100%", label: "Đồng bộ dữ liệu" },
  ];

  const quickActions = [
    { icon: "📅", title: "Xem thời khóa biểu", description: "" },
    { icon: "➕", title: "Thêm lịch mới", description: "" },
    { icon: "👤", title: "Quản lý tài khoản", description: "" },
    { icon: "📊", title: "Xử lý yêu cầu", description: "" },
    { icon: "🔑", title: "Cấu hình phân quyền", description: "" },
    { icon: "⚙️", title: "Cấu hình hệ thống", description: "" }
  ];

  // Animation variants for sparkles
  const sparkleVariants = {
    animate: (i) => ({
      x: [0, Math.random() * 20 - 10, 0],
      y: [0, Math.random() * 20 - 10, 0],
      scale: [1, 1.15, 1],
      opacity: [0.15, 0.25, 0.15],
      transition: {
        duration: 12 + Math.random() * 3,
        repeat: Infinity,
        delay: i * 1.5,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <Container>
      <AnimatedBackground
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <WelcomeCard
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Sparkle effects */}
        {[...Array(8)].map((_, i) => (
          <Sparkle
            key={i}
            custom={i}
            variants={sparkleVariants}
            animate="animate"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
        <TimeGreeting
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {getTimeGreeting()}, {user?.full_name || 'Bạn'}!
        </TimeGreeting>
        <TimeGreeting
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {currentTime.toLocaleTimeString('vi-VN', {

            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })} { }
          {currentTime.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </TimeGreeting>

        <Title
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Hệ thống Quản lý Thời khóa biểu
        </Title>

        <StatsGrid
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        <FeatureHighlight
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
            🎯 Tính năng nổi bật
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Quản lí thời khóa biểu, đồng bộ đa thiết bị,
            và thông báo tự động cho mọi lịch trình quan trọng
          </p>
        </FeatureHighlight>

        <QuickActions
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {quickActions.map((action, index) => (
            <ActionCard
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
            </ActionCard>
          ))}
        </QuickActions>

        <RoleBadge
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Vai trò: {role}
        </RoleBadge>
      </WelcomeCard>
    </Container>
  );
}

export default Dashboard;