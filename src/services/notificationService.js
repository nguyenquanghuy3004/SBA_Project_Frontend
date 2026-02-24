import { request } from "./apiConfig";

const notificationService = {
    getMyNotifications: () => request("/notifications"),

    getUnreadCount: () => request("/notifications/unread-count"),

    markAsRead: (id) => request(`/notifications/${id}/read`, {
        method: "PUT"
    }),
    notifyClass: (classId, title, message) => request(`/notifications/class/${classId}`, {
        method: "POST",
        body: JSON.stringify({ title, message })
    })
};

export default notificationService;
