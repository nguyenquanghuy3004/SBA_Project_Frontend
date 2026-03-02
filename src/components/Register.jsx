import React, { useState } from "react";
import authService from "../services/authService";
import "../Auth.css";

const Register = ({ onRegisterSuccess, toggleAuth }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);
        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: ["user"]
            };
            await authService.register(userData);
            setMessage("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
            setTimeout(() => {
                toggleAuth();
            }, 2000);
        } catch (err) {
            setError(err.message || "Đăng ký thất bại. Tên đăng nhập hoặc email đã được dùng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <h2>Đăng ký</h2>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Chọn tên đăng nhập"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Nhập địa chỉ email"
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
                        placeholder="Tạo mật khẩu"
                    />
                </div>
                <div className="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Nhập lại mật khẩu"
                    />
                </div>
                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Nhập số điện thoại"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
            </form>
            <p className="auth-footer">
                Đã có tài khoản?{" "}
                <span className="toggle-link" onClick={toggleAuth}>
                    Đăng nhập ngay
                </span>
            </p>
        </div>
    );
};

export default Register;
