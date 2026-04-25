

import axios from "axios";

const BASE_URL = axios.create({
  baseURL: "https://project-management-backend-yo7k.onrender.com/api/",
});

// ✅ REQUEST: attach token
BASE_URL.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ RESPONSE: handle expired token
BASE_URL.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 If token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        const res = await axios.post(
          "https://project-management-backend-yo7k.onrender.com/api/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);

        // 🔁 retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return BASE_URL(originalRequest);

      } catch (err) {
        console.log("Refresh failed");

        // ❌ logout user
        localStorage.clear();
        window.location.href = "/";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default BASE_URL;
