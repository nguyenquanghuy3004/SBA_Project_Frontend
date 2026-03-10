import React, { useState, useEffect } from "react";
import authService from "./services/authService";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ProfileModal from "./components/ProfileModal";
import "./App.css";

function App() {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [isLogin, setIsLogin] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const renderDashboard = () => {
        if (!user) return null;

        if (user.roles.includes("ADMIN")) return <AdminDashboard user={user} />;
        if (user.roles.includes("TEACHER")) return <TeacherDashboard user={user} />;
        if (user.roles.includes("STUDENT")) return <StudentDashboard user={user} />;
        return <StudentDashboard user={user} />;
    };


    if (!user) {
        return (
            <div className="auth-page">
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
        User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
    };

    return (
        <div className="dashboard">
            <nav>
                <div className="logo">
                    <h2 className="logo-text">EduFlow<span className="logo-dot">.</span></h2>
                </div>
                <div className="user-info">
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
                            <span className="username">Welcome, <strong>{user.username}</strong></span>
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
