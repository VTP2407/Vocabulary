import { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../../api/authApi";
import logoImg from "../../assets/big_logo.webp";
import bookStackImg from "../../assets/book_stack.webp";
import documentImg from "../../assets/Owl.webp";
import { GoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import "./register.css";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !email || !password || !rePassword) {
            setErrorMsg("Vui lòng nhập đầy đủ các thông tin.");
            return;
        }
        if (password !== rePassword) {
            setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
            return;
        }
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);
        try {
            await authApi.register({ username, password, rePassword, email });
            setSuccessMsg("Đăng ký thành công! Đang chuyển hướng đăng nhập...");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        }
        catch (error) {
            console.error(error);
            setErrorMsg(
                error.response?.data?.message ||
                error.message ||
                "Đăng ký không thành công. Vui lòng thử lại."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialRegister = (platform) => {
        console.log(`Đăng ký bằng mạng xã hội: ${platform}`);
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;

            console.log("Google ID Token:", idToken);

            const response = await authApi.googleLogin({ idToken });

            console.log("Backend response:", response);

            const appToken = response.token;

            localStorage.setItem("token", appToken);
            localStorage.setItem("tokenType", response.tokenType);

            // Chuyển hướng thẳng về trang chủ sau khi đăng nhập Google thành công
            window.location.href = "/";
        } catch (error) {
            console.error("Google login failed:", error);
            message.error("Đăng nhập Google thất bại");
        }
    };

    return (
        <div className="login-page-wrapper register-page-wrapper">
            {/* LEFT COLUMN - DESKTOP ONLY */}
            <div className="login-left">
                <img
                    src={logoImg}
                    alt="VTP Vocabulary Master Logo"
                    className="logo-image"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                />
                <h1 className="login-heading">Empowering your English learning journey</h1>
                <p className="login-description">
                    Empowering your English learning journey with customized courses, personalized evaluations, and collaborative learning on our platform.
                </p>
                <div className="illustration-container">
                    <img
                        src={bookStackImg}
                        alt="Book Stack"
                        className="book-image"
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    <img
                        src={documentImg}
                        alt="Mascot Owl"
                        className="owl-image"
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>
                {/* <div className="footer-links">
                    <a href="#official" onClick={(e) => e.preventDefault()}>Official link</a>
                    <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </div> */}
            </div>

            {/* RIGHT COLUMN - COMMON PANEL */}
            <div className="login-right">
                {/* Mobile-only logo */}
                <img
                    src={logoImg}
                    alt="VTP Vocabulary Master Logo"
                    className="mobile-logo"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                />
                <h2 className="right-heading">Đăng ký tài khoản mới</h2>

                {/* Register Card */}
                <div className="login-card">
                    {errorMsg && <div className="login-error">{errorMsg}</div>}
                    {successMsg && <div className="login-error" style={{ backgroundColor: "#ecfdf5", borderColor: "#a7f3d0", color: "#059669" }}>{successMsg}</div>}

                    <form onSubmit={handleRegister} className="login-form">
                        {/* Username Input */}
                        <div className="input-group">
                            <span className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Tên tài khoản hoặc Tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="input-group">
                            <span className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="login-input password-input-wrapper"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Re-enter Password Input */}
                        <div className="input-group">
                            <span className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </span>
                            <input
                                type={showRePassword ? "text" : "password"}
                                className="login-input password-input-wrapper"
                                placeholder="Nhập lại mật khẩu"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowRePassword(!showRePassword)}
                            >
                                {showRePassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Email Input */}
                        <div className="input-group">
                            <span className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                className="login-input"
                                placeholder="Địa chỉ Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
                        </button>
                    </form>

                    {/* Social Divider */}
                    <div className="social-divider">
                        <span className="social-divider-text">Hoặc đăng ký bằng</span>
                    </div>

                    {/* Social List */}
                    <div className="social-list">
                        <div className="google-login-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GoogleLogin
                                type="icon"
                                shape="circle"
                                size="large"
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                    message.error("Đăng nhập Google thất bại");
                                }}
                            />
                        </div>
                        {/* <button className="social-item" onClick={() => handleSocialRegister("Facebook")} aria-label="Đăng ký bằng Facebook">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </button>
                        <button className="social-item" onClick={() => handleSocialRegister("Apple")} aria-label="Đăng ký bằng Apple">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.24-.55 3-1.42z" />
                            </svg>
                        </button>
                        <button className="social-item" onClick={() => handleSocialRegister("Guest")} aria-label="Đăng ký với tư cách Khách">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ca6c6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </button> */}
                    </div>
                </div>

                {/* Register Prompt (Link back to login) */}
                <div className="register-prompt">
                    Đã có tài khoản?
                    <Link to="/login">Đăng nhập ngay!</Link>
                </div>

                {/* Mobile layout bottom teal bar decoration */}
                {/* <div className="mobile-bottom-bar" /> */}
            </div>
        </div>
    );
}

export default RegisterPage;