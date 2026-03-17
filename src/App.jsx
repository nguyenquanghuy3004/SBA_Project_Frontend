import React, { useState, useEffect } from "react";
import authService from "./services/authService";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ProfileModal from "./components/ProfileModal";
import LandingPage from "./components/LandingPage";
import notificationService from "./services/notificationService";
import "./App.css";

function App() {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [isLogin, setIsLogin] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // State để chuyển đổi giữa Trang chủ và Form Đăng Nhập
    const [publicView, setPublicView] = useState("home");
    const [notifications, setNotifications] = useState([]);
    const [showNotifMenu, setShowNotifMenu] = useState(false);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setIsDropdownOpen(false);
    };

    const toggleAuth = () => {
        setIsLogin(!isLogin);
    };

    useEffect(() => {
        if (user && !user.roles.includes("ADMIN")) {
            fetchNotifications();
            // Polling notifications every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data || []);
        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Lỗi cập nhật thông báo:", err);
        }
    };

    const renderDashboard = () => {
        if (!user) return null;

        if (user.roles.includes("ADMIN")) return <AdminDashboard user={user} />;
        if (user.roles.includes("TEACHER")) return <TeacherDashboard user={user} notifications={notifications} setNotifications={setNotifications} fetchNotifications={fetchNotifications} />;
        if (user.roles.includes("STUDENT")) return <StudentDashboard user={user} notifications={notifications} setNotifications={setNotifications} fetchNotifications={fetchNotifications} />;
        return <StudentDashboard user={user} />;
    };


    if (!user) {
        if (publicView === "home") {
            return <LandingPage onNavigate={(action) => { 
                if (action === "login") {
                    setIsLogin(true);
                    setPublicView("auth");
                } else if (action === "register") {
                    setIsLogin(false);
                    setPublicView("auth");
                }
            }} />;
        }

        return (
            <div className="auth-page">
                <button 
                    className="back-home-btn"
                    onClick={() => setPublicView("home")} 
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Quay lại Trang chủ
                </button>
                {isLogin ? (
                    <Login onLoginSuccess={handleLoginSuccess} toggleAuth={toggleAuth} />
                ) : (
                    <Register onRegisterSuccess={() => setIsLogin(true)} toggleAuth={toggleAuth} />
                )}
            </div>
        );
    }

    const openProfile = (edit) => {
        setIsEditMode(edit);
        setIsProfileOpen(true);
        setIsDropdownOpen(false);
    }

    const Icons = {
        User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
        Bell: ({ color = "currentColor" }) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
        ),
        BellDot: () => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <circle cx="18" cy="8" r="3" fill="#ef4444" />
            </svg>
        )
    };

    return (
        <div className="dashboard">
            <nav>
                <div className="logo">
                    <h2 className="logo-text">EduFlow<span className="logo-dot">.</span></h2>
                </div>
                <div className="nav-actions">
                    {user && !user.roles.includes("ADMIN") && (
                        <div 
                            className="notif-bell-container"
                            onMouseEnter={() => setShowNotifMenu(true)}
                            onMouseLeave={() => setShowNotifMenu(false)}
                        >
                            <div className="bell-trigger">
                                {notifications.filter(n => !n.read).length > 0 ? <Icons.BellDot /> : <Icons.Bell />}
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="notif-count">{notifications.filter(n => !n.read).length}</span>
                                )}
                            </div>

                            {showNotifMenu && (
                                <div className="notif-dropdown">
                                    <div className="notif-dropdown-header">
                                        <h3>Thông báo mới</h3>
                                        <span onClick={fetchNotifications} title="Làm mới">↺</span>
                                    </div>
                                    <div className="notif-dropdown-body">
                                        {notifications.length > 0 ? (
                                            notifications.slice(0, 5).map(n => (
                                                <div 
                                                    key={n.id} 
                                                    className={`notif-dropdown-item ${n.read ? 'read' : 'unread'}`}
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                >
                                                    <div className="notif-item-header">
                                                        <strong>{n.title}</strong>
                                                        <span className="notif-time-mini">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p>{n.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="notif-empty">Không có thông báo nào</p>
                                        )}
                                    </div>
                                    <div className="notif-dropdown-footer">
                                        <em>Tự động cập nhật sau 1 phút</em>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className="user-dropdown-container"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <div
                            className="user-trigger"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="user-badge">{user.roles[0]}</span>
                            <span className="username">
                                {(() => {
                                    const hour = new Date().getHours();
                                    if (hour >= 5 && hour < 12) return "Chào buổi sáng";
                                    if (hour >= 12 && hour < 18) return "Chào buổi chiều";
                                    if (hour >= 18 && hour < 24) return "Chào buổi tối";
                                    return "Chào buổi đêm";
                                })()}, <strong>{user.username}</strong>
                            </span>
                            <div className="avatar-circle">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <strong>{user.username}</strong>
                                    <span>{user.email}</span>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button onClick={() => openProfile(false)}>
                                    <Icons.User /> Thông tin cá nhân
                                </button>
                                <button onClick={() => openProfile(true)}>
                                    <Icons.Edit /> Chỉnh sửa hồ sơ
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="logout-item" onClick={handleLogout}>
                                    <Icons.LogOut /> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                {renderDashboard()}
            </main>

            <ProfileModal
                isOpen={isProfileOpen}
                isEditMode={isEditMode}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />
        </div>
    );
}

export default App;
