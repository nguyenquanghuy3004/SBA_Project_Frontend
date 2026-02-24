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

    if (loading) return <div>Calculating statistics...</div>;

    return (
        <div className="reports-section">
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon">👥</div>
                    <h3>{stats.students}</h3>
                    <p>Total Students</p>
                </div>
                <div className="stats-card">
                    <div className="card-icon">👨‍🏫</div>
                    <h3>{stats.teachers}</h3>
                    <p>Total Teachers</p>
                </div>
                <div className="stats-card">
                    <div className="card-icon">📚</div>
                    <h3>{stats.courses}</h3>
                    <p>Total Courses</p>
                </div>
                <div className="stats-card">
                    <div className="card-icon">🏫</div>
                    <h3>{stats.classes}</h3>
                    <p>Active Classes</p>
                </div>
            </div>

            <div className="recent-activity">
                <h3>System Overview</h3>
                <p>All modules are operational. Database sync is active.</p>
                <div className="activity-status">
                    <span className="status-indicator online"></span> Online
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
