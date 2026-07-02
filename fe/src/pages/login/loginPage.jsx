import { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../../api/authApi";
import logoImg from "../../assets/big_logo.webp";
import bookStackImg from "../../assets/book_stack.webp";
import documentImg from "../../assets/Owl.webp";
import { Space, Button, message } from "antd";
import { FacebookFilled, AppleFilled, UserOutlined } from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import "./loginPage.css";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setErrorMsg("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
            return;
        }
        setErrorMsg("");
        setIsLoading(true);
        try {
            const data = await authApi.login({ username, password });
            localStorage.setItem("token", data.token);
            // Reload page or handle auth state update
            window.location.href = "/";
        }
        catch (error) {
            console.error(error);
            setErrorMsg(
                error.response?.data?.message ||
                error.message ||
                "Tên tài khoản hoặc mật khẩu không chính xác."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (platform) => {
        console.log(`Đăng nhập bằng mạng xã hội: ${platform}`);
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
            
            // Chuyển hướng người dùng về trang chủ sau khi đăng nhập thành công
            window.location.href = "/";
        } catch (error) {
            console.error("Google login failed:", error);
        }
    }

    return (
        <div className="login-page-wrapper">
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
                    Empowering your English learning journey with courses and estimate lonal for sőncrating and collabo learning vid irutform.
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

                <h2 className="right-heading">Chào mừng bạn trở lại!</h2>
                <p className="right-subheading">Đăng nhập để tiếp tục học từ vựng mới mỗi ngày.</p>

                {/* Login Card */}
                <div className="login-card">
                    {errorMsg && <div className="login-error">{errorMsg}</div>}

                    <form onSubmit={handleLogin} className="login-form">
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
                                placeholder="Tên tài khoản hoặc Email"
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

                        {/* Forgot Password Link */}
                        <a href="#forgot" className="forgot-password" onClick={(e) => e.preventDefault()}>
                            Quên mật khẩu?
                        </a>

                        {/* Submit Button */}
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
                        </button>
                    </form>

                    {/* Social Divider */}
                    <div className="social-divider">
                        <span className="social-divider-text">Hoặc đăng nhập bằng</span>
                    </div>

                    {/* Social List */}
                    <div className="social-list">
                        <Space size="middle" align="center">
                            <div className="google-login-icon">
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

                            {/* <Button
                                shape="circle"
                                size="large"
                                icon={<FacebookFilled />}
                                aria-label="Đăng nhập bằng Facebook"
                                onClick={() => handleSocialLogin("Facebook")}
                            /> */}

                            {/* <Button
                                shape="circle"
                                size="large"
                                icon={<AppleFilled />}
                                aria-label="Đăng nhập bằng Apple"
                                onClick={() => handleSocialLogin("Apple")}
                            /> */}

                            {/* <Button
                                shape="circle"
                                size="large"
                                icon={<UserOutlined />}
                                aria-label="Đăng nhập với tư cách Khách"
                                onClick={() => handleSocialLogin("Guest")}
                            /> */}
                        </Space>
                    </div>
                </div>

                {/* Register Link */}
                <div className="register-prompt">
                    Chưa có tài khoản?
                    <Link to="/register">Đăng ký ngay!</Link>
                </div>

                {/* Mobile layout bottom teal bar decoration */}
                {/* <div className="mobile-bottom-bar" /> */}
            </div>
        </div>
    );
}

export default LoginPage;
