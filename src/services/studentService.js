import { request } from "./apiConfig";

const getAllStudents = async () => {
    return await request("/student");
};

const getMyProfile = async () => {
    return await request("/student/me");
};

const getStudentById = async (id) => {
    return await request(`/student/${id}`);
};

const createStudent = async (studentData) => {
    return await request("/student/create", {
        method: "POST",
        body: JSON.stringify(studentData),
    });
};

const updateStudent = async (id, studentData) => {
    return await request(`/student/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(studentData),
    });
};

const deleteStudent = async (id) => {
    return await request(`/student/delete/${id}`, {
        method: "DELETE",
    });
};

export default {
    getAllStudents,
    getMyProfile,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};
