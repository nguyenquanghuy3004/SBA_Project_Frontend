import React, { useState, useEffect } from "react";
import teacherService from "../services/teacherService";
import notificationService from "../services/notificationService";

const AdminNotification = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // "all" = gửi tất cả, hoặc teacherId cụ thể
    const [selectedTarget, setSelectedTarget] = useState("all");

    const [form, setForm] = useState({ title: "", message: "" });

    // toast notification UI
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await teacherService.getAllTeachers();
                setTeachers(data);
            } catch (err) {
                showToast("Không thể tải danh sách giáo viên: " + err.message, "error");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.department || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            showToast("Vui lòng nhập đầy đủ tiêu đề và nội dung.", "error");
            return;
        }
        setSending(true);
        try {
            if (selectedTarget === "all") {
                await notificationService.notifyAllTeachers(form.title, form.message);
                showToast(`✅ Đã gửi thông báo tới tất cả ${teachers.length} giáo viên!`);
            } else {
                await notificationService.notifyTeacher(selectedTarget, form.title, form.message);
                const teacher = teachers.find(t => t.id === selectedTarget);
                showToast(`✅ Đã gửi thông báo tới GV ${teacher?.fullName || ""}!`);
            }
            setForm({ title: "", message: "" });
        } catch (err) {
            showToast("Lỗi khi gửi: " + err.message, "error");
        } finally {
            setSending(false);
        }
    };

    const selectedTeacherInfo = selectedTarget !== "all"
        ? teachers.find(t => t.id === selectedTarget)
        : null;

    return (
        <div className="admin-notif-page">
            {/* Toast */}
            {toast && (
                <div className={`admin-toast ${toast.type}`}>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)}>✕</button>
                </div>
            )}

            <div className="admin-notif-layout">
                {/* LEFT – Chọn người nhận */}
                <div className="admin-notif-sidebar">
                    <div className="sidebar-header-notif">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Chọn người nhận
                        </h3>
                        <input
                            type="text"
                            placeholder="Tìm giáo viên..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="notif-search"
                        />
                    </div>

                    <div className="teacher-target-list">
                        {/* Option: Tất cả */}
                        <div
                            className={`teacher-target-item broadcast ${selectedTarget === "all" ? "selected" : ""}`}
                            onClick={() => setSelectedTarget("all")}
                        >
                            <div className="teacher-avatar broadcast-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z" />
                                    <path d="M10 8v8" />
                                    <path d="M14 8v8" />
                                    <path d="M6 8v8" />
                                </svg>
                            </div>
                            <div className="teacher-target-info">
                                <strong>Tất cả giáo viên</strong>
                                <span>{teachers.length} người nhận</span>
                            </div>
                            {selectedTarget === "all" && <div className="check-badge">✓</div>}
                        </div>

                        <div className="target-divider">
                            <span>Hoặc chọn cá nhân</span>
                        </div>

                        {loading ? (
                            <div className="loading-state">Đang tải...</div>
                        ) : (
                            filteredTeachers.map(t => (
                                <div
                                    key={t.id}
                                    className={`teacher-target-item ${selectedTarget === t.id ? "selected" : ""}`}
                                    onClick={() => setSelectedTarget(t.id)}
                                >
                                    <div className="teacher-avatar">
                                        {t.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="teacher-target-info">
                                        <strong>{t.fullName}</strong>
                                        <span>@{t.user?.username} · {t.department}</span>
                                    </div>
                                    {selectedTarget === t.id && <div className="check-badge">✓</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT – Form soạn thông báo */}
                <div className="admin-notif-compose">
                    <div className="compose-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Soạn thông báo
                        </h3>

                        {/* Hiển thị người nhận đã chọn */}
                        <div className="recipient-badge">
                            {selectedTarget === "all" ? (
                                <span className="badge-all">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                        <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z" />
                                    </svg>
                                    Gửi tới: Tất cả giáo viên ({teachers.length} người)
                                </span>
                            ) : (
                                <span className="badge-one">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Gửi tới: <strong>{selectedTeacherInfo?.fullName}</strong>
                                    &nbsp;· {selectedTeacherInfo?.department}
                                </span>
                            )}
                        </div>
                    </div>

                    <form className="notif-compose-form" onSubmit={handleSend}>
                        <div className="notif-form-group">
                            <label>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                Tiêu đề thông báo
                            </label>
                            <input
                                type="text"
                                placeholder="VD: Thông báo họp hội đồng, Cập nhật lịch giảng dạy..."
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                                maxLength={200}
                            />
                            <span className="char-count">{form.title.length}/200</span>
                        </div>

                        <div className="notif-form-group">
                            <label>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Nội dung chi tiết
                            </label>
                            <textarea
                                placeholder="Nhập nội dung thông báo đầy đủ ở đây. Bạn có thể mô tả chi tiết, địa điểm, thời gian, yêu cầu cụ thể..."
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                required
                                maxLength={1500}
                                rows={8}
                            />
                            <span className="char-count">{form.message.length}/1500</span>
                        </div>

                        <div className="compose-action-row">
                            <div className="compose-hint">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {selectedTarget === "all"
                                    ? `Thông báo sẽ được gửi ngay tới tất cả ${teachers.length} giáo viên.`
                                    : `Thông báo sẽ được gửi riêng tới GV ${selectedTeacherInfo?.fullName}.`}
                            </div>
                            <div className="compose-buttons">
                                <button
                                    type="button"
                                    className="clear-btn"
                                    onClick={() => setForm({ title: "", message: "" })}
                                    disabled={sending}
                                >
                                    Xóa nội dung
                                </button>
                                <button
                                    type="submit"
                                    className="send-notif-btn"
                                    disabled={sending}
                                >
                                    {sending ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            Gửi thông báo
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminNotification;
