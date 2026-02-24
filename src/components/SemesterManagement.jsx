import React, { useState, useEffect } from "react";
import semesterService from "../services/semesterService";

const SemesterManagement = () => {
    const [semesters, setSemesters] = useState([]);
    const [formData, setFormData] = useState({ name: "", status: "OPEN_REGISTRATION" });
    const [editingId, setEditingId] = useState(null);

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
                alert("Semester updated!");
            } else {
                // Ngược lại thì gọi API Create
                await semesterService.createSemester(formData);
                alert("Semester created!");
            }
            handleCancel(); // Reset form
            fetchSemesters(); // Load lại danh sách
        } catch (err) { alert(err.message); }
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
        if (window.confirm("Delete this semester?")) {
            try {
                await semesterService.deleteSemester(id);
                fetchSemesters();
            } catch (err) { alert(err.message); }
        }
    };

    return (
        <div className="management-section">
            <h3>Semester Management</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
                <input
                    placeholder="Semester Name (e.g. Fall 2024)"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                    <option value="OPEN_REGISTRATION">Open Registration</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="FINISHED">Finished</option>
                </select>
                <div className="header-actions">
                    <button type="submit" className={editingId ? "save-btn" : "add-btn"}>
                        {editingId ? "Update Semester" : "Create Semester"}
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
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Action</th>
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
                                    <button onClick={() => handleEdit(s)} className="refresh-btn" style={{ padding: '6px 12px' }}>Edit</button>
                                    <button onClick={() => handleDelete(s.id)} className="delete-btn">Delete</button>
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
