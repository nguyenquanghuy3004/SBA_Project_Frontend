import React, { useState, useEffect } from "react";
import courseService from "../services/courseService";

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({ courseCode: "", name: "", creadits: 3 });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

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
                alert("Course updated!");
            } else {
                await courseService.createCourse(formData);
                alert("Course added!");
            }
            setFormData({ courseCode: "", name: "", creadits: 3 });
            setEditingId(null);
            fetchCourses();
        } catch (err) { alert(err.message); }
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
        if (window.confirm("Delete this course?")) {
            await courseService.deleteCourse(id);
            fetchCourses();
        }
    };

    return (
        <div className="management-section">
            <h3>Course Management</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
                <input
                    placeholder="Code (e.g. IT101)"
                    value={formData.courseCode}
                    onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                    required
                />
                <input
                    placeholder="Course Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Credits"
                    value={formData.creadits}
                    onChange={e => setFormData({ ...formData, creadits: parseInt(e.target.value) })}
                    required
                />
                <div className="header-actions">
                    <button type="submit" className={editingId ? "save-btn" : "add-btn"}>
                        {editingId ? "Update Course" : "Add Course"}
                    </button>
                    {editingId && (
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <table className="student-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Credits</th>
                        <th>Action</th>
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
                                    <button onClick={() => handleEdit(c)} className="refresh-btn" style={{ padding: '6px 12px' }}>Edit</button>
                                    <button onClick={() => handleDelete(c.id)} className="delete-btn">Delete</button>
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
