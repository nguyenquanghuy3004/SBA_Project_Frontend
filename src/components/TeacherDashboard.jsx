import React, { useState, useEffect } from "react";
import classService from "../services/classService";
import enrollmentService from "../services/enrollmentService";
import notificationService from "../services/notificationService";
import "./TeacherDashboard.css";

const TeacherDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [myClasses, setMyClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifForm, setNotifForm] = useState({ title: "", message: "" });
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchInitialData();
    }, [user.id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [classes, notifs] = await Promise.all([
                classService.getClassesByTeacher(user.id),
                notificationService.getMyNotifications()
            ]);
            setMyClasses(classes);
            setNotifications(notifs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClass = async (cls) => {
        setSelectedClass(cls);
        setLoading(true);
        try {
            const data = await enrollmentService.getClassList(cls.id);
            setStudents(data);
            setActiveTab("grades");
        } catch (err) {
            console.error("Lỗi tải DS sinh viên:", err);
            showToast("Không thể tải danh sách sinh viên lớp này.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (enrollmentId, field, value) => {
        setStudents(prev => prev.map(s =>
            s.id === enrollmentId ? { ...s, [field]: parseFloat(value) || 0 } : s
        ));
    };

    const saveGrades = async (enrollmentId) => {
        const student = students.find(s => s.id === enrollmentId);
        try {
            await enrollmentService.updateGrades(enrollmentId, {
                attendance: student.attendanceScore,
                midterm: student.midtermScore,
                finalScore: student.finalScore
            });
            showToast("✅ Đã cập nhật điểm thành công!");
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    };

    const handleLockClass = async () => {
        if (!window.confirm("Sau khi khóa điểm bạn sẽ không thể chỉnh sửa. Bạn có chắc chắn?")) return;
        try {
            await classService.lockClass(selectedClass.id, true);
            setSelectedClass({ ...selectedClass, locked: true });
            showToast("✅ Đã khóa điểm lớp học thành công!");
            fetchInitialData();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleSendNotif = async (e) => {
        e.preventDefault();
        try {
            await notificationService.notifyClass(selectedClass.id, notifForm.title, notifForm.message);
            showToast("✅ Đã gửi thông báo tới cả lớp!");
            setNotifForm({ title: "", message: "" });
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const Icons = {
        Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        School: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-10-5L2 10l10 5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
        BookOpen: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
        User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
        Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
        Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
        Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
        MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
        Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    };

    return (
        <div className="student-dashboard teacher-dashboard">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-msg">{toast.msg}</span>
                    <button className="toast-close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}
            <div className="tab-navigation">
                <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
                    <Icons.Home /> Tổng quan
                </button>
                <button className={activeTab === "classes" ? "active" : ""} onClick={() => { setActiveTab("classes"); setSelectedClass(null); }}>
                    <Icons.School /> Danh sách lớp
                </button>
                {selectedClass && (
                    <>
                        <button className={activeTab === "grades" ? "active" : ""} onClick={() => setActiveTab("grades")}>
                            <Icons.Edit /> Nhập điểm: {selectedClass.course.courseCode}
                        </button>
                        <button className={activeTab === "notif" ? "active" : ""} onClick={() => setActiveTab("notif")}>
                            <Icons.Send /> Gửi thông báo
                        </button>
                    </>
                )}
            </div>

            <div className="dashboard-content">
                {/* 1. OVERVIEW */}
                {activeTab === "overview" && (
                    <div className="overview-section fade-in">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-icon"><Icons.User /></span>
                                <div className="stat-info">
                                    <p>Giảng viên</p>
                                    <h3>{user.username}</h3>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon"><Icons.BookOpen /></span>
                                <div className="stat-info">
                                    <p>Số lớp đang dạy</p>
                                    <h3>{myClasses.length}</h3>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon"><Icons.Bell /></span>
                                <div className="stat-info">
                                    <p>Thông báo mới</p>
                                    <h3>{notifications.filter(n => !n.read).length}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-main-grid">
                            <div className="notifications-list">
                                <h3><Icons.Bell /> Thông báo từ Admin</h3>
                                <div className="notif-container">
                                    {notifications.slice(0, 5).map(n => (
                                        <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                                            <div className="notif-dot"></div>
                                            <div className="notif-body">
                                                <h4>{n.title}</h4>
                                                <p>{n.message}</p>
                                                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {notifications.length === 0 && <p className="empty-msg">Không có thông báo nào.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CLASSES */}
                {activeTab === "classes" && (
                    <div className="registration-section fade-in">
                        <div className="section-header">
                            <h3>📋 Danh sách các lớp phụ trách</h3>
                        </div>
                        <div className="class-grid">
                            {myClasses.map(cls => (
                                <div className="class-card teacher-class-card" key={cls.id}>
                                    <div className="class-tag">{cls.course.courseCode}</div>
                                    <h4>{cls.course.name}</h4>
                                    <div className="class-details">
                                        <p>📍 <strong>Phòng:</strong> {cls.room}</p>
                                        <p>📅 <strong>Lịch:</strong> {cls.schedule}</p>
                                        <p>🎓 <strong>Học kỳ:</strong> {cls.semester?.name}</p>
                                        <p>🔒 <strong>Trạng thái:</strong> {cls.locked ? <span style={{ color: '#ef4444' }}>Đã khóa điểm</span> : <span style={{ color: '#10b981' }}>Đang mở</span>}</p>
                                    </div>
                                    <button className="enroll-btn" onClick={() => handleViewClass(cls)}>Quản lý lớp</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. GRADES */}
                {activeTab === "grades" && selectedClass && (
                    <div className="grades-section fade-in">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>📊 Nhập điểm: {selectedClass.course.name}</h3>
                            {!selectedClass.locked && (
                                <button className="delete-btn" style={{ background: '#ef4444', color: 'white' }} onClick={handleLockClass}>
                                    🔒 Khóa & Nộp điểm
                                </button>
                            )}
                        </div>
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>MSSV</th>
                                    <th>Họ tên</th>
                                    <th>Chuyên cần (10%)</th>
                                    <th>Giữa kỳ (30%)</th>
                                    <th>Cuối kỳ (60%)</th>
                                    <th>Tổng kết</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(en => (
                                    <tr key={en.id}>
                                        <td className="bold">{en.student.studentId}</td>
                                        <td>{en.student.studentName}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="grade-input"
                                                disabled={selectedClass.locked}
                                                value={en.attendanceScore ?? ""}
                                                onChange={(e) => handleGradeChange(en.id, "attendanceScore", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="grade-input"
                                                disabled={selectedClass.locked}
                                                value={en.midtermScore ?? ""}
                                                onChange={(e) => handleGradeChange(en.id, "midtermScore", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="grade-input"
                                                disabled={selectedClass.locked}
                                                value={en.finalScore ?? ""}
                                                onChange={(e) => handleGradeChange(en.id, "finalScore", e.target.value)}
                                            />
                                        </td>
                                        <td className="bold">{(en.attendanceScore * 0.1 + en.midtermScore * 0.3 + en.finalScore * 0.6).toFixed(2)}</td>
                                        <td>
                                            {!selectedClass.locked && (
                                                <button className="save-btn" onClick={() => saveGrades(en.id)}>Lưu</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. NOTIFICATIONS */}
                {/* 4. NOTIFICATIONS */}
                {activeTab === "notif" && selectedClass && (
                    <div className="notif-compose-section fade-in">
                        <div className="section-header">
                            <h3><Icons.Send /> Gửi thông báo tới lớp: {selectedClass.course.name}</h3>
                        </div>

                        <div className="compose-container">
                            <form className="modern-compose-form" onSubmit={handleSendNotif}>
                                <div className="compose-fields">
                                    <div className="form-group-modern">
                                        <label>Tiêu đề thông báo</label>
                                        <input
                                            type="text"
                                            placeholder="Tiêu đề thông điệp (VD: Thay đổi lịch thi, Bài tập về nhà...)"
                                            value={notifForm.title}
                                            onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Nội dung chi tiết</label>
                                        <textarea
                                            placeholder="Nhập nội dung thông báo cụ thể tại đây..."
                                            value={notifForm.message}
                                            onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="compose-footer">
                                    <div className="compose-tips">
                                        <p>💡 Thông báo sẽ được gửi tới tất cả sinh viên trong lớp học này ngay lập tức.</p>
                                    </div>
                                    <button type="submit" className="send-notif-btn-modern">
                                        <Icons.Send /> Gửi thông báo ngay
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
