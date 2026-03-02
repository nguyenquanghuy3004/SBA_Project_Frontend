import React, { useState, useEffect } from "react";
import enrollmentService from "../services/enrollmentService";
import classService from "../services/classService";
import studentService from "../services/studentService";
import notificationService from "../services/notificationService";

const StudentDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };
    const [showMajorModal, setShowMajorModal] = useState(false);
    const [selectedMajor, setSelectedMajor] = useState("");

    useEffect(() => {
        fetchData();
    }, [user.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let profileData = null;
            try {
                profileData = await studentService.getMyProfile();
                setProfile(profileData);
            } catch (pErr) {
                console.warn("Chưa có hồ sơ sinh viên:", pErr.message);
            }

            const [classes, notifs] = await Promise.all([
                classService.getAllClasses().catch(() => []),
                notificationService.getMyNotifications().catch(() => [])
            ]);

            setAvailableClasses(classes);
            setNotifications(notifs);

            if (profileData) {
                try {
                    const enrollments = await enrollmentService.getStudentEnrollments(profileData.studentId);
                    setMyEnrollments(enrollments);

                    // Tự động mở modal chọn chuyên ngành nếu là sinh viên mới (chưa có ngành)
                    if (profileData.major === "None" || !profileData.major) {
                        setShowMajorModal(true);
                    }
                } catch (eErr) {
                    console.error("Lỗi lấy danh sách đăng ký:", eErr);
                }
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu Dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMajor = async () => {
        if (!selectedMajor) return showToast("Vui lòng chọn chuyên ngành!", "error");
        try {
            const updatedProfile = { ...profile, major: selectedMajor };
            await studentService.updateStudent(profile.studentId, updatedProfile);

            // Cập nhật state cục bộ ngay lập tức để giao diện phản hồi nhanh
            setProfile(updatedProfile);
            setShowMajorModal(false);

            showToast("✨ Đã cập nhật chuyên ngành thành công!");
            fetchData(); // Đồng bộ lại với server
        } catch (err) {
            showToast("Lỗi: " + (err.message || "Không thể cập nhật"), "error");
        }
    };

    const handleEnroll = async (classId) => {
        if (!profile?.major || profile.major === "None") {
            return showToast("Vui lòng cập nhật chuyên ngành trước khi đăng ký môn học!", "error");
        }
        try {
            await enrollmentService.enroll(profile.studentId, classId);
            showToast("✅ Đăng ký môn học thành công!");
            fetchData();
        } catch (err) {
            showToast(err.message || "Lỗi khi đăng ký", "error");
        }
    };

    const handleCancel = async (classId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký môn học này?")) return;
        try {
            await enrollmentService.cancelEnrollment(profile.studentId, classId);
            showToast("🗑️ Đã hủy đơn đăng ký.");
            fetchData();
        } catch (err) {
            showToast(err.message || "Lỗi khi hủy đăng ký", "error");
        }
    };

    const markRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    // --- PHẦN TÍNH TOÁN DỄ HIỂU ---
    // --- PHẦN TÍNH TOÁN (ĐÃ SỬA LỖI VIẾT HOA/THƯỜNG HỌC KỲ) ---

    // 1. Tìm Học kỳ mới nhất (Hệ thống lấy HK có ID lớn nhất làm HK hiện tại)
    let maxId = 0;
    let tenHkSearch = "";
    for (let i = 0; i < myEnrollments.length; i++) {
        const hk = myEnrollments[i].subjectClass.semester;
        if (hk && Number(hk.id) > maxId) {
            maxId = Number(hk.id);
            tenHkSearch = hk.name.trim().toLowerCase(); // Lấy tên viết thường để so sánh
        }
    }
    const tenHKHienTai = (myEnrollments.find(e => e.subjectClass.semester.id === maxId)?.subjectClass.semester.name) || "Chưa rõ";

    // 2. Tính GPA
    let monKyNay = [];
    let soMonCoDiemKyNay = 0;
    let tongDiemNhanTinChiKyNay = 0;
    let tongTinChiKyNay = 0;
    let tongDiemTichLuy = 0;
    let tongTinChiTichLuy = 0;

    for (let i = 0; i < myEnrollments.length; i++) {
        const en = myEnrollments[i];
        const hocky = en.subjectClass.semester;

        // Tích lũy (Tất cả môn có điểm)
        if (en.totalScore != null) {
            const tc = en.subjectClass.course.creadits || 0;
            tongDiemTichLuy += (en.totalScore * tc);
            tongTinChiTichLuy += tc;
        }

        // Học kỳ này: Match theo TÊN (không phân biệt hoa thường) để sửa lỗi dữ liệu của bạn
        if (hocky && hocky.name.trim().toLowerCase() === tenHkSearch) {
            monKyNay.push(en);
            if (en.totalScore != null) {
                soMonCoDiemKyNay++;
                const tc = en.subjectClass.course.creadits || 0;
                tongDiemNhanTinChiKyNay += (en.totalScore * tc);
                tongTinChiKyNay += tc;
            }
        }
    }

    const totalCredits = tongTinChiTichLuy;
    const cgpa = tongTinChiTichLuy > 0 ? (tongDiemTichLuy / tongTinChiTichLuy) : 0;
    const allTermEnrollments = monKyNay;
    const hasEnoughSubjects = (allTermEnrollments.length >= 5);

    let termGpaDisplay = "0.00";
    if (allTermEnrollments.length < 5) {
        termGpaDisplay = `Thiếu môn (${allTermEnrollments.length}/5)`;
    } else if (soMonCoDiemKyNay < allTermEnrollments.length) {
        termGpaDisplay = "Đang chấm...";
    } else {
        const giaTriGPA = tongTinChiKyNay > 0 ? (tongDiemNhanTinChiKyNay / tongTinChiKyNay) : 0;
        termGpaDisplay = giaTriGPA.toFixed(2);
    }


    const majors = [
        "Kỹ thuật phần mềm",
        "An toàn thông tin",
        "Trí tuệ nhân tạo",
        "Thiết kế đồ họa",
        "Kinh doanh quốc tế",
        "Quản trị khách sạn",
        "Ngôn ngữ Anh",
        "Ngôn ngữ Nhật"
    ];

    const Icons = {
        Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        Book: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
        Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
        Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
        User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Id: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="12" y2="16" /></svg>,
        Award: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
        Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
        School: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-10-5L2 10l10 5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
        Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
        Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    };

    return (
        <div className="student-dashboard">
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
                <button className={activeTab === "register" ? "active" : ""} onClick={() => setActiveTab("register")}>
                    <Icons.Book /> Đăng ký học phần
                </button>
                <button className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}>
                    <Icons.Calendar /> Lịch học
                </button>
                <button className={activeTab === "grades" ? "active" : ""} onClick={() => setActiveTab("grades")}>
                    <Icons.Chart /> Kết quả học tập
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">Đang xử lý dữ liệu...</div>
            ) : (
                <div className="tab-content">
                    {/* 1. OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="overview-section">
                            {/* Chào mừng & Cảnh báo chọn chuyên ngành */}
                            <div className="dashboard-banner">
                                <div className="welcome-msg">
                                    <h2>Chào buổi tối, {profile?.studentName?.split(' ').pop() || "Sinh viên"}! 👋</h2>
                                    <p>Chúc bạn có một kỳ học thật bùng nổ và hiệu quả.</p>
                                </div>
                                {(profile?.major === "None" || !profile?.major) && (
                                    <div className="major-alert-box">
                                        <div className="alert-content">
                                            <span>⚠️</span>
                                            <p>Bạn chưa hoàn tất đăng ký chuyên ngành!</p>
                                        </div>
                                        <button className="setup-btn" onClick={() => setShowMajorModal(true)}>
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="stats-grid-modern">
                                <div className="stat-card-modern p-gradient">
                                    <div className="card-icon"><Icons.User /></div>
                                    <div className="card-info">
                                        <span className="label">Học viên</span>
                                        <span className="value">{profile?.studentName}</span>
                                    </div>
                                </div>
                                <div className="stat-card-modern s-gradient">
                                    <div className="card-icon"><Icons.Book /></div>
                                    <div className="card-info">
                                        <span className="label">Tín chỉ</span>
                                        <span className="value">{totalCredits} TC</span>
                                    </div>
                                </div>
                                <div className="stat-card-modern t-gradient">
                                    <div className="card-icon"><Icons.Chart /></div>
                                    <div className="card-info">
                                        <span className="label">GPA Học kỳ <span className="semester-badge-dashboard">{tenHKHienTai}</span></span>
                                        <span className={`value ${!hasEnoughSubjects ? 'warning-text' : ''}`}>{termGpaDisplay}</span>
                                    </div>
                                </div>
                                <div className="stat-card-modern q-gradient">
                                    <div className="card-icon"><Icons.Award /></div>
                                    <div className="card-info">
                                        <span className="label">GPA Tích lũy</span>
                                        <span className="value highlight-gold">{cgpa.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-content-grid">
                                <div className="main-col">
                                    <div className="section-header">
                                        <h3><Icons.Bell /> Thông báo mới</h3>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span className="badge-new">{notifications.filter(n => !n.read).length} MỚI</span>
                                        )}
                                    </div>
                                    <div className="notifications-modern">
                                        {notifications.slice(0, 5).map(n => (
                                            <div key={n.id} className={`notif-card ${n.read ? "read" : "unread"}`} onClick={() => markRead(n.id)}>
                                                <div className="notif-dot"></div>
                                                <div className="notif-body">
                                                    <h4>{n.title}</h4>
                                                    <p>{n.message}</p>
                                                    <span className="time">{new Date(n.createdAt).toLocaleTimeString('vi-VN')} - {new Date(n.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && <p className="empty-state">Hiện tại không có thông báo mới.</p>}
                                    </div>
                                </div>

                                <div className="side-col">
                                    <div className="section-header">
                                        <h3><Icons.School /> Thông tin trường</h3>
                                    </div>
                                    <div className="info-card-modern">
                                        <div className="info-row-modern">
                                            <span className="label">Ngành học</span>
                                            <span className="value highlight">{profile?.major === "None" ? "Chưa chọn ✨" : profile?.major}</span>
                                        </div>
                                        <div className="info-row-modern">
                                            <span className="label">Lớp sinh hoạt</span>
                                            <span className="value">{profile?.studentClass || "Chưa xếp lớp"}</span>
                                        </div>
                                        <div className="info-row-modern">
                                            <span className="label">Hệ đào tạo</span>
                                            <span className="value">Chính quy</span>
                                        </div>
                                        <div className="info-row-modern">
                                            <span className="label">Trạng thái</span>
                                            <span className="status-pill active">Đang học</span>
                                        </div>

                                        <div className="academic-progress-modern">
                                            <div className="progress-text">
                                                <span>Tiến độ học tập</span>
                                                <span>{Math.min(100, (totalCredits / 120 * 100).toFixed(0))}%</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar-fill" style={{ width: `${Math.min(100, totalCredits / 120 * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal chọn chuyên ngành */}
                            {showMajorModal && (
                                <div className="modern-modal-overlay">
                                    <div className="modern-modal">
                                        <div className="modal-header">
                                            <h3>Cập nhật chuyên ngành</h3>
                                            <button className="close-btn" onClick={() => setShowMajorModal(false)}>×</button>
                                        </div>
                                        <div className="modal-body">
                                            <p>Vui lòng lựa chọn chuyên ngành bạn muốn theo học. <b>Lưu ý:</b> Bạn chỉ có thể tự cập nhật một lần duy nhất.</p>
                                            <div className="major-selector">
                                                {majors.map(m => (
                                                    <div
                                                        key={m}
                                                        className={`major-option ${selectedMajor === m ? "selected" : ""}`}
                                                        onClick={() => setSelectedMajor(m)}
                                                    >
                                                        {m}
                                                        {selectedMajor === m && <span className="check">✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="cancel-btn" onClick={() => setShowMajorModal(false)}>Hủy bỏ</button>
                                            <button className="confirm-btn" onClick={handleUpdateMajor}>Xác nhận & Hoàn tất</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. REGISTRATION */}
                    {activeTab === "register" && (
                        <div className="registration-section">
                            <div className="section-header">
                                <div>
                                    <h3><Icons.Book /> Danh sách lớp học đang mở</h3>
                                    <p className={`reg-status ${allTermEnrollments.length < 5 ? 'incomplete' : 'complete'}`}>
                                        Tiến độ đăng ký: <strong>{allTermEnrollments.length}/5 môn</strong>
                                        {allTermEnrollments.length < 5 && <span className="reg-hint"> (Cần đăng ký thêm {5 - allTermEnrollments.length} môn để đủ điều kiện tính GPA)</span>}
                                    </p>
                                </div>
                                <div className="semester-badge-modern">
                                    <span className="icon"><Icons.Clock /></span>
                                    <span>Học kỳ: <strong>Semester 2 - 2024</strong></span>
                                </div>
                            </div>
                            <div className="class-grid">
                                {availableClasses.map(cls => {
                                    // Kiểm tra xem sinh viên đã đăng ký MÔN NÀY trong HỌC KỲ NÀY chưa
                                    const isEnrolled = myEnrollments.some(en =>
                                        en.subjectClass.course.id === cls.course.id &&
                                        en.subjectClass.semester.id === cls.semester.id
                                    );
                                    return (
                                        <div className="class-card-modern" key={cls.id}>
                                            <div className="card-top">
                                                <div className="class-tag">{cls.course.courseCode}</div>
                                                <div className="enroll-status">
                                                    {isEnrolled && <span className="status-enrolled">✓ Đã đăng ký</span>}
                                                </div>
                                            </div>
                                            <h4>{cls.course.name}</h4>
                                            <div className="class-details-modern">
                                                <p><span><Icons.User /></span> <strong>Giảng viên:</strong> {cls.teacher?.fullName || "Chưa phân công"}</p>
                                                <p><span><Icons.Calendar /></span> <strong>Lịch học:</strong> {cls.schedule}</p>
                                                <p><span><Icons.MapPin /></span> <strong>Phòng:</strong> {cls.room}</p>
                                                <p><span><Icons.Users /></span> <strong>Sĩ số:</strong> {cls.maxStudents || 40}</p>
                                            </div>
                                            <div className="card-actions">
                                                {isEnrolled ? (
                                                    <button onClick={() => handleCancel(cls.id)} className="cancel-enroll-btn-modern">
                                                        <span>✕</span> Hủy đăng ký
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleEnroll(cls.id)} className="enroll-btn-modern">
                                                        <span>➕</span> Đăng ký môn học
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {availableClasses.length === 0 && (
                                    <div className="no-data-msg">
                                        <p>Hiện tại chưa có lớp học nào được mở.</p>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Hệ thống sẽ hiển thị các lớp học sau khi Admin tạo Lớp học (Classes) gán kèm theo Học kỳ và Giảng viên.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. SCHEDULE */}
                    {activeTab === "schedule" && (
                        <div className="schedule-section">
                            <h3>📅 Thời khóa biểu cá nhân</h3>
                            <table className="student-table">
                                <thead>
                                    <tr>
                                        <th>Mã môn</th>
                                        <th>Tên môn học</th>
                                        <th>Lịch học</th>
                                        <th>Phòng</th>
                                        <th>Giảng viên</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myEnrollments.map(en => (
                                        <tr key={en.id}>
                                            <td className="bold">{en.subjectClass.course.courseCode}</td>
                                            <td>{en.subjectClass.course.name}</td>
                                            <td>{en.subjectClass.schedule}</td>
                                            <td>{en.subjectClass.room}</td>
                                            <td>{en.subjectClass.teacher?.fullName}</td>
                                        </tr>
                                    ))}
                                    {myEnrollments.length === 0 && (
                                        <tr><td colSpan="5">Bạn chưa đăng ký môn học nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 4. GRADES */}
                    {activeTab === "grades" && (
                        <div className="grades-section">
                            <div className="section-header">
                                <h3>📊 Bảng điểm chi tiết</h3>
                            </div>
                            <table className="student-table">
                                <thead>
                                    <tr>
                                        <th>Môn học</th>
                                        <th>Tín chỉ</th>
                                        <th>Chuyên cần (10%)</th>
                                        <th>Giữa kỳ (30%)</th>
                                        <th>Cuối kỳ (60%)</th>
                                        <th>Tổng kết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...myEnrollments].sort((a, b) => b.subjectClass.semester.id - a.subjectClass.semester.id).map(en => (
                                        <tr key={en.id}>
                                            <td>
                                                <div className="subject-name-cell">
                                                    <strong>{en.subjectClass.course.name}</strong>
                                                    <div className="semester-pill">{en.subjectClass.semester.name}</div>
                                                </div>
                                            </td>
                                            <td>{en.subjectClass.course.creadits}</td>
                                            <td>{en.attendanceScore || "-"}</td>
                                            <td>{en.midtermScore || "-"}</td>
                                            <td>{en.finalScore || "-"}</td>
                                            <td className="bold">{en.totalScore?.toFixed(2) || "-"}</td>
                                        </tr>
                                    ))}
                                    {myEnrollments.length === 0 && (
                                        <tr><td colSpan="6">Chưa có dữ liệu điểm.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
