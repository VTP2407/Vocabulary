import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    const publicUrls = [
    "/api/auth/login",
    "/api/auth/register",
    ];

    if (token && !publicUrls.includes(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;