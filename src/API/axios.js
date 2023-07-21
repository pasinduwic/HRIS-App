import axios from "axios";

export default axios.create({
  baseURL: "https://hris-backend-l8by.onrender.com"
});
export const axiosPrivate = axios.create({
  baseURL: "https://hris-backend-l8by.onrender.com",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});
