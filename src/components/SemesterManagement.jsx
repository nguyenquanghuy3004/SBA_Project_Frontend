import React, { useState, useEffect } from "react";
import semesterService from "../services/semesterService";
import Pagination from "./Pagination";

const SemesterManagement = () => {
    const [semesters, setSemesters] = useState([]);
    const [formData, setFormData] = useState({ name: "", status: "OPEN_REGISTRATION", startDate: "", endDate: "" });
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Bản đồ để chuyển đổi từ tiếng Anh (Backend) sang tiếng Việt (Hiển thị)
    const statusMap = {
        "OPEN_REGISTRATION": "Mở đăng ký",
        "ONGOING": "Đang diễn ra",
        "CLOSED": "Đã kết thúc"
    };

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
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
                await semesterService.updateSemester(editingId, formData);
                showToast("Cập nhật học kỳ thành công!");
            } else {
                await semesterService.createSemester(formData);
                showToast("Tạo học kỳ mới thành công!");
            }
            handleCancel();
            fetchSemesters();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", status: "OPEN_REGISTRATION", startDate: "", endDate: "" });
        setEditingId(null);
    };

    const handleEdit = (semester) => {
        setFormData({ 
            name: semester.name, 
            status: semester.status, 
            startDate: semester.startDate || "", 
            endDate: semester.endDate || "" 
        });
        setEditingId(semester.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa học kỳ này?")) {
            try {
                await semesterService.deleteSemester(id);
                fetchSemesters();
                showToast("Đã xóa học kỳ!");
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
                <div className="form-group">
                    <label>Tên học kỳ</label>
                    <input
                        placeholder="VD: Học kỳ 1 - 2024"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Ngày bắt đầu</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Ngày kết thúc</label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="OPEN_REGISTRATION">Mở đăng ký</option>
                        <option value="ONGOING">Đang diễn ra</option>
                        <option value="CLOSED">Đã kết thúc</option>
                    </select>
                </div>
                <div className="form-group" style={{ flex: 'none' }}>
                    <label>&nbsp;</label>
                    <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className={editingId ? "save-btn" : "add-btn"}>
                            {editingId ? "Cập nhật" : "Thêm mới"}
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
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.name}</td>
                            <td>{formatDate(s.startDate)}</td>
                            <td>{formatDate(s.endDate)}</td>
                            <td>
                                <span className={`user-badge status-${s.status?.toLowerCase()} ${s.status === 'ONGOING' ? 'bold' : ''}`}>
                                    {statusMap[s.status] || s.status}
                                </span>
                            </td>
                            <td>
                                <div className="header-actions">
                                    <button onClick={() => handleEdit(s)} className="edit-btn">Sửa</button>
                                    <button onClick={() => handleDelete(s.id)} className="delete-btn">Xóa</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination 
                itemsPerPage={itemsPerPage} 
                totalItems={semesters.length} 
                paginate={setCurrentPage} 
                currentPage={currentPage} 
            />
        </div>
    );
};

export default SemesterManagement;
