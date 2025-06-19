import React, { createContext, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

const ToastContext = createContext();

const Toast = styled.div`
  position: fixed;
  max-width: 25%;
  top: 80px;
  right: 5px;
  padding: 12px 24px;
  border-radius: 5px;
  text-align: left;
  font-size: 18px;
  z-index: 1000;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: translateY(${props => props.visible ? '0' : '-20px'});
  transition: opacity 0.3s, transform 0.3s;
  background: ${(props) => (props.type === 'success' ? '#C8E6C9' : '#FFCDD2')};
  color: ${(props) => (props.type === 'success' ? '#388E3C' : '#D32F2F')};
`;

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
    };

    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => {
                setToast({ ...toast, visible: false });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast.visible && <Toast type={toast.type} visible={toast.visible}>{toast.message}</Toast>}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);