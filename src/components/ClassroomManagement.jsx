import React, { useState, useEffect } from "react";
import classroomService from "../services/classroomService";
import Pagination from "./Pagination";

const ClassroomManagement = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [newClassName, setNewClassName] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const data = await classroomService.getAllClassrooms();
            setClassrooms(data);
        } catch (err) {
            showToast("Không thể tải danh sách lớp", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClassroom = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        try {
            await classroomService.createClassroom({ className: newClassName.trim() });
            setNewClassName("");
            fetchClassrooms();
            showToast("Đã thêm lớp mới thành công!");
        } catch (err) {
            showToast("Thêm lớp thất bại", "error");
        }
    };

    const handleDeleteClassroom = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lớp này? Sinh viên thuộc lớp này sẽ bị trống lớp.")) {
            try {
                await classroomService.deleteClassroom(id);
                fetchClassrooms();
                showToast("Đã xóa lớp!");
            } catch (err) {
                showToast("Xóa lớp thất bại", "error");
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
            <h3>Quản lý Lớp Sinh hoạt</h3>
            
            <form className="admin-form" onSubmit={handleAddClassroom}>
                <div className="form-group">
                    <label>Tên lớp mới</label>
                    <input 
                        type="text" 
                        placeholder="VD: CNTT01, K65A..." 
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group" style={{ flex: 'none' }}>
                    <label>&nbsp;</label>
                    <div className="form-actions">
                        <button type="submit" className="add-btn">
                            + Thêm lớp mới
                        </button>
                    </div>
                </div>
            </form>

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <div className="table-responsive">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên lớp sinh hoạt</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classrooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((cls) => (
                                <tr key={cls.id}>
                                    <td>{cls.id}</td>
                                    <td className="bold">{cls.className}</td>
                                    <td>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteClassroom(cls.id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {classrooms.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="no-data">Chưa có lớp nào được tạo.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination 
                        itemsPerPage={itemsPerPage} 
                        totalItems={classrooms.length} 
                        paginate={setCurrentPage} 
                        currentPage={currentPage} 
                    />
                </div>
            )}
        </div>
    );
};

export default ClassroomManagement;
