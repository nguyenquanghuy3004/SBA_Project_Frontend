import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
    return (
        <div className="landing-container">
            {/* Header / Navbar */}
            <header className="landing-header">
                <div className="logo">
                    <h2>GlobalTech University<span className="logo-dot">.</span></h2>
                </div>
                <nav className="landing-nav">
                    <a href="#home">Trang chủ</a>
                    <a href="#about">Giới thiệu</a>
                    <a href="#gallery">Thư viện ảnh</a>
                    <div className="auth-buttons">
                        <button className="login-btn" onClick={() => onNavigate('login')}>
                            Đăng nhập
                        </button>
                        <button className="register-btn" onClick={() => onNavigate('register')}>
                            Đăng ký
                        </button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-content">
                    <h1>Khát Vọng Đổi Thay</h1>
                    <p>Trải nghiệm môi trường giáo dục quốc tế, nơi ươm mầm các tài năng toàn cầu tại GlobalTech University.</p>
                    <button className="cta-btn" onClick={() => onNavigate('login')}>Bắt đầu ngay</button>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <h2>Khám phá GlobalTech University</h2>
                <div className="about-content">
                    <div className="about-text">
                        <h3>Sứ mệnh Kiến tạo Tương lai</h3>
                        <p>
                            GlobalTech University không chỉ là nơi truyền thụ kiến thức, mà là môi trường nuôi dưỡng những nhà lãnh đạo công nghệ tương lai. Chúng tôi tập trung vào thực tiễn, sự sáng tạo và kết nối toàn cầu.
                        </p>
                        <div className="features-grid">
                            <div className="feature-item">
                                <h4>🚀 Đào tạo 4.0</h4>
                                <p>Chương trình học luôn cập nhật theo xu hướng công nghệ mới nhất: AI, Blockchain, Cloud Computing.</p>
                            </div>
                            <div className="feature-item">
                                <h4>🌏 Trải nghiệm Quốc tế</h4>
                                <p>Liên kết với hơn 200 đại học hàng đầu thế giới, mở ra cơ hội trao đổi và học tập đa quốc gia.</p>
                            </div>
                            <div className="feature-item">
                                <h4>💼 Kết nối Doanh nghiệp</h4>
                                <p>Hệ sinh thái kết nối sâu rộng với các tập đoàn công nghệ lớn, đảm bảo đầu ra 100% việc làm.</p>
                            </div>
                            <div className="feature-item">
                                <h4>💡 Ươm mầm Khởi nghiệp</h4>
                                <p>Trung tâm Innovation Hub hỗ trợ sinh viên hiện thực hóa các ý tưởng khởi nghiệp ngay từ ghế nhà trường.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="facilities-section">
                    <h3>Cơ sở vật chất chuẩn Quốc tế</h3>
                    <div className="facilities-grid">
                        <div className="facility-card">
                            <img src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop" alt="Campus" />
                            <h4>Khuôn viên Xanh</h4>
                            <p>Môi trường học tập hòa mình vào thiên nhiên, hiện đại và thân thiện.</p>
                        </div>
                        <div className="facility-card">
                            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" alt="Lab" />
                            <h4>Phòng Lab Hiện đại</h4>
                            <p>Hệ thống máy tính cấu hình cao và các thiết bị thí nghiệm chuyên dụng.</p>
                        </div>
                        <div className="facility-card">
                            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop" alt="Library" />
                            <h4>Thư viện Số</h4>
                            <p>Hàng ngàn đầu sách và tài liệu điện tử truy cập miễn phí 24/7.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="gallery-section">
                <h2>Thư viện hình ảnh GlobalTech</h2>
                <div className="gallery-grid">
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop" alt="Academic" />
                        <p>Tòa nhà học thuật hiện đại</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop" alt="Students" />
                        <p>Khuôn viên học tập mở</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop" alt="Collab" />
                        <p>Thảo luận nhóm sôi nổi</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop" alt="Tech" />
                        <p>Giờ thực hành lập trình</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1565034946487-0d7150a2651c?q=80&w=600&auto=format&fit=crop" alt="Graduation" />
                        <p>Lễ tốt nghiệp rạng rỡ</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1541252260730-0412e3e216d5?q=80&w=600&auto=format&fit=crop" alt="Sports" />
                        <p>Hoạt động thể thao năng động</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop" alt="Class" />
                        <p>Giảng đường thông minh</p>
                    </div>
                    <div className="gallery-item">
                        <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop" alt="Event" />
                        <p>Sự kiện sinh viên quy mô lớn</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-col">
                        <h3>GlobalTech University</h3>
                        <p>Khát vọng đổi thay.</p>
                    </div>
                    <div className="footer-col">
                        <h3>Liên hệ</h3>
                        <p>📍 CS: Hà Nội, TP.HCM, Đà Nẵng</p>
                        <p>📞 Hotline: 1900 6868</p>
                        <p>📧 Email: contact@globaltech.edu.vn</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 GlobalTech University. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
