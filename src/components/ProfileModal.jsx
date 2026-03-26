import React, { useState, useEffect } from "react";
import studentService from "../services/studentService";
import teacherService from "../services/teacherService";
import "../App.css";

const ProfileModal = ({ isOpen, onClose, user, isEditMode }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };
    const isStudent = user?.roles.includes("STUDENT");
    const isTeacher = user?.roles.includes("TEACHER");

   
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
            showToast("✅ Đã cập nhật thông tin thành công!");
            // Đợi 1 lát cho user thấy toast rồi mới đóng modal
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            showToast("Cập nhật thất bại: " + err.message, "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-msg">{toast.msg}</span>
                    <button className="toast-close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}
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
                                        <label>Mã Số Sinh Viên (MSSV)</label>
                                        <input type="text" value={profile.mssv || ""} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và Tên</label>
                                        <input type="text" value={profile.studentName || ""} 
                                            disabled={isDisabled(false)} 
                                            onChange={e => setProfile({ ...profile, studentName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giới tính</label>
                                        <select 
                                            value={profile.gender || "Nam"} 
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                            className={isDisabled(false) ? "" : "editable-select"}
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày sinh</label>
                                        <input type="date" value={profile.dateOfBirth || ""} 
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={profile.studentEmail || ""}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, studentEmail: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="text" value={profile.studentPhone || ""}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, studentPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngành học</label>
                                        <input type="text" value={profile.major || ""} disabled={isDisabled(true)} className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ</label>
                                        <input type="text" value={profile.address || ""}
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Lớp sinh hoạt</label>
                                        <input type="text" value={profile.classroom ? profile.classroom.className : "Chưa xếp lớp"} disabled={isDisabled(true)} className="disabled-input" />
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
                                        <select 
                                            value={profile.degree || "Cử nhân"} 
                                            disabled={isDisabled(false)}
                                            onChange={e => setProfile({ ...profile, degree: e.target.value })}
                                            className={isDisabled(false) ? "" : "editable-select"}
                                        >
                                            <option value="Cử nhân">Cử nhân</option>
                                            <option value="Thạc sĩ">Thạc sĩ</option>
                                            <option value="Tiến sĩ">Tiến sĩ</option>
                                            <option value="Giáo sư">Giáo sư</option>
                                        </select>
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
