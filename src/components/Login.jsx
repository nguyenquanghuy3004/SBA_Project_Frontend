import React, { useState } from "react";
import authService from "../services/authService";
import "../Auth.css";

const Login = ({ onLoginSuccess, toggleAuth }) => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await authService.login(formData.username, formData.password);
            onLoginSuccess(data);
        } catch (err) {
            setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <h2>Đăng nhập</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Nhập mật khẩu"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
            <p className="auth-footer">
                Chưa có tài khoản?{" "}
                <span className="toggle-link" onClick={toggleAuth}>
                    Đăng ký ngay
                </span>
            </p>
        </div>
    );
};

export default Login;
