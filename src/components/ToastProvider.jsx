import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

export function ToastProvider({ children }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        maxWidth: '90%',
                        maxHeight: '80vh',    // 👈 Giới hạn toast bằng 80% chiều cao màn hình
                        fontSize: '14px',
                        overflowY: 'auto',    // 👈 Cuộn dọc khi dài
                        overflowX: 'auto',    // 👈 Cuộn ngang khi dài
                        whiteSpace: 'pre-wrap', // 👈 Giữ format và xuống dòng khi cần
                        wordBreak: 'break-word'
                    },
                }}
            />
        </>
    );
}

export const useToast = () => {
    return {
        showToast: (message, type = 'success') => {
            type === 'success' ? toast.success(message) : toast.error(message);
        },
    };
};
