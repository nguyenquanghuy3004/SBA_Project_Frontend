import React, { useState, useEffect } from "react";
import studentService from "../services/studentService";
import classroomService from "../services/classroomService";
import Pagination from "./Pagination";

const StudentList = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMajor, setSelectedMajor] = useState("All");
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };
    const [classrooms, setClassrooms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedMajor]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        studentName: "",
        gender: "Nam",
        dateOfBirth: "",
        studentEmail: "",
        studentPhone: "",
        classroom: null,
        major: "",
        gpa: ""
    });

    const [editingStudent, setEditingStudent] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const isAdminOrTeacher = user && (
        user.roles.includes("ADMIN") || user.roles.includes("TEACHER")
    );

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
            fetchClassrooms();
        }
    }, [isAdminOrTeacher]);

    const fetchClassrooms = async () => {
        try {
            const data = await classroomService.getAllClassrooms();
            setClassrooms(data);
        } catch (err) {
            console.error("Lỗi lấy danh sách lớp:", err);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            // Làm sạch dữ liệu trước khi gửi
            const studentToCreate = {
                ...newStudent,
                studentName: newStudent.studentName?.trim(),
                studentEmail: newStudent.studentEmail?.trim(),
                studentPhone: newStudent.studentPhone?.trim(),
                major: newStudent.major?.trim(),
                gpa: newStudent.gpa === "" ? 0 : parseFloat(newStudent.gpa)
            };

            await studentService.createStudent(studentToCreate);
            setIsModalOpen(false);
            setNewStudent({
                studentName: "",
                gender: "Nam",
                dateOfBirth: "",
                studentEmail: "",
                studentPhone: "",
                classroom: null,
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
            // Đảm bảo GPA là số và các trường khác được trim
            const updatedData = {
                ...editingStudent,
                gpa: editingStudent.gpa === "" ? 0 : parseFloat(editingStudent.gpa),
                studentName: editingStudent.studentName?.trim(),
                studentEmail: editingStudent.studentEmail?.trim(),
                studentPhone: editingStudent.studentPhone?.trim()
            };

            await studentService.updateStudent(updatedData.studentId, updatedData);
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

    const filteredStudents = students.filter(s => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = 
            (s.studentName && s.studentName.toLowerCase().includes(searchLower)) ||
            (s.mssv && s.mssv.toLowerCase().includes(searchLower));
        const matchMajor = selectedMajor === "All" || s.major === selectedMajor;
        return matchSearch && matchMajor;
    });

    const formatGender = (g) => {
        if (!g) return "";
        if (g === "Female" || g === "Nữ") return "Nữ";
        if (g === "Male" || g === "Nam") return "Nam";
        if (g === "Other" || g === "Khác") return "Khác";
        return g;
    };

    const indexOfLastStudent = currentPage * itemsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

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
                    <select
                        className="filter-select-modern"
                        value={selectedMajor}
                        onChange={(e) => setSelectedMajor(e.target.value)}
                    >
                        <option value="All">Tất cả Chuyên ngành</option>
                        {Array.from(new Set(students.map(s => s.major))).filter(Boolean).map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
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
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
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
                            <select
                                value={newStudent.classroom?.id || ""}
                                onChange={(e) => {
                                    const cls = classrooms.find(c => c.id === parseInt(e.target.value));
                                    setNewStudent({ ...newStudent, classroom: cls });
                                }}
                            >
                                <option value="">-- Chọn lớp sinh hoạt --</option>
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.className}</option>
                                ))}
                            </select>
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
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
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
                                <label>Lớp sinh hoạt</label>
                                <select
                                    value={editingStudent.classroom?.id || ""}
                                    onChange={(e) => {
                                        const cls = classrooms.find(c => c.id === parseInt(e.target.value));
                                        setEditingStudent({ ...editingStudent, classroom: cls });
                                    }}
                                >
                                    <option value="">-- Chọn lớp sinh hoạt --</option>
                                    {classrooms.map(c => (
                                        <option key={c.id} value={c.id}>{c.className}</option>
                                    ))}
                                </select>
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
                                <th>MSSV</th>
                                <th>Họ và tên</th>
                                <th>Giới tính</th>
                                <th>Ngày sinh</th>
                                <th>Email</th>
                                <th>Điện thoại</th>
                                <th>Lớp</th>
                                <th>Chuyên ngành</th>
                                <th>GPA</th>
                                {(user.roles.includes("ROLE_ADMIN") || user.roles.includes("ADMIN")) && <th>Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentStudents.map((student) => (
                                <tr key={student.studentId}>
                                    <td className="bold">{student.mssv}</td>
                                    <td>{student.studentName}</td>
                                    <td>{formatGender(student.gender)}</td>
                                    <td>{formatDate(student.dateOfBirth)}</td>
                                    <td>{student.studentEmail}</td>
                                    <td>{student.studentPhone}</td>
                                    <td>{student.classroom ? student.classroom.className : "Chờ xếp lớp"}</td>
                                    <td>{student.major}</td>
                                    <td>{student.gpa != null ? Number(student.gpa).toFixed(2) : "-"}</td>
                                    {(user.roles.includes("ROLE_ADMIN") || user.roles.includes("ADMIN")) && (
                                        <td>
                                            <div className="header-actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditClick(student)} >Sửa
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
                    {filteredStudents.length === 0 && <p className="no-data">Không có sinh viên nào.</p>}
                    {filteredStudents.length > 0 && (
                        <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredStudents.length}
                            paginate={setCurrentPage}
                            currentPage={currentPage}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentList;
