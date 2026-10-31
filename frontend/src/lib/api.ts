import axios from "axios";

const API_BASE = "https://backend-75ws91ube-truces-projects.vercel.app/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");
