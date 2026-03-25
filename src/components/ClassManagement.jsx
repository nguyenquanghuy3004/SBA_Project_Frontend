import React, { useState, useEffect } from "react";
import classService from "../services/classService";
import courseService from "../services/courseService";
import semesterService from "../services/semesterService";
import teacherService from "../services/teacherService";
import Pagination from "./Pagination";

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        course: { id: "" },
        semester: { id: "" },
        teacher: { id: "" },
        room: "",
        schedule: "",
        maxStudents: 40
    });
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const classesData = await classService.getAllClasses();
            const coursesData = await courseService.getAllCourses();
            const semestersData = await semesterService.getAllSemesters();
            const teachersData = await teacherService.getAllTeachers();
            setClasses(classesData);
            setCourses(coursesData);
            setSemesters(semestersData);
            setTeachers(teachersData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (cls) => {
        setEditingId(cls.id);
        setFormData({
            course: { id: cls.course?.id || "" },
            semester: { id: cls.semester?.id || "" },
            teacher: { id: cls.teacher?.id || "" },
            room: cls.room,
            schedule: cls.schedule,
            maxStudents: cls.maxStudents || 40
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            course: { id: "" },
            semester: { id: "" },
            teacher: { id: "" },
            room: "",
            schedule: "",
            maxStudents: 40
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Chuẩn bị dữ liệu: Chuyển các ID rỗng thành null để tránh lỗi Backend
            const payload = {
                ...formData,
                course: formData.course.id ? { id: parseInt(formData.course.id) } : null,
                semester: formData.semester.id ? { id: parseInt(formData.semester.id) } : null,
                teacher: formData.teacher.id ? { id: parseInt(formData.teacher.id) } : null,
                maxStudents: parseInt(formData.maxStudents) || 40
            };

            if (editingId) {
                await classService.updateClass(editingId, payload);
                showToast("Cập nhật lớp học thành công!");
            } else {
                await classService.createClass(payload);
                showToast("Mở lớp học thành công!");
            }
            handleCancel();
            fetchData();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa lớp học này?")) {
            try {
                await classService.deleteClass(id);
                fetchData();
                showToast("Đã xóa lớp học!");
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
            <h3>Quản lý Lớp học</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Môn học</label>
                    <select
                        value={formData.course.id}
                        onChange={e => setFormData({ ...formData, course: { id: e.target.value } })}
                        required
                    >
                        <option value="">-- Chọn môn --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Học kỳ</label>
                    <select
                        value={formData.semester.id}
                        onChange={e => setFormData({ ...formData, semester: { id: e.target.value } })}
                        required
                    >
                        <option value="">-- Chọn học kỳ --</option>
                        {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Giáo viên</label>
                    <select
                        value={formData.teacher.id}
                        onChange={e => setFormData({ ...formData, teacher: { id: e.target.value } })}
                        required
                    >
                        <option value="">-- Chọn giáo viên --</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Phòng học</label>
                    <input
                        placeholder="VD: A101"
                        value={formData.room}
                        onChange={e => setFormData({ ...formData, room: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Lịch học</label>
                    <input
                        placeholder="VD: Thứ 2 07:00"
                        value={formData.schedule}
                        onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group" style={{ flex: 'none' }}>
                    <label>&nbsp;</label>
                    <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className={editingId ? "save-btn" : "add-btn"}>
                            {editingId ? "Cập nhật" : "Mở lớp"}
                        </button>
                        {editingId && (
                            <button type="button" className="cancel-btn" onClick={handleCancel}>
                                Hủy
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <table className="student-table">
                <thead>
                    <tr>
                        <th>Môn học</th>
                        <th>Học kỳ</th>
                        <th>Giáo viên</th>
                        <th>Phòng</th>
                        <th>Lịch học</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(cls => (
                        <tr key={cls.id}>
                            <td>{cls.course?.name}</td>
                            <td>
                                <span className="user-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                                    {cls.semester?.name}
                                </span>
                            </td>
                            <td>{cls.teacher?.fullName || "Chưa phân công"}</td>
                            <td>{cls.room}</td>
                            <td>{cls.schedule}</td>
                            <td>
                                <div className="header-actions">
                                    <button onClick={() => handleEdit(cls)} className="edit-btn">Sửa</button>
                                    <button onClick={() => handleDelete(cls.id)} className="delete-btn">Xóa</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination 
                itemsPerPage={itemsPerPage} 
                totalItems={classes.length} 
                paginate={setCurrentPage} 
                currentPage={currentPage} 
            />
        </div>
    );
};

export default ClassManagement;
