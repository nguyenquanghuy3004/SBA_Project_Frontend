const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


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
        let errorMessage = "Đã có lỗi xảy ra (Request failed)";

        if (typeof data === 'object' && data !== null) {
            errorMessage = data.message || data.error || data.details || JSON.stringify(data);
        } else if (typeof data === 'string' && data.trim().length > 0) {
            errorMessage = data;
        } else if (response.statusText) {
            errorMessage = `${response.statusText} (Mã lỗi: ${response.status})`;
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return data;
};

export default API_URL;
