import axios from "axios";

const api = axios.create({
  baseURL: "https://adgpts.vercel.app/login", // ✅ only /api
  withCredentials: true
});

export default api;
