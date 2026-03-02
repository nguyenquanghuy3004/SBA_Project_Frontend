import React, { useState } from "react";
import StudentList from "./StudentList";
import CourseManagement from "./CourseManagement";
import ClassManagement from "./ClassManagement";
import SemesterManagement from "./SemesterManagement";
import TeacherManagement from "./TeacherManagement";
import AdminReports from "./AdminReports";
import AdminNotification from "./AdminNotification";

/* ── Inline SVG icon set ── */
const Icons = {
    Students: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Teachers: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
    Courses: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 4 0 0 1 3-3h7z" />
        </svg>
    ),
    Semesters: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    Classes: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    ),
    Reports: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <path d="M2 20h20" />
        </svg>
    ),
    Notifications: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
};

const AdminDashboard = ({ user }) => {
    const [activeSection, setActiveSection] = useState("students");

    const sidebarItems = [
        { key: "students", label: "Sinh viên", Icon: Icons.Students },
        { key: "teachers", label: "Giáo viên", Icon: Icons.Teachers },
        { key: "courses", label: "Môn học", Icon: Icons.Courses },
        { key: "semesters", label: "Học kỳ", Icon: Icons.Semesters },
        { key: "classes", label: "Lớp học", Icon: Icons.Classes },
        { key: "reports", label: "Báo cáo", Icon: Icons.Reports },
        { key: "notifications", label: "Thông báo GV", Icon: Icons.Notifications },
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                {sidebarItems.map(({ key, label, Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`admin-sidebar-btn ${activeSection === key ? "active" : ""}`}
                    >
                        <span className="sidebar-icon"><Icon /></span>
                        <span className="sidebar-label">{label}</span>
                    </button>
                ))}
            </div>

            <div className="admin-content">
                {activeSection === "students" && <StudentList user={user} />}
                {activeSection === "teachers" && <TeacherManagement />}
                {activeSection === "courses" && <CourseManagement />}
                {activeSection === "semesters" && <SemesterManagement />}
                {activeSection === "classes" && <ClassManagement />}
                {activeSection === "reports" && <AdminReports />}
                {activeSection === "notifications" && <AdminNotification />}
            </div>
        </div>
    );
};

export default AdminDashboard;
