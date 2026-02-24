const API_URL = "http://localhost:8080/api";

export const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const errorMessage = (typeof data === 'object' ? data.message : data) || response.statusText || "Request failed";
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return data;
};

export default API_URL;
