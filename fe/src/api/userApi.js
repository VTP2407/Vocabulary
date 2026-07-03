import axiosClient from "./axiosClient";

const userApi = {
    // API lấy thông tin người dùng dựa theo token của session hiện tại
    getMyInfo: async () => {
        const response = await axiosClient.get("/api/user-info/my");
        return response.data;
    },

    // API cập nhật thông tin cá nhân của người dùng (fullName, email, mật khẩu mới)
    // Backend nhận dữ liệu dạng JSON gửi bằng phương thức PUT:
    // PUT /api/user-info/{userId}
    // Body JSON:
    // {
    //    "fullName": "Tên Mới",
    //    "email": "email_moi@example.com",
    //    "password": "mat_khau_moi_neu_co" // Nếu không thay đổi mật khẩu thì trường này truyền rỗng hoặc bỏ qua ở backend
    // }
    // Trả về thông tin người dùng đã cập nhật dạng JSON:
    // {
    //    "userId": 1,
    //    "username": "ten_dang_nhap",
    //    "fullName": "Tên Mới",
    //    "email": "email_moi@example.com"
    // }
    updateUserInfo: async (userId, data) => {
        const storedFullName = localStorage.getItem("fullName") || "";
        const storedEmail = localStorage.getItem("email") || "";
        const storedUsername = localStorage.getItem("username_login") || localStorage.getItem("username") || "";

        const hasNameChanged = data.fullName !== undefined && data.fullName.trim() !== storedFullName.trim();

        if (!hasNameChanged) {
            // Không có thay đổi so với localStorage, trả về dữ liệu cũ để báo thành công luôn
            return {
                userId,
                username: storedUsername,
                fullName: storedFullName,
                email: storedEmail
            };
        }

        const response = await axiosClient.put("/api/user-info", {
            fullName: data.fullName.trim()
        });
        return response.data;
    },

    // API tải lên ảnh đại diện của người dùng
    // Backend nhận dữ liệu dạng MultipartFile gửi bằng phương thức PUT:
    // PUT /api/user-info/avatar
    // Body Form-Data:
    //    key: "file" (file hình ảnh)
    // Trả về thông tin đường dẫn avatar mới dạng JSON:
    // {
    //    "url": "url_anh_moi"
    // }
    updateAvatar: async (userId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axiosClient.put("/api/user-info/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    // API đổi mật khẩu của người dùng
    // Backend nhận dữ liệu dạng JSON gửi bằng phương thức POST:
    // POST /api/user-info/change-password
    // Body JSON:
    // {
    //    "oldPassword": "mat_khau_cu",
    //    "newPassword": "mat_khau_moi",
    //    "reNewPassword": "xac_nhan_mat_khau_moi"
    // }
    changePassword: async (userId, data) => {
        const response = await axiosClient.post("/api/user-info/change-password", {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            reNewPassword: data.confirmPassword
        });
        return response.data;
    }
};

export default userApi;
