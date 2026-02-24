import { request } from './apiConfig';

const teacherService = {
    getAllTeachers: () => {
        return request('/teachers');
    },

    createTeacher: (teacherData) => {
        return request('/teachers/create', {
            method: 'POST',
            body: JSON.stringify(teacherData)
        });
    },

    deleteTeacher: (id) => {
        return request(`/teachers/${id}`, {
            method: 'DELETE'
        });
    },

    updateTeacher: (id, teacherData) => {
        return request(`/teachers/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(teacherData)
        });
    },

    getMyProfile: () => {
        return request('/teachers/me');
    },

    updateMyProfile: (teacherData) => {
        return request('/teachers/update-me', {
            method: 'PUT',
            body: JSON.stringify(teacherData)
        });
    }
};

export default teacherService;
