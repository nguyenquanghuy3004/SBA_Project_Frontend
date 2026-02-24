import { request } from "./apiConfig";

const getAllCourses = () => request("/courses");
const createCourse = (course) => request("/courses", {
    method: "POST",
    body: JSON.stringify(course)
});
const deleteCourse = (id) => request(`/courses/${id}`, {
    method: "DELETE"
});

const updateCourse = (id, course) => request(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(course)
});

export default {
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse
};
