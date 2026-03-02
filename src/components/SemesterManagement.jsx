import React, { useState, useEffect } from "react";
import semesterService from "../services/semesterService";

const SemesterManagement = () => {
    const [semesters, setSemesters] = useState([]);
    const [formData, setFormData] = useState({ name: "", status: "OPEN_REGISTRATION" });
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => { fetchSemesters(); }, []);

    const fetchSemesters = async () => {
        try {
            const data = await semesterService.getAllSemesters();
            setSemesters(data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Nếu có ID đang sửa thì gọi API Update
                await semesterService.updateSemester(editingId, formData);
                showToast(" Cập nhật học kỳ thành công!");
            } else {
                // Ngược lại thì gọi API Create
                await semesterService.createSemester(formData);
                showToast(" Tạo học kỳ mới thành công!");
            }
            handleCancel(); // Reset form
            fetchSemesters(); // Load lại danh sách
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", status: "OPEN_REGISTRATION" });
        setEditingId(null);
    };

    const handleEdit = (semester) => {
        setFormData({ name: semester.name, status: semester.status });
        setEditingId(semester.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa học kỳ này?")) {
            try {
                await semesterService.deleteSemester(id);
                fetchSemesters();
                showToast("🗑️ Đã xóa học kỳ!");
            } catch (err) {
                showToast(err.message, "error");
            }
        }
    };

    return (
        <div className="management-section">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-msg">{toast.msg}</span>
                    <button className="toast-close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}
            <h3>Quản lý Học kỳ</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
                <input
                    placeholder="Tên học kỳ (VD: Học kỳ 1 - 2024)"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                    <option value="OPEN_REGISTRATION">Mở đăng ký</option>
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="FINISHED">Đã kết thúc</option>
                </select>
                <div className="header-actions">
                    <button type="submit" className={editingId ? "save-btn" : "add-btn"}>
                        {editingId ? "Cập nhật học kỳ" : "Tạo học kỳ"}
                    </button>
                    {editingId && (
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Hủy
                        </button>
                    )}
                </div>
            </form>

            <table className="student-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.name}</td>
                            <td>
                                <span className={`user-badge ${s.status === 'ONGOING' ? 'bold' : ''}`}>
                                    {s.status}
                                </span>
                            </td>
                            <td>
                                <div className="header-actions">
                                    <button onClick={() => handleEdit(s)} className="refresh-btn" style={{ padding: '6px 12px' }}>Sửa</button>
                                    <button onClick={() => handleDelete(s.id)} className="delete-btn">Xóa</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SemesterManagement;
