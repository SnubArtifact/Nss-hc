export const login = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  window.location.href = `${API_URL}/api/auth/google`;
};
