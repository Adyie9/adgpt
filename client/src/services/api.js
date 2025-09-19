import axios from "axios";

const api = axios.create({
  baseURL: "https://adgpts.vercel.app/api", // ✅ only /api
  withCredentials: true
});

export default api;
