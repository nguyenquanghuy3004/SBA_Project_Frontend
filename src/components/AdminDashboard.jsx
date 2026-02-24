import React, { useState } from "react";
import StudentList from "./StudentList";
import CourseManagement from "./CourseManagement";
import ClassManagement from "./ClassManagement";
import SemesterManagement from "./SemesterManagement";
import TeacherManagement from "./TeacherManagement";
import AdminReports from "./AdminReports";

const AdminDashboard = ({ user }) => {
    const [activeSection, setActiveSection] = useState("students");

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <button onClick={() => setActiveSection("students")} className={activeSection === "students" ? "active" : ""}>Students</button>
                <button onClick={() => setActiveSection("teachers")} className={activeSection === "teachers" ? "active" : ""}>Teachers</button>
                <button onClick={() => setActiveSection("courses")} className={activeSection === "courses" ? "active" : ""}>Courses</button>
                <button onClick={() => setActiveSection("semesters")} className={activeSection === "semesters" ? "active" : ""}>Semesters</button>
                <button onClick={() => setActiveSection("classes")} className={activeSection === "classes" ? "active" : ""}>Classes</button>
                <button onClick={() => setActiveSection("reports")} className={activeSection === "reports" ? "active" : ""}>Reports</button>
            </div>

            <div className="admin-content">
                {activeSection === "students" && <StudentList user={user} />}
                {activeSection === "teachers" && <TeacherManagement />}
                {activeSection === "courses" && <CourseManagement />}
                {activeSection === "semesters" && <SemesterManagement />}
                {activeSection === "classes" && <ClassManagement />}
                {activeSection === "reports" && <AdminReports />}
            </div>
        </div>
    );
};

export default AdminDashboard;
