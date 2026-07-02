import axiosClient from "./axiosClient";

const authApi = {
    login: async (data) => {
        const response = await axiosClient.post("/api/auth/login", data);
        return response.data;
    },
    register: async (data) => {
        const response = await axiosClient.post("/api/auth/register", data);
        return response.data;
    },
    googleLogin: async (data) => {
        const response = await axiosClient.post("/api/auth/google", data);
        return response.data;
    }
}

export default authApi;