import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ReactSelect from 'react-select';
import { fetchReportSemester, exportClassTimetable, exportTeacherTimetable, exportClassTimetablePDF, exportTeacherTimetablePDF } from '../../api';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    width: 384px;
    max-width: 90vw;
`;
const Label = styled.label`
    position: relative;

`;
const Button = styled.button`
    background: #3b82f6;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s ease;

    &:hover {
        background: #2563eb;
    }

    &:disabled {
        background: #d1d5db;
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const Title = styled.h2`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
`;

const FieldContainer = styled.div`
    margin-bottom: 16px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const ExportBox = ({ isOpen, onClose, token }) => {
    const [type, setType] = useState('');
    const [option, setOption] = useState('Weekly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [current, setCurrent] = useState(0);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [fileType, setFileType] = useState('excel');
    const [weekOptions, setWeekOptions] = useState([]);
    const modalRef = useRef(null);

    useEffect(() => {
        if (option === 'Semester' && isOpen) {
            const fetchSemesters = async () => {
                try {
                    const data = await fetchReportSemester(token);
                    setSemesters(data.data_set || []);
                } catch (error) {
                    console.error('Lỗi khi lấy danh sách học kỳ:', error);
                    alert('Không thể lấy danh sách học kỳ. Vui lòng thử lại.');
                }
            };
            fetchSemesters();
        }
    }, [option, isOpen, token]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption ? selectedOption.value : '');
    };

    const handleOptionChange = (selectedOption) => {
        setOption(selectedOption ? selectedOption.value : 'Weekly');
        setSelectedSemester(null);
    };

    const handleYearChange = (selectedOption) => {
        setYear(selectedOption ? selectedOption.value : new Date().getFullYear());
    };

    const handleCurrentChange = (selectedOption) => {
        setCurrent(selectedOption ? selectedOption.value : 0);
    };

    const handleSemesterChange = (selectedOption) => {
        setSelectedSemester(selectedOption ? selectedOption.value : null);
    };

    const handleFileTypeChange = (selectedOption) => {
        setFileType(selectedOption ? selectedOption.value : 'excel');
    };
    const getCurrentWeekOffset = (selectedYear) => {
        const today = new Date();
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
        const referenceMonday = new Date(selectedYear, 0, 1);
        referenceMonday.setDate(referenceMonday.getDate() + (1 - referenceMonday.getDay() + 7) % 7);
        const diffInTime = currentMonday.getTime() - referenceMonday.getTime();
        const weekOffset = Math.round(diffInTime / (1000 * 3600 * 24 * 7));
        return weekOffset;
    };


    const getWeekLabel = (weekOffset, selectedYear) => {
        const referenceMonday = new Date(selectedYear, 0, 1);
        referenceMonday.setDate(referenceMonday.getDate() + (1 - referenceMonday.getDay() + 7) % 7);
        const currentMonday = new Date(referenceMonday);
        currentMonday.setDate(referenceMonday.getDate() + weekOffset * 7);
        const currentSunday = new Date(currentMonday);
        currentSunday.setDate(currentMonday.getDate() + 6);
        const formatDate = (date) => `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        return `Tuần ${formatDate(currentMonday)} - ${formatDate(currentSunday)}`;
    };


    useEffect(() => {
        if (option === 'Weekly') {
            const firstDay = new Date(year, 0, 1);
            const lastDay = new Date(year, 11, 31);
            const firstMonday = new Date(firstDay);
            firstMonday.setDate(firstDay.getDate() + (1 - firstDay.getDay() + 7) % 7);
            const lastSunday = new Date(lastDay);
            lastSunday.setDate(lastDay.getDate() + (6 - lastDay.getDay() + 7) % 7);
            const numberOfWeeks = Math.round((lastSunday.getTime() - firstMonday.getTime()) / (1000 * 3600 * 24 * 7)) + 1;
            const currentWeekOffset = getCurrentWeekOffset(year);
            setWeekOptions(
                Array.from({ length: numberOfWeeks }, (_, i) => ({
                    value: i - currentWeekOffset,
                    label: getWeekLabel(i, year),
                }))
            );
        } else {
            setWeekOptions([]);
        }
    }, [option, year]);
    useEffect(() => {
        if (option === 'Weekly') {
            setCurrent(0);
        }
    }, []);


    const yearOptions = Array.from({ length: 11 }, (_, i) => ({
        value: new Date().getFullYear() - 5 + i,
        label: `${new Date().getFullYear() - 5 + i}`,
    }));

    const getMonthOptions = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        return Array.from({ length: 12 }, (_, i) => {
            let monthValue;
            if (year === today.getFullYear()) {
                monthValue = i - currentMonth;
            } else {
                const monthDiff = (year - today.getFullYear()) * 12 + i - currentMonth;
                monthValue = monthDiff;
            }
            return {
                value: monthValue,
                label: `Tháng ${i + 1}`,
            };
        });
    };

    const handleExport = async () => {
        try {
            const exportCurrent = option === 'Semester' ? selectedSemester : current;
            let blob;

            if (type === 'Class') {
                blob = fileType === 'excel'
                    ? await exportClassTimetable(token, exportCurrent, option, year)
                    : await exportClassTimetablePDF(token, exportCurrent, option, year);
            } else if (type === 'Teacher') {
                blob = fileType === 'excel'
                    ? await exportTeacherTimetable(token, exportCurrent, option, year)
                    : await exportTeacherTimetablePDF(token, exportCurrent, option, year);
            }
            let timePeriod = '';
            if (option === 'Weekly') {

                const weekLabel = getWeekLabel(current + getCurrentWeekOffset(year), year)
                    .replace('Tuần ', '')
                    .replace(/\s/g, '');
                timePeriod = `${weekLabel}`;
            } else if (option === 'Monthly') {
                const today = new Date();
                const currentMonth = today.getMonth();
                const selectedMonth = (current + currentMonth) % 12 + 1;
                timePeriod = `Month_${selectedMonth}_${year}`;
            } else if (option === 'Semester') {

                const semester = semesters.find((sem) => sem.id === selectedSemester);
                timePeriod = semester ? semester.semester_name.replace(/\s+/g, '_') : `Học_kỳ_${selectedSemester}`;
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TKB_${type}_${timePeriod}.${fileType === 'excel' ? 'xlsx' : 'pdf'}`;
            link.click();
            window.URL.revokeObjectURL(url);
            onClose();
        } catch (error) {
            console.error('Lỗi khi xuất file:', error);
            alert(`Lỗi khi xuất file: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer ref={modalRef}>
                <Title>Xuất Thời Khóa Biểu</Title>
                <FieldContainer>

                    <ReactSelect
                        value={type ? { value: type, label: type === 'Class' ? 'Lớp' : 'Giáo Viên' } : null}
                        onChange={handleTypeChange}
                        options={[
                            { value: 'Class', label: 'Lớp' },
                            { value: 'Teacher', label: 'Giáo Viên' },
                        ]}
                        placeholder="-- Chọn loại --"
                        isSearchable={false}
                        styles={selectStyles}
                    />
                </FieldContainer>

                <FieldContainer>
                    <ReactSelect
                        value={year ? { value: year, label: `${year}` } : null}
                        onChange={handleYearChange}
                        options={yearOptions}
                        placeholder="-- Chọn năm --"
                        isSearchable={true}
                        styles={selectStyles}
                    />
                </FieldContainer>
                <FieldContainer>
                    <ReactSelect
                        value={option ? { value: option, label: option === 'Weekly' ? 'Tuần' : option === 'Monthly' ? 'Tháng' : 'Học kỳ' } : null}
                        onChange={handleOptionChange}
                        options={[
                            { value: 'Weekly', label: 'Tuần' },
                            { value: 'Monthly', label: 'Tháng' },
                            { value: 'Semester', label: 'Học kỳ' },
                        ]}
                        placeholder="-- Chọn khoảng thời gian --"
                        isSearchable={false}
                        styles={selectStyles}
                    />
                </FieldContainer>
                {option === 'Weekly' && (
                    <FieldContainer>
                        <ReactSelect
                            value={current !== null ? { value: current, label: getWeekLabel(current + getCurrentWeekOffset(year), year) } : null}
                            onChange={handleCurrentChange}
                            options={weekOptions}
                            placeholder="-- Chọn tuần --"
                            isSearchable={true}
                            styles={selectStyles}
                        />
                    </FieldContainer>
                )}
                {option === 'Monthly' && (
                    <FieldContainer>
                        <ReactSelect
                            value={current !== null ? { value: current, label: `Tháng ${((current + new Date().getMonth()) % 12) + 1}` } : null}
                            onChange={handleCurrentChange}
                            options={getMonthOptions()}
                            placeholder="-- Chọn tháng --"
                            isSearchable={false}
                            styles={selectStyles}
                        />
                    </FieldContainer>
                )}
                {option === 'Semester' && (
                    <FieldContainer>
                        <ReactSelect
                            value={selectedSemester ? { value: selectedSemester, label: semesters.find((sem) => sem.id === selectedSemester)?.semester_name } : null}
                            onChange={handleSemesterChange}
                            options={semesters.map((sem) => ({ value: sem.id, label: sem.semester_name }))}
                            placeholder="-- Chọn học kỳ --"
                            isSearchable={true}
                            styles={selectStyles}
                        />
                    </FieldContainer>
                )}
                <FieldContainer>
                    <ReactSelect
                        value={fileType ? { value: fileType, label: fileType === 'excel' ? 'Excel' : 'PDF' } : null}
                        onChange={handleFileTypeChange}
                        options={[
                            { value: 'excel', label: 'Excel' },
                            { value: 'pdf', label: 'PDF' },
                        ]}
                        placeholder="-- Chọn loại file --"
                        isSearchable={false}
                        styles={selectStyles}
                    />
                </FieldContainer>
                <ButtonContainer>
                    <Button onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={!type || (option === 'Semester' && !selectedSemester)}
                    >
                        Xuất
                    </Button>
                </ButtonContainer>
            </ModalContainer>
        </ModalOverlay>
    );
};

const selectStyles = {
    control: (provided) => ({
        ...provided,
        padding: '3px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937',
        backgroundColor: 'white',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
            borderColor: '#3b82f6',
        },
        '&:focus-within': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '14px',
        color: '#1f2937',
        backgroundColor: state.isSelected
            ? '#3b82f6'
            : state.isFocused
                ? '#f1f5f9'
                : 'white',
        '&:active': {
            backgroundColor: '#e0e7ff',
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#9ca3af',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1f2937',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        maxHeight: '300px',

    }),
};

export default ExportBox;