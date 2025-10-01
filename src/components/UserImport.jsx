import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useToast } from './ToastProvider';
import { importUsers, downloadUserImportTemplate } from '../api';

const ActionButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'variant',
})`
  background: ${(props) => (props.variant === 'primary' ? '#3b82f6' : '#e74c3c')};
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
  margin-bottom: 20px;
`;
const Container1 = styled.div`
  flex:1;
  background-color: white;
  padding: 20px;
  margin-left: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
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
  background: #10b981;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #2c3e50;
  margin-left: 8px;
`;

const ErrorList = styled.ul`
  margin-top: 10px;
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 8px;
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
`;

const ErrorItem = styled.li`
  color: #b91c1c;
  font-size: 14px;
  margin-bottom: 5px;
`;

const ErrorTitle = styled.h3`
  color: #b91c1c;
  font-size: 16px;
  font-weight: 500;
  margin: 10px 0 5px 0;
`;

const UserImport = ({ token, onImportSuccess }) => {
    const toast = useToast();
    const [selectedFile, setSelectedFile] = useState(null);
    const [dryRun, setDryRun] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [errorDescription, setErrorDescription] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (
            file &&
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            setSelectedFile(file);
            setErrors([]);
            setErrorDescription('');
        } else {
            toast.showToast('Vui lòng chọn file Excel (.xlsx)', 'error');
            setSelectedFile(null);
            setErrors([]);
            setErrorDescription('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImport = async () => {
        if (!token || !selectedFile) {
            toast.showToast('Vui lòng chọn file để import', 'error');
            setErrors([]);
            setErrorDescription('');
            return;
        }

        setLoading(true);
        setErrors([]);
        setErrorDescription('');
        try {
            const result = await importUsers(token, selectedFile, dryRun);
            console.log('API Response:', result);
            if (result.success) {
                toast.showToast(result.description || 'Thành công!', 'success');
                setErrors([]);
                setErrorDescription('');
                if (!dryRun) {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    onImportSuccess();
                }
            } else {
                const hasErrors = result.data && Array.isArray(result.data.errors) && result.data.errors.length > 0;
                const errorMessages = hasErrors
                    ? result.data.errors.map(
                        (err) => `Dòng ${err.row_index}: ${err.error_message}`
                    )
                    : [];
                setErrors(errorMessages);
                setErrorDescription(
                    result.description || 'Có lỗi trong quá trình import'
                );
                toast.showToast(
                    result.description || 'Có lỗi trong quá trình import',
                    'error'
                );
            }
        } catch (error) {
            console.error('Import Error:', error);
            setErrorDescription(error.message || 'Import tài khoản thất bại');
            toast.showToast(error.message || 'Import tài khoản thất bại', 'error');
            const hasErrors = error.data && error.data.data && Array.isArray(error.data.data.errors) && error.data.data.errors.length > 0;
            if (hasErrors) {
                const errorMessages = error.data.data.errors.map(
                    (err) => `Dòng ${err.row_index}: ${err.error_message}`
                );
                setErrors(errorMessages);
            }
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
            <Container1>
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
                        {selectedFile ? selectedFile.name : 'Tải file lên'}
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
                        {loading ? 'Đang xử lý...' : dryRun ? 'Kiểm tra' : 'Tạo'}
                    </ActionButton>
                </div>
                <CheckboxContainer>
                    <input
                        type="checkbox"
                        id="dryRun"
                        checked={dryRun}
                        onChange={(e) => setDryRun(e.target.checked)}
                    />
                    <CheckboxLabel htmlFor="dryRun">Kiểm tra file</CheckboxLabel>
                </CheckboxContainer>
            </Container1>
            <Container1>
                <ImportTitle>Thông báo</ImportTitle>
                {errorDescription && (
                    <ErrorTitle>{errorDescription}</ErrorTitle>
                )}
                {errors.length > 0 && (
                    <ErrorList>
                        {errors.map((msg, index) => (
                            <ErrorItem key={index}>{msg}</ErrorItem>
                        ))}
                    </ErrorList>
                )}
            </Container1>
        </ImportContainer>
    );
};

export default UserImport;