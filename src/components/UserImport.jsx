import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useToast } from './ToastProvider';
import { importUsers, downloadUserImportTemplate } from '../api';
const ActionButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${(props) => props.variant === 'primary' ? '#3b82f6' : '#e74c3c'};
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
const ImportContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ImportTitle = styled.h2`
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 15px 0;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  background: #10B981;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: #059669;
    transform: translateY(-2px);
  }
`;

const DownloadButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;


const UserImport = ({ token, onImportSuccess }) => {
    const toast = useToast();
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setSelectedFile(file);
        } else {
            toast.showToast('Vui lòng chọn file Excel (.xlsx)', 'error');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImport = async () => {
        if (!token || !selectedFile) {
            toast.showToast('Vui lòng chọn file để import', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await importUsers(token, selectedFile, false);
            toast.showToast(result.description, result.success ? 'success' : 'error');
            if (result.success) {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                onImportSuccess();
            }
        } catch (error) {
            toast.showToast(error.message || 'Import tài khoản thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setLoading(true);
        try {
            const blob = await downloadUserImportTemplate(token);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Mau_Import_Giao_Vien.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.showToast('Tải template thành công', 'success');
        } catch (error) {
            toast.showToast(error.message || 'Tải template thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImportContainer>
            <ImportTitle>Thêm danh sách tài khoản</ImportTitle>
            <div>

                <FileInput
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    id="file-upload"
                />
                <FileInputLabel htmlFor="file-upload">
                    {selectedFile ? selectedFile.name : 'Tải file lên '}
                </FileInputLabel>
                <DownloadButton onClick={handleDownloadTemplate} disabled={loading}>
                    {loading ? 'Đang tải...' : 'Lấy file mẫu'}
                </DownloadButton>
                <ActionButton
                    variant="primary"
                    onClick={handleImport}
                    disabled={loading || !selectedFile}
                    style={{ marginLeft: '10px' }}
                >
                    {loading ? 'Đang tạo...' : 'Tạo'}
                </ActionButton>
            </div>

        </ImportContainer>
    );
};

export default UserImport;