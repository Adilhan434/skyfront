import axios from "axios";

const apiUrl = "http://localhost:8000";

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Important! This sends cookies with requests
});

api.interceptors.request.use(
  (config) => {
    // No need to manually add Authorization header
    // Cookies are sent automatically with withCredentials: true

    // Логирование для отладки
    console.log("🚀 API Request:", config.method.toUpperCase(), config.url);
    console.log("📍 Full URL:", config.baseURL + config.url);
    console.log("🍪 Cookies will be sent automatically");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки 401 ошибок и автообновления токена
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        console.log("🔄 Token expired, attempting refresh...");
        await api.post("/accounts/token/refresh/");

        // Retry the original request
        console.log("✅ Token refreshed, retrying original request");
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.log("❌ Refresh failed, redirecting to login");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.log("❌ API Error:", error.response.status, error.config.url);
      console.log("📦 Error Data:", error.response.data);
    } else {
      console.log("❌ Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
