import { request } from "./apiConfig";

const login = async (username, password) => {
    const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
    const token = data.accessToken || data.token;
    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
};

const register = async (userData) => {
    return await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });
};

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

export default {
    login,
    register,
    logout,
    getCurrentUser,
};
