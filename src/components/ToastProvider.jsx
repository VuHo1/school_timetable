import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

export function ToastProvider({ children }) {
    return (
        <>
            {children}
            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
}

// Optional: Custom hook nếu bạn muốn giữ lại API cũ
export const useToast = () => {
    return {
        showToast: (message, type = 'success') => {
            type === 'success' ? toast.success(message) : toast.error(message);
        },
    };
};
