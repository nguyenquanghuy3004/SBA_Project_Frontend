import React, { useState, useEffect } from "react";
import classService from "../services/classService";
import courseService from "../services/courseService";
import semesterService from "../services/semesterService";
import teacherService from "../services/teacherService";

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
                alert("Class updated!");
            } else {
                await classService.createClass(payload);
                alert("Class created!");
            }
            handleCancel();
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this class?")) {
            try {
                await classService.deleteClass(id);
                fetchData();
            } catch (err) { alert(err.message); }
        }
    };

    return (
        <div className="management-section">
            <h3>Class Management</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Course</label>
                    <select
                        value={formData.course.id}
                        onChange={e => setFormData({ ...formData, course: { id: e.target.value } })}
                        required
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Semester</label>
                    <select
                        value={formData.semester.id}
                        onChange={e => setFormData({ ...formData, semester: { id: e.target.value } })}
                        required
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Teacher</label>
                    <select
                        value={formData.teacher.id}
                        onChange={e => setFormData({ ...formData, teacher: { id: e.target.value } })}
                        required
                    >
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Room</label>
                    <input
                        placeholder="e.g. A101"
                        value={formData.room}
                        onChange={e => setFormData({ ...formData, room: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Schedule</label>
                    <input
                        placeholder="e.g. Mon 7:00"
                        value={formData.schedule}
                        onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label style={{ visibility: 'hidden' }}>Action</label>
                    <div className="header-actions">
                        <button type="submit" className={editingId ? "save-btn" : "add-btn"} style={{ margin: 0, height: '48px', minWidth: '120px' }}>
                            {editingId ? "Update Class" : "Open Class"}
                        </button>
                        {editingId && (
                            <button type="button" className="cancel-btn" onClick={handleCancel} style={{ height: '48px' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <table className="student-table">
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Semester</th>
                        <th>Teacher</th>
                        <th>Room</th>
                        <th>Schedule</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(cls => (
                        <tr key={cls.id}>
                            <td>{cls.course?.name}</td>
                            <td>
                                <span className="user-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                                    {cls.semester?.name}
                                </span>
                            </td>
                            <td>{cls.teacher?.fullName || "TBA"}</td>
                            <td>{cls.room}</td>
                            <td>{cls.schedule}</td>
                            <td>
                                <div className="header-actions">
                                    <button onClick={() => handleEdit(cls)} className="refresh-btn" style={{ padding: '6px 12px' }}>Edit</button>
                                    <button onClick={() => handleDelete(cls.id)} className="delete-btn">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClassManagement;
