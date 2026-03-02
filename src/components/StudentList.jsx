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
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const isAdminOrTeacher = user && (user.roles.includes("ROLE_ADMIN") || user.roles.includes("ROLE_TEACHER"));

    const fetchStudents = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await studentService.getAllStudents();
            setStudents(data);
        } catch (err) {
            setError("Không thể tải danh sách sinh viên. " + (err.message || ""));
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
            showToast("Đã thêm sinh viên thành công!");
        } catch (err) {
            showToast(err.message, "error");
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
            showToast("Cập nhật sinh viên thành công!");
        } catch (err) {
            showToast("Cập nhật thất bại: " + err.message, "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
            try {
                await studentService.deleteStudent(id);
                setStudents(students.filter(s => s.studentId !== id));
                showToast("🗑️ Đã xóa sinh viên!");
            } catch (err) {
                showToast("Xóa sinh viên thất bại: " + err.message, "error");
            }
        }
    };

    if (!isAdminOrTeacher) {
        return (
            <div className="permission-denied">
                <h3>Không có quyền truy cập</h3>
                <p>Chỉ Quản trị viên và Giáo viên mới có thể xem danh sách sinh viên.</p>
            </div>
        );
    }

    return (
        <div className="student-list-container">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-msg">{toast.msg}</span>
                    <button className="toast-close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}
            <div className="list-header">
                <h2>Danh sách Sinh viên</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc MSSV..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                        + Thêm sinh viên
                    </button>
                    <button className="refresh-btn" onClick={fetchStudents} disabled={loading}>
                        {loading ? "Đang tải..." : "Làm mới"}
                    </button>
                </div>
            </div>

            {/* Modal for adding new student */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Thêm sinh viên mới</h3>
                        <form onSubmit={handleCreateStudent}>
                            <input
                                type="text"
                                placeholder="Họ và tên"
                                value={newStudent.studentName}
                                onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                                required
                            />
                            <select
                                value={newStudent.gender}
                                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                                required
                            >
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                                <option value="Other">Khác</option>
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
                                placeholder="Số điện thoại (10 số)"
                                value={newStudent.studentPhone}
                                onChange={(e) => setNewStudent({ ...newStudent, studentPhone: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Chuyên ngành"
                                value={newStudent.major}
                                onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Điểm trung bình (0-10)"
                                value={newStudent.gpa}
                                onChange={(e) => setNewStudent({ ...newStudent, gpa: e.target.value })}
                                required
                            />
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">Lưu</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
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
                            <h3>Chỉnh sửa sinh viên: {editingStudent.studentId}</h3>
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
                                <button type="submit" className="save-btn">Cập nhật</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {loading && <div className="loading-spinner">Đang tải sinh viên...</div>}

            {!loading && (
                <div className="table-responsive">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ và tên</th>
                                <th>Giới tính</th>
                                <th>Ngày sinh</th>
                                <th>Email</th>
                                <th>Điện thoại</th>
                                <th>Chuyên ngành</th>
                                <th>GPA</th>
                                {user.roles.includes("ROLE_ADMIN") && <th>Thao tác</th>}
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
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(student.studentId)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    {students.length === 0 && <p className="no-data">Không có sinh viên nào.</p>}
                </div>
            )}
        </div>
    );
};

export default StudentList;
