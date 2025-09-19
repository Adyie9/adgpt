import axios from "axios";

const api = axios.create({
  baseURL: "https://adgpts.vercel.app/", // ✅ only /api
  withCredentials: true
});

export default api;
