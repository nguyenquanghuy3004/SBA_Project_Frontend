import React, { useState, useEffect } from "react";
import studentService from "../services/studentService";

const StudentList = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        studentName: "",
        gender: "Male",
        dateOfBirth: "",
        studentEmail: "",
        studentPhone: "",
        major: "",
        gpa: ""
    });

    const [editingStudent, setEditingStudent] = useState(null);

    const isAdminOrTeacher = user && (user.roles.includes("ROLE_ADMIN") || user.roles.includes("ROLE_TEACHER"));

    const fetchStudents = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await studentService.getAllStudents();
            setStudents(data);
        } catch (err) {
            setError("Failed to fetch students. " + (err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdminOrTeacher) {
            fetchStudents();
        }
    }, [isAdminOrTeacher]);

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await studentService.createStudent(newStudent);
            setIsModalOpen(false);
            setNewStudent({
                studentName: "",
                gender: "Male",
                dateOfBirth: "",
                studentEmail: "",
                studentPhone: "",
                major: "",
                gpa: ""
            });
            fetchStudents();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent({ ...student });
        setIsEditModalOpen(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await studentService.updateStudent(editingStudent.studentId, editingStudent);
            setIsEditModalOpen(false);
            setEditingStudent(null);
            fetchStudents();
            alert("Student updated successfully!");
        } catch (err) {
            alert("Update failed: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await studentService.deleteStudent(id);
                setStudents(students.filter(s => s.studentId !== id));
            } catch (err) {
                alert("Failed to delete student: " + err.message);
            }
        }
    };

    if (!isAdminOrTeacher) {
        return (
            <div className="permission-denied">
                <h3>Access Denied</h3>
                <p>Only Admins and Teachers can view the student list.</p>
            </div>
        );
    }

    return (
        <div className="student-list-container">
            <div className="list-header">
                <h2>Student Registry</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                        + Add Student
                    </button>
                    <button className="refresh-btn" onClick={fetchStudents} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh List"}
                    </button>
                </div>
            </div>

            {/* Modal for adding new student */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Student</h3>
                        <form onSubmit={handleCreateStudent}>
                            <input
                                type="text"
                                placeholder="Student Name"
                                value={newStudent.studentName}
                                onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                                required
                            />
                            <select
                                value={newStudent.gender}
                                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                                required
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="date"
                                value={newStudent.dateOfBirth}
                                onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newStudent.studentEmail}
                                onChange={(e) => setNewStudent({ ...newStudent, studentEmail: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone (10 digits)"
                                value={newStudent.studentPhone}
                                onChange={(e) => setNewStudent({ ...newStudent, studentPhone: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Major"
                                value={newStudent.major}
                                onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="GPA (0-10)"
                                value={newStudent.gpa}
                                onChange={(e) => setNewStudent({ ...newStudent, gpa: e.target.value })}
                                required
                            />
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for editing student */}
            {isEditModalOpen && editingStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Student: {editingStudent.studentId}</h3>
                            <button className="close-x" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdateStudent}>
                            <div className="form-group">
                                <label>Họ và Tên</label>
                                <input
                                    type="text"
                                    value={editingStudent.studentName}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, studentName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Giới tính</label>
                                <select
                                    value={editingStudent.gender}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                                    required
                                >
                                    <option value="Male">Nam</option>
                                    <option value="Female">Nữ</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input
                                    type="date"
                                    value={editingStudent.dateOfBirth}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editingStudent.studentEmail}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, studentEmail: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    value={editingStudent.studentPhone}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, studentPhone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Chuyên ngành</label>
                                <input
                                    type="text"
                                    value={editingStudent.major}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, major: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>GPA</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={editingStudent.gpa}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, gpa: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">Update</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {loading && <div className="loading-spinner">Loading students...</div>}

            {!loading && (
                <div className="table-responsive">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Birth Date</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Major</th>
                                <th>GPA</th>
                                {user.roles.includes("ROLE_ADMIN") && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students
                                .filter(s =>
                                    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    s.studentId.toString().includes(searchTerm)
                                )
                                .map((student) => (
                                    <tr key={student.studentId}>
                                        <td>{student.studentId}</td>
                                        <td>{student.studentName}</td>
                                        <td>{student.gender}</td>
                                        <td>{student.dateOfBirth}</td>
                                        <td>{student.studentEmail}</td>
                                        <td>{student.studentPhone}</td>
                                        <td>{student.major}</td>
                                        <td>{student.gpa}</td>
                                        {user.roles.includes("ROLE_ADMIN") && (
                                            <td>
                                                <div className="header-actions">
                                                    <button
                                                        className="refresh-btn"
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#4f46e5' }}
                                                        onClick={() => handleEditClick(student)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(student.studentId)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    {students.length === 0 && <p className="no-data">No students found.</p>}
                </div>
            )}
        </div>
    );
};

export default StudentList;
