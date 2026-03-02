import React, { useState, useEffect } from "react";
import studentService from "../services/studentService";
import teacherService from "../services/teacherService";
import courseService from "../services/courseService";
import classService from "../services/classService";

const AdminReports = () => {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        courses: 0,
        classes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [students, teachers, courses, classes] = await Promise.all([
                    studentService.getAllStudents(),
                    teacherService.getAllTeachers(),
                    courseService.getAllCourses(),
                    classService.getAllClasses()
                ]);
                setStats({
                    students: students.length,
                    teachers: teachers.length,
                    courses: courses.length,
                    classes: classes.length
                });
            } catch (err) {
                console.error("Failed to fetch statistics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-state">Đang tính toán thống kê...</div>;

    return (
        <div className="reports-section">
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <h3>{stats.students}</h3>
                    <p>Tổng sinh viên</p>
                </div>
                <div className="stats-card">
                    <div className="card-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <h3>{stats.teachers}</h3>
                    <p>Tổng giáo viên</p>
                </div>
                <div className="stats-card">
                    <div className="card-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <h3>{stats.courses}</h3>
                    <p>Tổng môn học</p>
                </div>
                <div className="stats-card">
                    <div className="card-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                        </svg>
                    </div>
                    <h3>{stats.classes}</h3>
                    <p>Lớp đang hoạt động</p>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Tổng quan hệ thống</h3>
                <p>Tất cả các mô-đun đang hoạt động. Đồng bộ cơ sở dữ liệu đang chạy.</p>
                <div className="activity-status">
                    <span className="status-indicator online"></span> Trực tuyến
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
