import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
const Container = styled.div`
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #e0f7fa 0%, #90caf9 50%, #e3f2fd 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 0px;
  position: relative;
  overflow: hidden;
`;

const AnimatedBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f2f2f2;
  z-index: 0;
`;

const WelcomeCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 3rem 4rem;
  max-width: 700px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: 2px solid transparent;
  background-clip: padding-box;
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #aed6eb, #6795d0, #c9e0f4);
    z-index: -1;
    border-radius: 1.5rem;
    animation: gradientBorder 3s linear infinite;
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
  color: #030556;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #aed6eb, #6795d0, #c9e0f4);
  -webkit-background-clip: text;
  background-clip: text;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: #181b1c;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const RoleBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #aed6eb, #6795d0, #c9e0f4);
  color:  #000000;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(66, 165, 245, 0.4);
`;

const Sparkle = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  background: #4dd0e1;
  border-radius: 50%;
  z-index: 2;
`;

function Dashboard() {
  const { role, user } = useAuth();

  const sparkleVariants = {
    animate: (i) => ({
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
      scale: [1, 1.5, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2 + Math.random(),
        repeat: Infinity,
        delay: i * 0.2,
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
        {[...Array(5)].map((_, i) => (
          <Sparkle
            key={i}
            custom={i}
            variants={sparkleVariants}
            animate="animate"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
        <Title
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Chào mừng đến với Website của chúng tôi
        </Title>
        <Subtitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {user ? `Xin chào, ${user.full_name} ! ` : 'Chào mừng bạn!'}
          Website thời khóa biểu với rất nhiều chức năng đang chờ bạn khám phá
        </Subtitle>
        <RoleBadge
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(66, 165, 245, 0.5)' }}
        >
          Vai trò: {role}
        </RoleBadge>
      </WelcomeCard>
    </Container>
  );
}

export default Dashboard;
