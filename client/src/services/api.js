import axios from "axios";

const api = axios.create({
  baseURL: "https://adgpt-backend.onrender.com", // ✅ only /api
  withCredentials: true
});

export default api;
