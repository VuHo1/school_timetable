import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useToast } from './ToastProvider';
import { importClasses, downloadClassImportTemplate, importClassSubjects, downloadClassSubjectsTemplate } from '../api';

const ImportContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ImportContainer1 = styled.div`
  background: white;
  flex: 1;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  margin-left: 20px;
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

const ClassAndSubjectImport = ({ token, onImportSuccess }) => {
    const toast = useToast();
    const [classFile, setClassFile] = useState(null);
    const [classSubjectFile, setClassSubjectFile] = useState(null);
    const [classDryRun, setClassDryRun] = useState(true);
    const [classSubjectDryRun, setClassSubjectDryRun] = useState(true);
    const [loading, setLoading] = useState(false);
    const [classErrors, setClassErrors] = useState([]);
    const [classErrorDescription, setClassErrorDescription] = useState('');
    const [classSubjectErrors, setClassSubjectErrors] = useState([]);
    const [classSubjectErrorDescription, setClassSubjectErrorDescription] = useState('');
    const classFileInputRef = useRef(null);
    const classSubjectFileInputRef = useRef(null);

    const handleClassFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setClassFile(file);
            setClassErrors([]);
            setClassErrorDescription('');
        } else {
            toast.showToast('Vui lòng chọn file Excel (.xlsx) cho lớp học', 'error');
            setClassFile(null);
            setClassErrors([]);
            setClassErrorDescription('');
            if (classFileInputRef.current) classFileInputRef.current.value = '';
        }
    };

    const handleClassSubjectFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setClassSubjectFile(file);
            setClassSubjectErrors([]);
            setClassSubjectErrorDescription('');
        } else {
            toast.showToast('Vui lòng chọn file Excel (.xlsx) cho môn học của lớp', 'error');
            setClassSubjectFile(null);
            setClassSubjectErrors([]);
            setClassSubjectErrorDescription('');
            if (classSubjectFileInputRef.current) classSubjectFileInputRef.current.value = '';
        }
    };

    const handleImportClasses = async () => {
        if (!token || !classFile) {
            toast.showToast('Vui lòng chọn file để import lớp học', 'error');
            setClassErrors([]);
            setClassErrorDescription('');
            return;
        }

        setLoading(true);
        setClassErrors([]);
        setClassErrorDescription('');
        try {
            const result = await importClasses(token, classFile, classDryRun);
            if (result.success) {
                toast.showToast(result.description || 'Thành công!', 'success');
                setClassErrors([]);
                setClassErrorDescription('');
                if (!classDryRun) {
                    setClassFile(null);
                    if (classFileInputRef.current) classFileInputRef.current.value = '';
                    onImportSuccess();
                }
            } else {
                const hasErrors = result.data && Array.isArray(result.data.errors) && result.data.errors.length > 0;
                const errorMessages = hasErrors
                    ? result.data.errors.map((err) => `Dòng ${err.row_index}: ${err.error_message}`)
                    : [];
                setClassErrors(errorMessages);
                setClassErrorDescription(result.description || 'Có lỗi trong quá trình import lớp học');
                toast.showToast(result.description || 'Có lỗi trong quá trình import lớp học', 'error');
            }
        } catch (error) {
            setClassErrorDescription(error.message || 'Import lớp học thất bại');
            toast.showToast(error.message || 'Import lớp học thất bại', 'error');
            const hasErrors = error.data && error.data.data && Array.isArray(error.data.data.errors) && error.data.data.errors.length > 0;
            if (hasErrors) {
                const errorMessages = error.data.data.errors.map((err) => `Dòng ${err.row_index}: ${err.error_message}`);
                setClassErrors(errorMessages);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImportClassSubjects = async () => {
        if (!token || !classSubjectFile) {
            toast.showToast('Vui lòng chọn file để import môn học của lớp', 'error');
            setClassSubjectErrors([]);
            setClassSubjectErrorDescription('');
            return;
        }

        setLoading(true);
        setClassSubjectErrors([]);
        setClassSubjectErrorDescription('');
        try {
            const result = await importClassSubjects(token, classSubjectFile, classSubjectDryRun);
            if (result.success) {
                toast.showToast(result.description || 'Thành công!', 'success');
                setClassSubjectErrors([]);
                setClassSubjectErrorDescription('');
                if (!classSubjectDryRun) {
                    setClassSubjectFile(null);
                    if (classSubjectFileInputRef.current) classSubjectFileInputRef.current.value = '';
                    onImportSuccess();
                }
            } else {
                const hasErrors = result.data && Array.isArray(result.data.errors) && result.data.errors.length > 0;
                const errorMessages = hasErrors
                    ? result.data.errors.map((err) => `Dòng ${err.row_index}: ${err.error_message}`)
                    : [];
                setClassSubjectErrors(errorMessages);
                setClassSubjectErrorDescription(result.description || 'Có lỗi trong quá trình import môn học');
                toast.showToast(result.description || 'Có lỗi trong quá trình import môn học', 'error');
            }
        } catch (error) {
            setClassSubjectErrorDescription(error.message || 'Import môn học của lớp thất bại');
            toast.showToast(error.message || 'Import môn học của lớp thất bại', 'error');
            const hasErrors = error.data && error.data.data && Array.isArray(error.data.data.errors) && error.data.data.errors.length > 0;
            if (hasErrors) {
                const errorMessages = error.data.data.errors.map((err) => `Dòng ${err.row_index}: ${err.error_message}`);
                setClassSubjectErrors(errorMessages);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClassTemplate = async () => {
        setLoading(true);
        try {
            const blob = await downloadClassImportTemplate(token);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Mau_Import_Lop_Hoc.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.showToast('Tải template lớp học thành công', 'success');
        } catch (error) {
            toast.showToast(error.message || 'Tải template lớp học thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClassSubjectTemplate = async () => {
        setLoading(true);
        try {
            const blob = await downloadClassSubjectsTemplate(token);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Mau_Import_Mon_Hoc_Lop.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.showToast('Tải template môn học của lớp thành công', 'success');
        } catch (error) {
            toast.showToast(error.message || 'Tải template môn học của lớp thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImportContainer>
            <ImportContainer1>
                <ImportTitle>Thêm danh sách GVCN và phòng học theo lớp</ImportTitle>
                <div>
                    <FileInput
                        type="file"
                        accept=".xlsx"
                        ref={classFileInputRef}
                        onChange={handleClassFileChange}
                        id="class-file-upload"
                    />
                    <FileInputLabel htmlFor="class-file-upload">
                        {classFile ? classFile.name : 'Tải file lên'}
                    </FileInputLabel>
                    <DownloadButton onClick={handleDownloadClassTemplate} disabled={loading}>
                        {loading ? 'Đang tải...' : 'Lấy file mẫu'}
                    </DownloadButton>
                    <ActionButton
                        variant="primary"
                        onClick={handleImportClasses}
                        disabled={loading || !classFile}
                        style={{ marginLeft: '10px' }}
                    >
                        {loading ? 'Đang xử lý...' : classDryRun ? 'Kiểm tra' : 'Tạo lớp học'}
                    </ActionButton>
                </div>
                <CheckboxContainer>
                    <input
                        type="checkbox"
                        id="classDryRun"
                        checked={classDryRun}
                        onChange={(e) => setClassDryRun(e.target.checked)}
                    />
                    <CheckboxLabel htmlFor="classDryRun">Kiểm tra file</CheckboxLabel>
                </CheckboxContainer>
                {classErrorDescription && <ErrorTitle>{classErrorDescription}</ErrorTitle>}
                {classErrors.length > 0 && (
                    <ErrorList>
                        {classErrors.map((msg, index) => (
                            <ErrorItem key={index}>{msg}</ErrorItem>
                        ))}
                    </ErrorList>
                )}
            </ImportContainer1>
            <ImportContainer1>
                <ImportTitle>Thêm danh sách môn học theo lớp</ImportTitle>
                <div>
                    <FileInput
                        type="file"
                        accept=".xlsx"
                        ref={classSubjectFileInputRef}
                        onChange={handleClassSubjectFileChange}
                        id="class-subject-file-upload"
                    />
                    <FileInputLabel htmlFor="class-subject-file-upload">
                        {classSubjectFile ? classSubjectFile.name : 'Tải file lên'}
                    </FileInputLabel>
                    <DownloadButton onClick={handleDownloadClassSubjectTemplate} disabled={loading}>
                        {loading ? 'Đang tải...' : 'Lấy file mẫu'}
                    </DownloadButton>
                    <ActionButton
                        variant="primary"
                        onClick={handleImportClassSubjects}
                        disabled={loading || !classSubjectFile}
                        style={{ marginLeft: '10px' }}
                    >
                        {loading ? 'Đang xử lý...' : classSubjectDryRun ? 'Kiểm tra' : 'Tạo môn học'}
                    </ActionButton>
                </div>
                <CheckboxContainer>
                    <input
                        type="checkbox"
                        id="classSubjectDryRun"
                        checked={classSubjectDryRun}
                        onChange={(e) => setClassSubjectDryRun(e.target.checked)}
                    />
                    <CheckboxLabel htmlFor="classSubjectDryRun">Kiểm tra file</CheckboxLabel>
                </CheckboxContainer>
                {classSubjectErrorDescription && <ErrorTitle>{classSubjectErrorDescription}</ErrorTitle>}
                {classSubjectErrors.length > 0 && (
                    <ErrorList>
                        {classSubjectErrors.map((msg, index) => (
                            <ErrorItem key={index}>{msg}</ErrorItem>
                        ))}
                    </ErrorList>
                )}
            </ImportContainer1>
        </ImportContainer>
    );
};

export default ClassAndSubjectImport;