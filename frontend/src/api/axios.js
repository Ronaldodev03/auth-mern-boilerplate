import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper: verifica si debemos redirigir al usuario a login
const shouldRedirectToLogin = (error) => {
  // Solo procesamos errores 401 (no autorizado)
  if (error.response?.status !== 401) return false;

  // No redirigir si ya estamos en login/register
  const currentPath = window.location.pathname;
  if (
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/"
  ) {
    return false;
  }

  // No redirigir si la petición que falló es de autenticación (es normal que falle)
  const failedUrl = error.config?.url || "";
  if (failedUrl.includes("/auth/")) {
    return false;
  }

  // En cualquier otro caso, sí redirigir
  return true;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldRedirectToLogin(error)) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
