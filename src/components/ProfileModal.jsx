import React, { useState, useEffect } from "react";
import studentService from "../services/studentService";
import teacherService from "../services/teacherService";
import "../App.css";

const ProfileModal = ({ isOpen, onClose, user, isEditMode }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const isStudent = user?.roles.includes("ROLE_STUDENT");
    const isTeacher = user?.roles.includes("ROLE_TEACHER");

    // Helper to determine if a field should be disabled
    const isDisabled = (alwaysDisabled = false) => {
        if (!isEditMode) return true; // View mode: everything disabled
        return alwaysDisabled; // Edit mode: only restricted fields disabled
    };

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            let data;
            if (isStudent) {
                data = await studentService.getMyProfile();
            } else if (isTeacher) {
                data = await teacherService.getMyProfile();
            }
            setProfile(data);
        } catch (err) {
            console.error("Lỗi tải hồ sơ:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isStudent) {
                await studentService.updateStudent(profile.studentId, profile);
            } else if (isTeacher) {
                await teacherService.updateMyProfile(profile);
            }
            alert("Đã cập nhật thông tin thành công!");
            onClose();
        } catch (err) {
            alert("Cập nhật thất bại: " + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content profile-modal">
                <div className="modal-header">
                    <h3>{isEditMode ? "Chỉnh sửa hồ sơ" : "Chi tiết hồ sơ"}</h3>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : profile ? (
                    <form onSubmit={handleUpdate} className="profile-form-compact">
                        <div className="form-grid">
                            {/* CÁC TRƯỜNG CHO SINH VIÊN */}
                            {isStudent && (
                                <>
                                    <div className="form-group">
                                        <label>Mã Sinh Viên</label>
                                        <input type="text" value={profile.studentId} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và Tên</label>
                                        <input type="text" value={profile.studentName} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngành học</label>
                                        <input type="text" value={profile.major} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Lớp</label>
                                        <input type="text" value={profile.studentClass || ""} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={profile.studentEmail}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, studentEmail: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="text" value={profile.studentPhone}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, studentPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Địa chỉ</label>
                                        <input type="text" value={profile.address || ""}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* CÁC TRƯỜNG CHO GIẢNG VIÊN */}
                            {isTeacher && (
                                <>
                                    <div className="form-group">
                                        <label>ID Giảng Viên</label>
                                        <input type="text" value={profile.id} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và Tên</label>
                                        <input type="text" value={profile.fullName}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Khoa / Bộ môn</label>
                                        <input type="text" value={profile.department}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, department: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Học vị</label>
                                        <input type="text" value={profile.degree}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, degree: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* CÁC TRƯỜNG CHO ADMIN HOẶC USER CHUNG */}
                            {!isStudent && !isTeacher && (
                                <>
                                    <div className="form-group">
                                        <label>Tên đăng nhập</label>
                                        <input type="text" value={user.username} disabled className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email hệ thống</label>
                                        <input type="text" value={user.email} disabled className="disabled-input" />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Vai trò</label>
                                        <input type="text" value={user.roles.join(", ")} disabled className="disabled-input" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-buttons">
                            {isEditMode && (isStudent || isTeacher) && (
                                <button type="submit" className="save-btn">Lưu thay đổi</button>
                            )}
                            <button type="button" className="cancel-btn" onClick={onClose}>Đóng</button>
                        </div>
                    </form>
                ) : (
                    <div className="error">Không tìm thấy thông tin cá nhân phù hợp.</div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
