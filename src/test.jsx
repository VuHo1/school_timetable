<SubjectsSection>
    <SectionTitle>
        <span>Danh sách môn học ({classSubjects.length} môn)</span>
        <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            <CopyButton onClick={() => setShowSubjectsModal(true)}>
                Đồng bộ với lớp khác
            </CopyButton>
            {!isEditingSubjects ? (
                <UpdateButton onClick={handleEditSubjects}>
                    Chỉnh sửa
                </UpdateButton>
            ) : (
                <>
                    <CancelEditButton onClick={handleCancelEditSubjects} disabled={saving}>
                        Hủy
                    </CancelEditButton>
                    <SaveButton onClick={handleSaveSubjects} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Xác nhận'}
                    </SaveButton>
                </>
            )}
        </div>
    </SectionTitle>
    {(isEditingSubjects ? editedSubjects : classSubjects).length > 0 ? (
        <TableContainer>
            <Table>
                <thead>
                    <tr>
                        <TableHeader2 style={{ width: '15%' }}>Mã môn</TableHeader2>
                        <TableHeader2 style={{ width: '25%' }}>Tên môn</TableHeader2>
                        <TableHeader2 style={{ width: '20%' }}>Giáo viên</TableHeader2>
                        <TableHeader2 style={{ width: '10%' }}>Tiết/tuần</TableHeader2>
                        <TableHeader2 style={{ width: '10%' }}>Tiết liên tiếp tối đa</TableHeader2>
                        <TableHeader2 style={{ width: '10%' }}>Cố định/Tránh</TableHeader2>
                        <TableHeader2 style={{ width: '10%' }}>Hành động</TableHeader2>
                    </tr>
                </thead>
                <tbody>
                    {(isEditingSubjects ? editedSubjects : classSubjects).map((subject, index) => (
                        <TableRow key={subject.id || subject.subject_code || index}>
                            <TableCell2>
                                {isEditingSubjects && subject.isTemporaryNew ? (
                                    <Select
                                        value={subject.subject_code || ''}
                                        onChange={(e) => handleSubjectChange(index, e.target.value)}
                                        style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        <option value="">Chọn môn học</option>
                                        {availableSubjects.map((subj) => (
                                            <option key={subj.subject_code} value={subj.subject_code}>
                                                {subj.subject_code}
                                            </option>
                                        ))}
                                    </Select>
                                ) : (
                                    subject.subject_code || 'N/b'
                                )}
                            </TableCell2>
                            <TableCell2>{subject.subject_name || 'N/a'}</TableCell2>
                            <TableCell2>
                                {isEditingSubjects ? (
                                    <Select
                                        value={subject.teacher_user_name || ''}
                                        onChange={(e) => handleChange(index, 'teacher_user_name', e.target.value)}
                                        onFocus={async () => {

                                            if (isOriginalSubject(subject.subject_code) && subject.subject_code) {
                                                try {
                                                    const token = localStorage.getItem('authToken');
                                                    const subjectData = await fetchSubjectsConfigByClass(token, subject.subject_code, classCode);
                                                    setEditedSubjects(prev => {
                                                        const updated = [...prev];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            available_teacher: subjectData.available_teacher || [],
                                                        };
                                                        return updated;
                                                    });
                                                } catch (error) {
                                                    console.error('Error loading subject config for teacher dropdown:', error);
                                                }
                                            }
                                        }}
                                        style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        <option value="">Chọn giáo viên</option>
                                        {subject.available_teacher?.map((teacher) => (
                                            <option key={teacher.user_name} value={teacher.user_name}>
                                                {teacher.full_name} ({teacher.user_name})
                                                {teacher.is_home_room_teacher ? ' ⭐ Chủ nhiệm lớp' : ''}
                                            </option>
                                        )) || []}
                                    </Select>
                                ) : (
                                    <span>
                                        {subject.teacher_user_name || 'Chưa phân công'}
                                        {subject.available_teacher?.find(t => t.user_name === subject.teacher_user_name)?.is_home_room_teacher && ' ⭐'}
                                    </span>
                                )}
                            </TableCell2>
                            <TableCell2>
                                {isEditingSubjects ? (
                                    <input
                                        type="number"
                                        min="1"
                                        value={subject.weekly_slot || 1}
                                        onChange={(e) => handleChange(index, 'weekly_slot', parseInt(e.target.value) || 1)}
                                        style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                ) : (
                                    subject.weekly_slot || 0
                                )}
                            </TableCell2>
                            <TableCell2>
                                {isEditingSubjects ? (
                                    <input
                                        type="number"
                                        min="1"
                                        value={subject.continuous_slot || 1}
                                        onChange={(e) => handleChange(index, 'continuous_slot', parseInt(e.target.value) || 1)}
                                        style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                ) : (
                                    subject.continuous_slot || 0
                                )}
                            </TableCell2>
                            <TableCell2>
                                <CopyButton
                                    onClick={() => openSlotModal(index)}
                                    style={{
                                        fontSize: '14px',
                                        padding: '4px 10px',
                                        background: '#6c757d'
                                    }}
                                >
                                    {subject.fixed_slot?.length || 0} - {subject.avoid_slot?.length || 0} tiết
                                </CopyButton>
                            </TableCell2>
                            <TableCell2>
                                {isEditingSubjects && (
                                    <DeleteButton onClick={() => handleDeleteSubject(subject.id || index)}>
                                        Xóa
                                    </DeleteButton>
                                )}
                            </TableCell2>
                        </TableRow>
                    ))}
                </tbody>
                {isEditingSubjects && (
                    <tbody>
                        <TableRow>
                            <TableCell2>-</TableCell2>
                            <TableCell2>-</TableCell2>
                            <TableCell2>-</TableCell2>
                            <TableCell2>-</TableCell2>
                            <TableCell2>-</TableCell2>
                            <TableCell2>-</TableCell2>
                            <TableCell2>
                                <AddButton
                                    onClick={handleAddNewSubject}
                                    disabled={hasEmptyNewRow()}
                                >
                                    + Thêm mới
                                </AddButton>
                            </TableCell2>
                        </TableRow>
                    </tbody>
                )}
            </Table>
        </TableContainer>
    ) : (
        <NoSubjects>
            <p>Lớp học chưa có môn học nào được phân công.</p>
        </NoSubjects>
    )}
</SubjectsSection>