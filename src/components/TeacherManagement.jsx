import React, { useState, useEffect } from "react";
import teacherService from "../services/teacherService";

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [newTeacher, setNewTeacher] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
        department: "",
        degree: "Bachelor"
    });

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const data = await teacherService.getAllTeachers();
            setTeachers(data);
        } catch (err) {
            setError("Không thể tải danh sách giáo viên: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleEdit = (teacher) => {
        setEditingId(teacher.id);
        setNewTeacher({
            username: teacher.user?.username || "",
            email: teacher.user?.email || "",
            password: "********", // Placeholder
            fullName: teacher.fullName,
            department: teacher.department,
            degree: teacher.degree
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setNewTeacher({
            username: "",
            email: "",
            password: "",
            fullName: "",
            department: "",
            degree: "Bachelor"
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Chỉ gửi dữ liệu profile khi update (Backend thường không cho đổi username qua hàm này)
                await teacherService.updateTeacher(editingId, {
                    fullName: newTeacher.fullName,
                    department: newTeacher.department,
                    degree: newTeacher.degree
                });
                showToast("Cập nhật giáo viên thành công!");
            } else {
                await teacherService.createTeacher(newTeacher);
                showToast("Tạo tài khoản giáo viên thành công!");
            }
            handleCloseModal();
            fetchTeachers();
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa? Tài khoản người dùng của giáo viên này cũng sẽ bị xóa.")) {
            try {
                await teacherService.deleteTeacher(id);
                fetchTeachers();
                showToast("🗑️ Đã xóa giáo viên!");
            } catch (err) {
                showToast("Xóa thất bại: " + err.message, "error");
            }
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-list-container">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-msg">{toast.msg}</span>
                    <button className="toast-close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}
            <div className="management-section">
                <div className="list-header">
                    <h3>Quản lý Giáo viên</h3>
                    <div className="header-actions">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm theo tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="add-btn" onClick={() => setIsModalOpen(true)}>+ Thêm giáo viên</button>
                        <button className="refresh-btn" onClick={fetchTeachers}>Làm mới</button>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{editingId ? "Cập nhật thông tin giáo viên" : "Tạo tài khoản giáo viên mới"}</h3>
                            <form onSubmit={handleSubmit} className="admin-modal-form">
                                <div className="form-grid">
                                    <div className="section">
                                        <h4>Thông tin tài khoản {editingId && "(Chỉ đọc)"}</h4>
                                        <input
                                            type="text"
                                            placeholder="Tên đăng nhập"
                                            value={newTeacher.username}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                            required
                                            disabled={!!editingId}
                                            className={editingId ? "disabled-input" : ""}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newTeacher.email}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                            required
                                            disabled={!!editingId}
                                            className={editingId ? "disabled-input" : ""}
                                        />
                                        {!editingId && (
                                            <input
                                                type="password"
                                                placeholder="Mật khẩu khởi tạo"
                                                value={newTeacher.password}
                                                onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="section">
                                        <h4>Hồ sơ giáo viên</h4>
                                        <input
                                            type="text"
                                            placeholder="Họ và tên"
                                            value={newTeacher.fullName}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Khoa / Bộ môn"
                                            value={newTeacher.department}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                                            required
                                        />
                                        <select
                                            value={newTeacher.degree}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, degree: e.target.value })}
                                        >
                                            <option value="Bachelor">Cử nhân</option>
                                            <option value="Master">Thạc sĩ</option>
                                            <option value="PhD">Tiến sĩ</option>
                                            <option value="Professor">Giáo sư</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-buttons">
                                    <button type="submit" className="save-btn">{editingId ? "Cập nhật" : "Tạo mới"} giáo viên</button>
                                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>Hủy</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ và tên</th>
                                <th>Tên đăng nhập</th>
                                <th>Khoa / Bộ môn</th>
                                <th>Trình độ</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map(t => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td className="bold">{t.fullName}</td>
                                    <td>{t.user?.username}</td>
                                    <td>{t.department}</td>
                                    <td>{t.degree}</td>
                                    <td>
                                        <div className="header-actions">
                                            <button className="refresh-btn" style={{ padding: '6px 12px' }} onClick={() => handleEdit(t)}>Sửa</button>
                                            <button className="delete-btn" onClick={() => handleDelete(t.id)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherManagement;
