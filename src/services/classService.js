import { request } from "./apiConfig";

const getAllClasses = () => request("/classes");
const getClassesBySemester = (semesterId) => request(`/classes/semester/${semesterId}`);
const createClass = (subjectClass) => request("/classes", {
    method: "POST",
    body: JSON.stringify(subjectClass)
});
const updateClass = (id, subjectClass) => request(`/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(subjectClass)
});
const getClassesByTeacher = (userId) => request(`/classes/teacher/${userId}`);
const deleteClass = (id) => request(`/classes/${id}`, {
    method: "DELETE"
});
const lockClass = (id, lock) => request(`/classes/${id}/lock?lock=${lock}`, {
    method: "PUT"
});

export default {
    getAllClasses,
    getClassesBySemester,
    getClassesByTeacher,
    createClass,
    updateClass,
    deleteClass,
    lockClass
};
