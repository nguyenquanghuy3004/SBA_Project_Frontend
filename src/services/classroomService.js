import { request } from "./apiConfig";

const getAllClassrooms = async () => {
    return await request("/classroom");
};

const createClassroom = async (classroomData) => {
    return await request("/classroom/create", {
        method: "POST",
        body: JSON.stringify(classroomData),
    });
};

const deleteClassroom = async (id) => {
    return await request(`/classroom/delete/${id}`, {
        method: "DELETE",
    });
};

export default {
    getAllClassrooms,
    createClassroom,
    deleteClassroom,
};
