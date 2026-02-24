import { request } from "./apiConfig";

const enroll = (studentId, classId) => request("/enrollments/register", {
    method: "POST",
    body: JSON.stringify({ studentId, classId })
});

const cancelEnrollment = (studentId, classId) => request(`/enrollments/cancel?studentId=${studentId}&classId=${classId}`, {
    method: "DELETE"
});

const getStudentEnrollments = (studentId) => request(`/enrollments/student/${studentId}`);

const getClassList = (classId) => request(`/enrollments/class/${classId}`);

const updateGrades = (enrollmentId, grades) => request(`/enrollments/grades/${enrollmentId}`, {
    method: "PUT",
    body: JSON.stringify(grades)
});

export default {
    enroll,
    cancelEnrollment,
    getStudentEnrollments,
    getClassList,
    updateGrades
};
