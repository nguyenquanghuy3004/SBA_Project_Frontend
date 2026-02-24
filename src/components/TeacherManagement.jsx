import React, { useState, useEffect } from "react";
import teacherService from "../services/teacherService";

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            setError("Failed to fetch teachers: " + err.message);
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
                alert("Teacher updated!");
            } else {
                await teacherService.createTeacher(newTeacher);
                alert("Teacher created!");
            }
            handleCloseModal();
            fetchTeachers();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will also delete the teacher's user account.")) {
            try {
                await teacherService.deleteTeacher(id);
                fetchTeachers();
            } catch (err) {
                alert("Delete failed: " + err.message);
            }
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-list-container">
            <div className="management-section">
                <div className="list-header">
                    <h3>Teacher Management</h3>
                    <div className="header-actions">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="add-btn" onClick={() => setIsModalOpen(true)}>+ Add Teacher</button>
                        <button className="refresh-btn" onClick={fetchTeachers}>Refresh</button>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{editingId ? "Update Teacher Profile" : "Assign New Teacher Account"}</h3>
                            <form onSubmit={handleSubmit} className="admin-modal-form">
                                <div className="form-grid">
                                    <div className="section">
                                        <h4>Account Details {editingId && "(Read Only)"}</h4>
                                        <input
                                            type="text"
                                            placeholder="Username"
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
                                                placeholder="Initial Password"
                                                value={newTeacher.password}
                                                onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="section">
                                        <h4>Teacher Profile</h4>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={newTeacher.fullName}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Department"
                                            value={newTeacher.department}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                                            required
                                        />
                                        <select
                                            value={newTeacher.degree}
                                            onChange={(e) => setNewTeacher({ ...newTeacher, degree: e.target.value })}
                                        >
                                            <option value="Bachelor">Bachelor</option>
                                            <option value="Master">Master</option>
                                            <option value="PhD">PhD</option>
                                            <option value="Professor">Professor</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-buttons">
                                    <button type="submit" className="save-btn">{editingId ? "Update" : "Create"} Teacher</button>
                                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
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
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>Department</th>
                                <th>Degree</th>
                                <th>Actions</th>
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
                                            <button className="refresh-btn" style={{ padding: '6px 12px' }} onClick={() => handleEdit(t)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
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
