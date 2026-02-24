import { request } from "./apiConfig";

const getAllSemesters = () => request("/semesters");

const createSemester = (semester) => request("/semesters", {
    method: "POST",
    body: JSON.stringify(semester)
});

const updateSemester = (id, semester) => request(`/semesters/${id}`, {
    method: "PUT",
    body: JSON.stringify(semester)
});

const deleteSemester = (id) => request(`/semesters/${id}`, {
    method: "DELETE"
});

export default {
    getAllSemesters,
    createSemester,
    updateSemester,
    deleteSemester
};
