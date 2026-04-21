import axios from "axios";

const BASE_URL = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// ✅ FIX: attach token ONLY for protected APIs
BASE_URL.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); // ✅ use correct key

  // ❌ Skip token for login & register
  if (
    token &&
    config.url !== "login/" &&
    config.url !== "register/"
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default BASE_URL;