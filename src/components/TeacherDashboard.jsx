import React, { useState, useEffect } from "react";
import classService from "../services/classService";
import enrollmentService from "../services/enrollmentService";
import notificationService from "../services/notificationService";
import teacherService from "../services/teacherService";
import Pagination from "./Pagination";
import "./TeacherDashboard.css";

const TeacherDashboard = ({ user, notifications = [], setNotifications, fetchNotifications }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [myClasses, setMyClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
   
    const [notifForm, setNotifForm] = useState({ title: "", message: "" });
    const [toast, setToast] = useState(null);

    const [classPage, setClassPage] = useState(1);
    const [gradePage, setGradePage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setClassPage(1);
        setGradePage(1);
    }, [activeTab, selectedClass]);

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
            const [classes, profileData] = await Promise.all([
                classService.getClassesByTeacher(user.id),
                teacherService.getMyProfile()
            ]);
            setMyClasses(classes);
            setProfile(profileData);
          
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClass = async (cls) => {
        setSelectedClass(cls);
        setStudents([]);
        setActiveTab("grades");
        setLoading(true);
        try {
            const data = await enrollmentService.getClassList(cls.id);
            setStudents(data);
        } catch (err) {
            console.error("Lỗi tải DS sinh viên:", err);
           
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (enrollmentId, field, value) => {
        if (value === "") {
            setStudents(prev => prev.map(s =>
                s.id === enrollmentId ? { ...s, [field]: "" } : s
            ));
            return;
        }

        const numValue = parseFloat(value);
     
        if (isNaN(numValue) || numValue <= 0 || numValue >= 10) {
            showToast("Điểm phải là số lớn hơn 0 và nhỏ hơn 10!", "error");
            return;
        }

        setStudents(prev => prev.map(s =>
            s.id === enrollmentId ? { ...s, [field]: numValue } : s
        ));
    };

    const saveGrades = async (enrollmentId) => {
        const student = students.find(s => s.id === enrollmentId);
//Phải lớn hơn 0 và nhỏ hơn 10
        if (
            student.attendanceScore <= 0 || student.attendanceScore >= 10 ||
            student.midtermScore <= 0 || student.midtermScore >= 10 ||
            student.finalScore <= 0 || student.finalScore >= 10
        ) {
            showToast("Vui lòng nhập điểm hợp lệ (phải > 0 và < 10)!", "error");
            return;
        }
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
        Unlock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>,
        Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
        MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
        Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
        ClipboardList: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>,
        GraduationCap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
        Id: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="12" y2="16" /></svg>
    };

    const indexOfLastClass = classPage * itemsPerPage;
    const indexOfFirstClass = indexOfLastClass - itemsPerPage;
    const currentClasses = myClasses.slice(indexOfFirstClass, indexOfLastClass);

    const indexOfLastGrade = gradePage * itemsPerPage;
    const indexOfFirstGrade = indexOfLastGrade - itemsPerPage;
    const currentGrades = students.slice(indexOfFirstGrade, indexOfLastGrade);

  
    const hour = new Date().getHours();
    const greeting = hour >= 5 && hour < 12 ? "Chào buổi sáng" :
        hour >= 12 && hour < 18 ? "Chào buổi chiều" :
            hour >= 18 && hour < 22 ? "Chào buổi tối" : "Chào buổi đêm";

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
                        <div className="dashboard-banner teacher-banner">
                            <div className="welcome-msg">
                                <h2>{greeting}, {profile?.fullName?.split(' ').pop() || user.username}! 👋</h2>
                                <p>Hệ thống quản lý giảng dạy EduFlow - Chúc bạn một ngày làm việc hiệu quả.</p>
                            </div>
                            <div className="current-date-box">
                                <span className="date-icon"><Icons.Calendar /></span>
                                <div className="date-text">
                                    <p>{new Date().toLocaleDateString('vi-VN', { weekday: 'long' })}</p>
                                    <strong>{new Date().toLocaleDateString('vi-VN')}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="stats-grid-modern">
                            <div className="stat-card-modern p-gradient">
                                <div className="card-icon"><Icons.Id /></div>
                                <div className="card-info">
                                    <span className="label">Mã giảng viên</span>
                                    <span className="value">{profile?.teacherCode || "..."}</span>
                                </div>
                            </div>
                            <div className="stat-card-modern s-gradient">
                                <div className="card-icon"><Icons.School /></div>
                                <div className="card-info">
                                    <span className="label">Lớp phụ trách</span>
                                    <span className="value">{myClasses.length} Lớp</span>
                                </div>
                            </div>
                            <div className="stat-card-modern t-gradient">
                                <div className="card-icon"><Icons.Bell /></div>
                                <div className="card-info">
                                    <span className="label">Thông báo mới</span>
                                    <span className="value">{notifications.filter(n => !n.read).length} Tin</span>
                                </div>
                            </div>
                            <div className="stat-card-modern q-gradient">
                                <div className="card-icon"><Icons.Chart /></div>
                                <div className="card-info">
                                    <span className="label">Trạng thái</span>
                                    <span className="value">Sẵn sàng</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-content-grid">
                            <div className="main-col">
                                <div className="schedule-widget">
                                    <div className="section-header">
                                        <h3><Icons.Calendar /> Lịch dạy hôm nay</h3>
                                    </div>
                                    <div className="today-schedule-list">
                                        {myClasses.length > 0 ? (
                                            myClasses.slice(0, 3).map(cls => (
                                                <div key={cls.id} className="schedule-item-mini">
                                                    <div className="time-badge">{cls.schedule.split(' ')[0]}</div>
                                                    <div className="schedule-info">
                                                        <h4>{cls.course.name}</h4>
                                                        <p><Icons.MapPin /> Phòng: {cls.room} | <Icons.Id /> {cls.course.courseCode}</p>
                                                    </div>
                                                    <button className="go-btn" onClick={() => handleViewClass(cls)}>→</button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="empty-msg">Hôm nay bạn không có lịch dạy.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="side-col">
                                <div className="quick-actions-card">
                                    <h3>Thao tác nhanh</h3>
                                    <div className="actions-grid">
                                        <button className="action-item" onClick={() => setActiveTab("classes")}>
                                            <div className="action-icon blue"><Icons.School /></div>
                                            <span>Quản lý lớp</span>
                                        </button>
                                        <button className="action-item" onClick={() => {
                                            if (myClasses.length > 0) handleViewClass(myClasses[0]);
                                            else showToast("Bạn chưa có lớp học nào", "error");
                                        }}>
                                            <div className="action-icon orange"><Icons.Edit /></div>
                                            <span>Nhập điểm</span>
                                        </button>
                                        <button className="action-item" onClick={() => {
                                             if (myClasses.length > 0) {
                                                 handleViewClass(myClasses[0]);
                                                 setActiveTab("notif");
                                             } else showToast("Bạn chưa có lớp học nào", "error");
                                        }}>
                                            <div className="action-icon green"><Icons.Send /></div>
                                            <span>Gửi thông báo</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="teacher-quote-card">
                                    <p>"Giáo dục không phải là việc đổ đầy một cái thùng, mà là thắp sáng một ngọn lửa."</p>
                                    <span>— William Butler Yeats</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {activeTab === "classes" && (
                    <div className="registration-section fade-in">
                        <div className="section-header">
                            <h3><Icons.ClipboardList /> Danh sách các lớp phụ trách</h3>
                        </div>
                        <div className="class-grid">
                            {currentClasses.map(cls => (
                                <div className="class-card teacher-class-card" key={cls.id}>
                                    <h4>{cls.course.courseCode}-- {cls.course.name}</h4>
                                    <div className="class-details">
                                        <p><Icons.MapPin /> <strong>Phòng:</strong> {cls.room}</p>
                                        <p><Icons.Calendar /> <strong>Lịch:</strong> {cls.schedule}</p>
                                        <p><Icons.GraduationCap /> <strong>Học kỳ:</strong> {cls.semester?.name}</p>
                                        <p>{cls.locked ? <Icons.Lock /> : <Icons.Unlock />} <strong>Trạng thái:</strong> {cls.locked ? <span style={{ color: '#ef4444' }}>Đã khóa điểm</span> : <span style={{ color: '#10b981' }}>Đang mở</span>}</p>
                                    </div>
                                    <button className="enroll-btn" onClick={() => handleViewClass(cls)}>Quản lý lớp</button>
                                </div>
                            ))}
                        </div>
                        <Pagination itemsPerPage={itemsPerPage} totalItems={myClasses.length} paginate={setClassPage} currentPage={classPage} />
                    </div>
                )}

               
                {activeTab === "grades" && selectedClass && (
                    <div className="grades-section fade-in">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3><Icons.Chart /> Nhập điểm: {selectedClass.course.name}</h3>
                            {!selectedClass.locked && (
                                <button className="delete-btn" style={{ background: '#ef4444', color: 'white' }} onClick={handleLockClass}>
                                    <Icons.Lock /> Khóa & Nộp điểm
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
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '2rem' }}>📋</span>
                                                <span>Chưa có sinh viên nào đăng ký lớp này.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentGrades.map(en => (
                                        <tr key={en.id}>
                                            <td className="bold">{en.student.mssv}</td>
                                            <td>{en.student.studentName}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="grade-input"
                                                    placeholder="0.0"
                                                    disabled={selectedClass.locked}
                                                    value={en.attendanceScore ?? ""}
                                                    onChange={(e) => handleGradeChange(en.id, "attendanceScore", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="grade-input"
                                                    placeholder="0.0"
                                                    disabled={selectedClass.locked}
                                                    value={en.midtermScore ?? ""}
                                                    onChange={(e) => handleGradeChange(en.id, "midtermScore", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="grade-input"
                                                    placeholder="0.0"
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
                                    ))
                                )}
                            </tbody>
                        </table>
                        <Pagination itemsPerPage={itemsPerPage} totalItems={students.length} paginate={setGradePage} currentPage={gradePage} />
                    </div>
                )}

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
        </div >
    );
};

export default TeacherDashboard;
