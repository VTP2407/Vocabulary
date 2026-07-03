import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.webp";
import bigLogoImg from "../../assets/big_logo.webp";
import owlAvatar from "../../assets/Owl.webp";
import {
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  LogoutOutlined,
  LoginOutlined,
  DownOutlined,
  CloseOutlined,
  CameraOutlined,
  LoadingOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined
} from "@ant-design/icons";
import userApi from "../../api/userApi";
import "./UserLayout.css";

function UserLayout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Học viên");
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Trạng thái cho Profile Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [userInfo, setUserInfo] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    avatarFile: null,
    avatarPreviewUrl: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Trạng thái cho Crop Modal
  const [cropSrc, setCropSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const VIEWPORT_SIZE = 280;

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const getRenderParams = () => {
    if (!imageSize.width || !imageSize.height) {
      return { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, baseScale: 1 };
    }
    const scaleX = VIEWPORT_SIZE / imageSize.width;
    const scaleY = VIEWPORT_SIZE / imageSize.height;
    const baseScale = Math.max(scaleX, scaleY);

    const renderedWidth = imageSize.width * baseScale * zoom;
    const renderedHeight = imageSize.height * baseScale * zoom;

    const maxOffsetX = Math.max(0, (renderedWidth - VIEWPORT_SIZE) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - VIEWPORT_SIZE) / 2);

    return {
      width: renderedWidth,
      height: renderedHeight,
      minX: -maxOffsetX,
      maxX: maxOffsetX,
      minY: -maxOffsetY,
      maxY: maxOffsetY,
      baseScale
    };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const { minX, maxX, minY, maxY } = getRenderParams();
    setOffset({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const { minX, maxX, minY, maxY } = getRenderParams();
    setOffset({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleConfirmCrop = () => {
    if (!cropSrc) return;

    const img = new Image();
    img.src = cropSrc;
    img.onload = () => {
      const { baseScale } = getRenderParams();
      const scale = baseScale * zoom;

      const imgRenderedLeft = (VIEWPORT_SIZE - imageSize.width * scale) / 2 + offset.x;
      const imgRenderedTop = (VIEWPORT_SIZE - imageSize.height * scale) / 2 + offset.y;

      const srcRenderedX = -imgRenderedLeft;
      const srcRenderedY = -imgRenderedTop;

      const sx = srcRenderedX / scale;
      const sy = srcRenderedY / scale;
      const sw = VIEWPORT_SIZE / scale;
      const sh = VIEWPORT_SIZE / scale;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 400, 400);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const croppedFile = new File([blob], "cropped_avatar.png", { type: "image/png" });
        const previewUrl = URL.createObjectURL(blob);

        setEditForm((prev) => ({
          ...prev,
          avatarFile: croppedFile,
          avatarPreviewUrl: previewUrl
        }));

        setIsEditing(true);
        setIsCropModalOpen(false);
        setCropSrc(null);
      }, "image/png");
    };
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false);
    setCropSrc(null);
  };

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    if (!imageSize.width || !imageSize.height) return;
    const scaleX = VIEWPORT_SIZE / imageSize.width;
    const scaleY = VIEWPORT_SIZE / imageSize.height;
    const baseScale = Math.max(scaleX, scaleY);

    const renderedWidth = imageSize.width * baseScale * newZoom;
    const renderedHeight = imageSize.height * baseScale * newZoom;

    const maxOffsetX = Math.max(0, (renderedWidth - VIEWPORT_SIZE) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - VIEWPORT_SIZE) / 2);

    setOffset(prev => ({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y))
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatar");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("username_login");
    setIsLoggedIn(false);
    setAvatarUrl(null);
    window.location.href = "/";
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const parts = token.split(".");
      if (parts.length < 3) return null;
      const base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if missing to avoid atob decoding issues
      while (base64.length % 4) {
        base64 += "=";
      }
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      console.log(payload);
      // Check if token has expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        console.warn("Token đã hết hạn sử dụng.");
        return null;
      }

      return payload.userId || payload.sub || payload.id || null;
    } catch (error) {
      console.error("Lỗi giải mã token lấy userId:", error);
      return null;
    }
  };

  // Hàm lấy thông tin từ localStorage
  const getUserFromStorage = () => {
    const userId = getUserIdFromToken() || localStorage.getItem("userId") || "";
    const name = localStorage.getItem("username") || "Học viên";
    const fullName = localStorage.getItem("fullName") || name;
    const email = localStorage.getItem("email") || "";
    const avatar = localStorage.getItem("avatar") || "";
    return {
      userId,
      username: localStorage.getItem("username_login") || name, // Fallback nếu có lưu tên tài khoản riêng biệt
      fullName,
      email,
      avatar
    };
  };

  const decodeTokenAndFetchName = async () => {
    const userId = getUserIdFromToken();
    if (userId) {
      localStorage.setItem("userId", userId);
      try {
        const info = await userApi.getMyInfo();
        if (info) {
          const displayName = info.fullName || info.username || "Học viên";
          setUsername(displayName);

          localStorage.setItem("username", displayName);
          if (info.fullName) {
            localStorage.setItem("fullName", info.fullName);
          }
          if (info.email) {
            localStorage.setItem("email", info.email);
          }
          if (info.imageUrl) {
            localStorage.setItem("avatar", info.imageUrl);
            setAvatarUrl(info.imageUrl);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng từ backend:", error);
        // Nếu token hết hạn hoặc không hợp lệ ở phía backend (401/403), tự động đăng xuất
        if (error.response?.status === 401 || error.response?.status === 403) {
          handleLogout();
        }
      }
    } else {
      // Nếu không lấy được userId từ token (token hết hạn hoặc không hợp lệ), tự động đăng xuất
      handleLogout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);

      // Đọc nhanh thông tin đã lưu trong localStorage ra hiển thị trước
      const cachedUsername = localStorage.getItem("username");
      if (cachedUsername) {
        setUsername(cachedUsername);
      }
      const cachedAvatar = localStorage.getItem("avatar");
      if (cachedAvatar) {
        setAvatarUrl(cachedAvatar);
      }

      // Lần đầu tải trang để đồng bộ với Database
      decodeTokenAndFetchName();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // Mở Popup xem thông tin cá nhân từ localStorage (Không gọi API lấy dữ liệu)
  const handleOpenModal = () => {
    const data = getUserFromStorage();
    setUserInfo(data);
    setEditForm({
      fullName: data.fullName || "",
      email: data.email || "",
      avatarFile: null,
      avatarPreviewUrl: data.avatar || ""
    });

    // Reset password form
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    setIsModalOpen(true);
    setIsEditing(false);
    setIsChangingPassword(false);
    setMessage({ type: "", text: "" });
  };

  // Khi chọn ảnh đại diện mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCropSrc(previewUrl);
    setIsCropModalOpen(true);
    // Reset giá trị input để có thể chọn lại chính file đó nếu hủy
    e.target.value = null;
  };

  // Lưu thông tin cá nhân mới (Họ tên, Email, Avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const userId = userInfo?.userId || getUserIdFromToken();
    if (!userId) {
      setMessage({ type: "error", text: "Không tìm thấy thông tin đăng nhập." });
      return;
    }

    // Kiểm tra điền đầy đủ thông tin
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ Họ tên và Email." });
      return;
    }

    const hasNameChanged = editForm.fullName.trim() !== (localStorage.getItem("fullName") || "").trim();
    const hasAvatarChanged = editForm.avatarFile !== null;

    if (!hasNameChanged && !hasAvatarChanged) {
      setIsEditing(false);
      setMessage({ type: "success", text: "Thông tin không có thay đổi." });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let finalAvatarUrl = editForm.avatarPreviewUrl;
      let updatedUser = null;

      const promises = [];
      if (hasAvatarChanged) {
        promises.push(userApi.updateAvatar(userId, editForm.avatarFile));
      }
      if (hasNameChanged) {
        const updateData = {
          fullName: editForm.fullName.trim(),
          email: editForm.email.trim()
        };
        promises.push(userApi.updateUserInfo(userId, updateData));
      }

      const results = await Promise.all(promises);

      let resultIndex = 0;
      if (hasAvatarChanged) {
        const uploadRes = results[resultIndex++];
        finalAvatarUrl = uploadRes.url || finalAvatarUrl;
      }
      if (hasNameChanged) {
        updatedUser = results[resultIndex++];
      }

      const finalUserInfo = {
        ...userInfo,
        ...(updatedUser || {}),
        avatar: finalAvatarUrl
      };
      setUserInfo(finalUserInfo);

      // Cập nhật lại localStorage để giữ trạng thái đồng bộ
      const displayName = finalUserInfo.fullName || finalUserInfo.username || "Học viên";
      setUsername(displayName);
      localStorage.setItem("username", displayName);
      localStorage.setItem("fullName", finalUserInfo.fullName || "");
      localStorage.setItem("email", finalUserInfo.email || "");

      if (finalAvatarUrl) {
        setAvatarUrl(finalAvatarUrl);
        localStorage.setItem("avatar", finalAvatarUrl);
      }

      setMessage({ type: "success", text: "Cập nhật thông tin cá nhân thành công!" });

      setEditForm((prev) => ({
        ...prev,
        avatarFile: null
      }));

      // Quay trở lại giao diện xem thông tin sau 1.5s giống nút đổi mật khẩu
      setTimeout(() => {
        setIsEditing(false);
        setMessage({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin cá nhân:", error);
      const errorText = error.response?.data?.message || error.response?.data || error.message || "Cập nhật thất bại. Vui lòng thử lại!";
      setMessage({ type: "error", text: `Lỗi: ${errorText}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Đổi mật khẩu (Gọi API đổi mật khẩu riêng biệt)
  const handleSavePassword = async (e) => {
    e.preventDefault();
    const userId = userInfo?.userId || getUserIdFromToken();
    if (!userId) {
      setMessage({ type: "error", text: "Không tìm thấy thông tin đăng nhập." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp!" });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await userApi.changePassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      // Quay trở lại giao diện xem thông tin
      setTimeout(() => {
        setIsChangingPassword(false);
        setMessage({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="user-layout-container">
      {/* HEADER / NAVIGATION BAR */}
      <header className="app-header">
        <div className="header-content">
          {/* Logo */}
          <div className="header-left" onClick={() => navigate("/")}>
            <img src={bigLogoImg} alt="VTP Vocabulary Master" className="app-logo big-logo" />
            <img src={logoImg} alt="VTP Vocabulary Master" className="app-logo small-logo" />
          </div>

          {/* Navigation Links (Taskbar) */}
          <nav className="header-middle">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              end
            >
              <HomeOutlined className="nav-icon" />
              <span className="nav-text">Trang chủ</span>
            </NavLink>
            <NavLink
              to="/library"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <BookOutlined className="nav-icon" />
              <span className="nav-text">Thư viện</span>
            </NavLink>
            <NavLink
              to="/friend"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <TeamOutlined className="nav-icon" />
              <span className="nav-text">Bạn bè</span>
            </NavLink>
          </nav>

          {/* User Section (Right Side) */}
          <div className="header-right">
            {isLoggedIn ? (
              <div className="user-profile-wrapper">
                <div className="user-profile-info" onClick={handleOpenModal}>
                  <div className="avatar-frame">
                    <img src={avatarUrl || owlAvatar} alt="Owl avatar" className="user-avatar" />
                  </div>
                  <span className="welcome-text">Chào, {username}</span>
                  <DownOutlined className="dropdown-arrow-icon" />
                </div>
                {/* Logout Button right next to user profile */}
                <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
                  <LogoutOutlined className="btn-logout-icon" />
                  <span className="btn-text">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button className="btn-login" onClick={handleLoginRedirect}>
                <LoginOutlined />
                <span className="btn-text">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="app-main-content">
        <Outlet />
      </main>

      {/* PROFILE POPUP MODAL */}
      {isModalOpen && (
        <div className="profile-modal-overlay" onClick={() => !isSaving && setIsModalOpen(false)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>{isChangingPassword ? "Đổi mật khẩu" : "Thông tin cá nhân"}</h2>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => !isSaving && setIsModalOpen(false)}
                disabled={isSaving}
              >
                <CloseOutlined />
              </button>
            </div>

            {message.text && (
              <div className={`profile-modal-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {!userInfo ? (
              <div className="profile-modal-loading">
                <LoadingOutlined className="loading-spinner" />
                <p>Đang tải thông tin...</p>
              </div>
            ) : isChangingPassword ? (
              /* GIAO DIỆN ĐỔI MẬT KHẨU */
              <form onSubmit={handleSavePassword} className="profile-modal-form">
                <div className="profile-modal-body password-mode-body">
                  <div className="profile-modal-right">
                    <div className="form-group inline-group" style={{ alignItems: "flex-start" }}>
                      <label htmlFor="oldPassword" style={{ marginTop: "10px" }}>Mật khẩu cũ</label>
                      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <input
                          type="password"
                          id="oldPassword"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          disabled={isSaving}
                          className="form-control"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <span className="input-helper-text" style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", textAlign: "left" }}>
                          * Nếu chưa tạo mật khẩu thì không cần nhập
                        </span>
                      </div>
                    </div>

                    <div className="form-group inline-group">
                      <label htmlFor="newPassword">Mật khẩu mới</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        disabled={isSaving}
                        className="form-control"
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                    </div>

                    <div className="form-group inline-group">
                      <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        disabled={isSaving}
                        className="form-control"
                        placeholder="Xác nhận lại mật khẩu mới"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-modal-footer">
                  <button
                    type="submit"
                    className="btn-save btn-pwd-save"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <><LoadingOutlined /> Đang xử lý...</>
                    ) : (
                      <><LockOutlined /> Đổi mật khẩu</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                      setMessage({ type: "", text: "" });
                    }}
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              /* GIAO DIỆN XEM & SỬA THÔNG TIN CÁ NHÂN */
              <form onSubmit={handleSaveProfile} className="profile-modal-form">
                <div className="profile-modal-body">
                  {/* Cột bên trái: Ảnh đại diện */}
                  <div className="profile-modal-left">
                    <label
                      htmlFor={isEditing && !isSaving ? "avatar-file-input-direct" : undefined}
                      className={`profile-avatar-container ${isEditing ? "editable" : ""} ${editForm.avatarFile ? "avatar-changed" : ""}`}
                      title={isEditing ? "Chỉnh sửa ảnh đại diện" : undefined}
                    >
                      <img
                        src={editForm.avatarPreviewUrl || owlAvatar}
                        alt="User avatar preview"
                        className="profile-avatar-img"
                      />
                      {isEditing && !isSaving && (
                        <div className="avatar-upload-overlay">
                          <CameraOutlined className="camera-icon" />
                          <span>Đổi ảnh</span>
                        </div>
                      )}
                    </label>
                    <input
                      type="file"
                      id="avatar-file-input-direct"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Cột bên phải: Các trường thông tin */}
                  <div className="profile-modal-right">
                    <div className="form-group inline-group">
                      <label>Tên đăng nhập</label>
                      <input
                        type="text"
                        value={userInfo.username || ""}
                        disabled
                        className="form-control disabled-input"
                      />
                    </div>

                    <div className="form-group inline-group">
                      <label>Tên đầy đủ</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        disabled={!isEditing || isSaving}
                        className={`form-control ${!isEditing ? "readonly-input" : ""} ${isEditing && editForm.fullName.trim() !== (localStorage.getItem("fullName") || "").trim() ? "text-changed" : ""}`}
                        required
                      />
                    </div>

                    <div className="form-group inline-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        disabled
                        className="form-control disabled-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Nút bấm ở cuối */}
                <div className="profile-modal-footer">
                  {!isEditing ? (
                    <>
                      <button
                        key="btn-edit"
                        type="button"
                        className="btn-edit"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsEditing(true);
                          setMessage({ type: "", text: "" });
                        }}
                      >
                        <EditOutlined /> Sửa
                      </button>
                      <button
                        key="btn-change-password"
                        type="button"
                        className="btn-change-password"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsChangingPassword(true);
                          setMessage({ type: "", text: "" });
                        }}
                      >
                        <LockOutlined /> Đổi mật khẩu
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        key="btn-save"
                        type="submit"
                        className="btn-save"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <><LoadingOutlined /> Đang lưu...</>
                        ) : (
                          <><SaveOutlined /> Lưu</>
                        )}
                      </button>
                      <button
                        key="btn-cancel"
                        type="button"
                        className="btn-cancel"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsEditing(false);
                          setEditForm({
                            fullName: userInfo.fullName || "",
                            email: userInfo.email || "",
                            avatarFile: null,
                            avatarPreviewUrl: userInfo.avatar || ""
                          });
                          setMessage({ type: "", text: "" });
                        }}
                        disabled={isSaving}
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CROP MODAL */}
      {isCropModalOpen && (
        <div className="crop-modal-overlay" onClick={handleCancelCrop}>
          <div className="crop-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="crop-modal-header">
              <h3>Cắt ảnh đại diện</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={handleCancelCrop}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="crop-modal-body">
              <div className="crop-viewport-wrapper">
                <div
                  className="crop-viewport"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <img
                    src={cropSrc}
                    alt="Source to crop"
                    className="crop-image-element"
                    onLoad={handleImageLoad}
                    style={{
                      transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${getRenderParams().baseScale * zoom})`,
                    }}
                  />
                  <div className="crop-mask-overlay" />
                </div>
              </div>

              <div className="crop-slider-container">
                <div className="crop-slider-label">
                  <span>Thu phóng</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="crop-slider"
                />
              </div>
            </div>

            <div className="crop-modal-footer">
              <button
                type="button"
                className="btn-crop-confirm"
                onClick={handleConfirmCrop}
              >
                Xác nhận
              </button>
              <button
                type="button"
                className="btn-crop-cancel"
                onClick={handleCancelCrop}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserLayout;
