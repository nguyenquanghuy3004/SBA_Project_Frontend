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
        if (user.roles.includes("ROLE_ADMIN")) return <AdminDashboard user={user} />;
        if (user.roles.includes("ROLE_TEACHER")) return <TeacherDashboard user={user} />;
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

    return (
        <div className="dashboard">
            <nav>
                <div className="logo">
                    <h2 className="logo-text">EduFlow<span className="logo-dot">.</span></h2>
                </div>
                <div className="user-info">
                    <div className="user-dropdown-container">
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
                                    👤 Thông tin cá nhân
                                </button>
                                <button onClick={() => openProfile(true)}>
                                    ✏️ Chỉnh sửa hồ sơ
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="logout-item" onClick={handleLogout}>
                                    🚪 Đăng xuất
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
