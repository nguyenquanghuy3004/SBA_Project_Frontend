import React, { useState, useEffect } from "react";
import courseService from "../services/courseService";

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({ courseCode: "", name: "", creadits: 3 });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        const data = await courseService.getAllCourses();
        setCourses(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await courseService.updateCourse(editingId, formData);
                showToast("✅ Cập nhật môn học thành công!");
            } else {
                await courseService.createCourse(formData);
                showToast("✅ Thêm môn học thành công!");
            }
            setFormData({ courseCode: "", name: "", creadits: 3 });
            setEditingId(null);
            fetchCourses();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleEdit = (course) => {
        setEditingId(course.id);
        setFormData({
            courseCode: course.courseCode,
            name: course.name,
            creadits: course.creadits
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ courseCode: "", name: "", creadits: 3 });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa môn học này?")) {
            try {
                await courseService.deleteCourse(id);
                fetchCourses();
                showToast("🗑️ Đã xóa môn học!");
            } catch (err) {
                showToast("Xóa thất bại: " + err.message, "error");
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
            <h3>Quản lý Môn học</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
                <input
                    placeholder="Mã môn (VD: IT101)"
                    value={formData.courseCode}
                    onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                    required
                />
                <input
                    placeholder="Tên môn học"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Số tín chỉ"
                    value={formData.creadits}
                    onChange={e => setFormData({ ...formData, creadits: parseInt(e.target.value) })}
                    required
                />
                <div className="header-actions">
                    <button type="submit" className={editingId ? "save-btn" : "add-btn"}>
                        {editingId ? "Cập nhật môn học" : "Thêm môn học"}
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
                        <th>Mã môn</th>
                        <th>Tên môn</th>
                        <th>Tín chỉ</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(c => (
                        <tr key={c.id}>
                            <td>{c.courseCode}</td>
                            <td>{c.name}</td>
                            <td>{c.creadits}</td>
                            <td>
                                <div className="header-actions">
                                    <button onClick={() => handleEdit(c)} className="refresh-btn" style={{ padding: '6px 12px' }}>Sửa</button>
                                    <button onClick={() => handleDelete(c.id)} className="delete-btn">Xóa</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CourseManagement;
