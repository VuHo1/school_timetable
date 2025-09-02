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
                        maxHeight: '80vh',
                        fontSize: '14px',
                        overflowY: 'auto',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
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
